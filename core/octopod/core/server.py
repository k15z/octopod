import json
import requests

from redis import Redis
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel

from octopod.config import config
from octopod.core.content.router import router as content_router
from octopod.core.creator.router import router as creator_router
from octopod.core.user.router import router as user_router

redis = Redis(host=config.REDIS_HOST)

app = FastAPI(
    title="Octopod",
    root_path=config.PROXY_PASS_ROOT,
    generate_unique_id_function=lambda route: route.endpoint.__name__,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(content_router)
app.include_router(creator_router)
app.include_router(user_router)


class BTCPrice(BaseModel):
    USD: float


@app.get("/btc_price")
def btc_price() -> BTCPrice:
    if data := redis.get("btc_price"):
        return BTCPrice(**json.loads(data))  # type: ignore

    data = requests.get("https://api.coindesk.com/v1/bpi/currentprice.json").json()
    result = BTCPrice(
        USD=data["bpi"]["USD"]["rate_float"],
    )
    redis.set(
        "btc_price",
        result.model_dump_json(),
        ex=60,
    )
    return result
