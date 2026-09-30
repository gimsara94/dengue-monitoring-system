from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def add(db: AsyncSession, *, hospital_id: int, ward_id: int, doctor_id: int) -> dict[str, Any]:
    stmt = text(
        """
        INSERT INTO ward_doctors (hospital_id, ward_id, doctor_id)
        VALUES (:hid, :wid, :did)
        ON CONFLICT DO NOTHING
        RETURNING hospital_id, ward_id, doctor_id
        """
    )
    res = await db.execute(stmt, {"hid": hospital_id, "wid": ward_id, "did": doctor_id})
    row = res.mappings().first()
    await db.commit()
    # If already existed, return a consistent payload
    return dict(row) if row else {"hospital_id": hospital_id, "ward_id": ward_id, "doctor_id": doctor_id}


async def remove(db: AsyncSession, *, hospital_id: int, ward_id: int, doctor_id: int) -> bool:
    stmt = text(
        """
        DELETE FROM ward_doctors
        WHERE hospital_id = :hid AND ward_id = :wid AND doctor_id = :did
        """
    )
    await db.execute(stmt, {"hid": hospital_id, "wid": ward_id, "did": doctor_id})
    await db.commit()
    return True


async def list_doctors(db: AsyncSession, *, hospital_id: int, ward_id: int) -> list[dict[str, Any]]:
    stmt = text(
        """
        SELECT d.id, d.hospital_id, d.name, d.telephone, d.nic_no, d.address, d.email, d.login_id
        FROM ward_doctors wd
        JOIN doctors d ON d.id = wd.doctor_id
        WHERE wd.hospital_id = :hid AND wd.ward_id = :wid
        ORDER BY d.name
        """
    )
    res = await db.execute(stmt, {"hid": hospital_id, "wid": ward_id})
    return [dict(r) for r in res.mappings().all()]
