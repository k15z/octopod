# type: ignore
import asyncio
from dataclasses import dataclass
import websockets
import json
from urllib.parse import urlparse

from octopod.nwc.event import EncryptedDirectMessage, Event
from octopod.nwc.key import PrivateKey


@dataclass
class NWCConnection:
    relay: str
    lud16: str
    wallet_pubkey: str
    private_key: PrivateKey

    @classmethod
    def from_connection_string(cls, connection_str: str):
        uri = urlparse(connection_str)
        query = dict([part.split("=") for part in uri.query.split("&")])
        relay = query["relay"]
        secret = query["secret"]
        lud16 = query.get("lud16")
        wallet_pubkey = uri.hostname
        private_key = PrivateKey(bytes.fromhex(secret))
        return cls(relay, lud16, wallet_pubkey, private_key)

    def send_message_sync(self, nwc_method, nwc_params):
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            return asyncio.run(self.send_nwc_message(nwc_method, nwc_params))
        else:
            future = asyncio.ensure_future(
                self.send_nwc_message(nwc_method, nwc_params)
            )
            return loop.run_until_complete(future)

    async def send_nwc_message(self, nwc_method, nwc_params):
        # TODO: Refresh the connection if needed.
        async with websockets.connect(self.relay, ssl=True) as websocket:
            return await self._send_nwc_message(websocket, nwc_method, nwc_params)

    async def _send_nwc_message(
        self, websocket: websockets.WebSocketClientProtocol, method, params
    ):
        event = EncryptedDirectMessage(
            kind=23194,
            recipient_pubkey=self.wallet_pubkey,
            cleartext_content=json.dumps({"method": method, "params": params}),
        )
        event.sign_event(self.private_key)
        await websocket.send(event.to_message())
        await websocket.send(
            json.dumps(
                [
                    "REQ",
                    f"resp-{event.id}",
                    {
                        "authors": [self.wallet_pubkey],
                        "kinds": [23195],
                        "#e": [event.id],
                    },
                ]
            )
        )
        attempts = 0
        while attempts < 5:
            resp = json.loads(await websocket.recv())
            # print(f"Received: {json.dumps(resp, indent=2)}")
            if resp[0] == "EVENT":
                break
            attempts += 1
        resp_event = Event.from_message(resp)
        if not resp_event.verify():
            raise Exception("Failed to verify response event")
        decrypted_content = self.private_key.decrypt_message(
            resp_event.content, resp_event.public_key
        )
        return json.loads(decrypted_content)


async def send_to_uma(nwc_connection_uri: str, uma_address: str, amount_sat: int):
    connection = NWCConnection.from_connection_string(nwc_connection_uri)
    response = await connection.send_nwc_message(
        "pay_to_address",
        {
            "receiver": {"lud16": uma_address},
            "sending_currency_code": "SAT",
            "sending_currency_amount": amount_sat,
        },
    )
    return response
