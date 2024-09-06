from pydantic import (
    Field,
    PostgresDsn,
    field_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):

    AWS_ACCESS_KEY_ID: str = "minio"
    AWS_SECRET_ACCESS_KEY: str = "minio123"
    AWS_S3_BUCKET: str = "uploads"

    JWT_SECRET_KEY: str = ""

    REDIS_HOST: str = Field(default="localhost")

    POSTGRES_DSN: PostgresDsn = Field(
        default="postgres://postgres:postgres@localhost:5432/octopod",
    )

    @field_validator("POSTGRES_DSN")
    @classmethod
    def convert_to_asyncpg(cls, v: PostgresDsn) -> PostgresDsn:
        dsn = v.unicode_string().replace("postgres://", "postgresql+asyncpg://")
        return PostgresDsn(dsn)

    model_config = SettingsConfigDict(env_file=".env")


config = Config()
