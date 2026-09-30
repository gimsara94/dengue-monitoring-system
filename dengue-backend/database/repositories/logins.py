from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


async def create(db: AsyncSession, *, username: str, password_hash: str, role: str) -> dict[str, Any]:
    stmt = text(
        """
        INSERT INTO logins (username, password_hash, role)
        VALUES (:u, :p, :r)
        RETURNING id, username, role, created_at
        """
    )
    res = await db.execute(stmt, {"u": username, "p": password_hash, "r": role})
    row = res.mappings().one()
    await db.commit()
    return dict(row)


async def get_by_username(db: AsyncSession, username: str) -> Optional[dict[str, Any]]:
    stmt = text(
        """
        SELECT id, username, password_hash, role, created_at
        FROM logins
        WHERE username = :u
        """
    )
    res = await db.execute(stmt, {"u": username})
    row = res.mappings().first()
    return dict(row) if row else None


async def get_by_id(db: AsyncSession, login_id: int) -> Optional[dict[str, Any]]:
    stmt = text(
        """
        SELECT id, username, password_hash, role, created_at
        FROM logins
        WHERE id = :id
        """
    )
    res = await db.execute(stmt, {"id": login_id})
    row = res.mappings().first()
    return dict(row) if row else None


async def list_all(db: AsyncSession) -> list[dict[str, Any]]:
    stmt = text(
        """
        SELECT id, username, role, created_at
        FROM logins
        ORDER BY id ASC
        """
    )
    res = await db.execute(stmt)
    return [dict(r) for r in res.mappings().all()]
