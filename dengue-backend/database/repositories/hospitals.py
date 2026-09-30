from pathlib import Path
from typing import Any, Dict, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

BASE_DIR = Path(__file__).resolve().parents[1]
Q_DIR = BASE_DIR / "queries" / "hospitals"

SQL_CREATE = (Q_DIR / "create.sql").read_text(encoding="utf-8")
SQL_LIST = (Q_DIR / "list.sql").read_text(encoding="utf-8")
SQL_GET = (Q_DIR / "get_by_id.sql").read_text(encoding="utf-8")
SQL_UPDATE = (Q_DIR / "update.sql").read_text(encoding="utf-8")
SQL_DELETE = (Q_DIR / "delete.sql").read_text(encoding="utf-8")


async def create(db: AsyncSession, data: Dict[str, Any]) -> Dict[str, Any]:
    res = await db.execute(text(SQL_CREATE), data)
    row = res.mappings().first()
    await db.commit()
    return dict(row)  # type: ignore[arg-type]


async def list_all(db: AsyncSession) -> list[Dict[str, Any]]:
    res = await db.execute(text(SQL_LIST))
    return [dict(r) for r in res.mappings().all()]


async def get_by_id(db: AsyncSession, hospital_id: int) -> Optional[Dict[str, Any]]:
    res = await db.execute(text(SQL_GET), {"id": hospital_id})
    row = res.mappings().first()
    return dict(row) if row else None


async def update(db: AsyncSession, hospital_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    payload = {"id": hospital_id, **data}
    res = await db.execute(text(SQL_UPDATE), payload)
    row = res.mappings().first()
    await db.commit()
    return dict(row) if row else None


async def delete(db: AsyncSession, hospital_id: int) -> bool:
    await db.execute(text(SQL_DELETE), {"id": hospital_id})
    await db.commit()
    return True
