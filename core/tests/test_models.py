import pytest
from sqlalchemy.ext.asyncio import create_async_engine

from octopod.models import Base


@pytest.mark.asyncio
async def test_models_sqlite():
    """Test database model initialization."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
