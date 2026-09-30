from typing import Any, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def create(
    db: AsyncSession,
    *,
    hospital_id: int,
    name: str,
    telephone: str,
    nic_no: str,
    address: str,
    email: str,
    login_id: int | None = None,
) -> dict[str, Any]:
    stmt = text(
        """
        INSERT INTO doctors (hospital_id, name, telephone, nic_no, address, email, login_id)
        VALUES (:hid, :name, :tel, :nic, :addr, :email, :login_id)
        RETURNING id, hospital_id, name, telephone, nic_no, address, email, login_id
        """
    )
    res = await db.execute(
        stmt,
        {
            "hid": hospital_id,
            "name": name,
            "tel": telephone,
            "nic": nic_no,
            "addr": address,
            "email": email,
            "login_id": login_id,
        },
    )
    row = res.mappings().one()
    await db.commit()
    return dict(row)


async def get_by_id(db: AsyncSession, doctor_id: int) -> Optional[dict[str, Any]]:
    stmt = text(
        """
        SELECT id, hospital_id, name, telephone, nic_no, address, email, login_id
        FROM doctors
        WHERE id = :id
        """
    )
    res = await db.execute(stmt, {"id": doctor_id})
    row = res.mappings().first()
    return dict(row) if row else None


async def get_by_login_id(db: AsyncSession, login_id: int) -> Optional[dict[str, Any]]:
    stmt = text(
        """
        SELECT id, hospital_id, name, telephone, nic_no, address, email, login_id
        FROM doctors
        WHERE login_id = :lid
        """
    )
    res = await db.execute(stmt, {"lid": login_id})
    row = res.mappings().first()
    return dict(row) if row else None


async def update(
    db: AsyncSession,
    doctor_id: int,
    data: dict[str, Any],
) -> Optional[dict[str, Any]]:
    allowed = {"hospital_id", "name", "telephone", "nic_no", "address", "email"}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        return await get_by_id(db, doctor_id)

    sets = ", ".join([f"{k} = :{k}" for k in updates.keys()])
    stmt = text(
        f"""
        UPDATE doctors
        SET {sets}
        WHERE id = :id
        RETURNING id, hospital_id, name, telephone, nic_no, address, email, login_id
        """
    )
    payload = {"id": doctor_id, **updates}
    res = await db.execute(stmt, payload)
    row = res.mappings().first()
    await db.commit()
    return dict(row) if row else None


async def update_login_password(db: AsyncSession, *, login_id: int, password_hash: str) -> None:
    stmt = text("UPDATE logins SET password_hash = :p WHERE id = :id")
    await db.execute(stmt, {"p": password_hash, "id": login_id})
    await db.commit()
