from time import time
from octopod.database import SessionLocal
from octopod.models import User
from urllib.parse import urlparse
import requests


async def refresh_nwc_token(user: User) -> str:
    if (
        user.nwc_refresh_token is None
        or user.access_token_expires_at is None
        or user.access_token_expires_at > time()
    ):
        return user.nwc_string

    if user.nwc_expires_at is not None and user.nwc_expires_at < time():
        # TODO: Probably throw an error here and require the user to re-connect their NWC.
        return user.nwc_string

    uma_address = urlparse(user.nwc_string).query.get("lud16")
    if uma_address is None:
        raise ValueError(
            "NWC connection does not contain an uma address. Can't refresh."
        )

    uma_parts = uma_address.split("@")
    if len(uma_parts) != 2:
        raise ValueError("Invalid uma address. Can't refresh.")
    _, uma_domain = uma_parts

    config_doc = await fetch_config_doc(uma_domain)
    token_endpoint = config_doc.get("token_endpoint")
    if token_endpoint is None:
        raise ValueError(
            "NWC provider does not contain a token endpoint. Can't refresh."
        )

    token_response = requests.post(
        token_endpoint,
        data={
            "grant_type": "refresh_token",
            "refresh_token": user.nwc_refresh_token,
            "client_id": "npub1scmpzl2ehnrtnhu289d9rfrwprau9z6ka0pmuhz6czj2ae5rpuhs2l4j9d wss://nos.lol",
        },
    )
    token_response.raise_for_status()
    token_json = token_response.json()
    access_token = token_json.get("access_token")
    access_token_expires_at = time() + token_json.get("expires_in", 0)
    nwc_string = token_json.get("nwc_connection_uri")
    nwc_expires_at = token_json.get("nwc_expires_at")

    with SessionLocal() as session:
        user.access_token = access_token
        user.access_token_expires_at = access_token_expires_at
        user.nwc_string = nwc_string
        user.nwc_expires_at = nwc_expires_at
        session.commit()

    return nwc_string


async def fetch_config_doc(domain: str) -> dict:
    url = f"https://{domain}/.well-known/uma-configuration"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()
