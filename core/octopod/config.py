from pydantic import (
    Field,
    PostgresDsn,
    field_validator,
)
from pydantic_settings import BaseSettings


class Config(BaseSettings):

    S3_ENDPOINT_URL: str = "http://localhost:9000"
    S3_ACCESS_KEY_ID: str = "minio"
    S3_SECRET_ACCESS_KEY: str = "minio123"
    S3_UPLOAD_BUCKET: str = "uploads"

    REDIS_HOST: str = Field(default="localhost")

    POSTGRES_DSN: PostgresDsn = Field(
        default="postgres://postgres:postgres@localhost:5432/octopod",
    )

    @field_validator("POSTGRES_DSN")
    @classmethod
    def convert_to_asyncpg(cls, v: PostgresDsn) -> PostgresDsn:
        dsn = v.unicode_string().replace("postgres://", "postgresql+asyncpg://")
        return PostgresDsn(dsn)


config = Config()
