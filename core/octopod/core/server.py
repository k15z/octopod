from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from octopod.config import config
from octopod.core.content.router import router as content_router
from octopod.core.creator.router import router as creator_router
from octopod.core.user.router import router as user_router

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
