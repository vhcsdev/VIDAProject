from datetime import datetime
from typing import Optional

from sqlalchemy import Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str] = mapped_column()
    voice: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Base64 encoded voice data"
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
