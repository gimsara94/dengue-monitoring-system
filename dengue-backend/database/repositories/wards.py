from typing import Any, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def get_by_login_id(db: AsyncSession, login_id: int) -> Optional[dict[str, Any]]:
    stmt = text(
        """
        SELECT hospital_id, ward_id, beds, login_id
        FROM wards
        WHERE login_id = :lid
        """
    )
    res = await db.execute(stmt, {"lid": login_id})
    row = res.mappings().first()
    return dict(row) if row else None
