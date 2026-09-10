from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import BigInteger
from .base import Base


# 声明user
class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(BigInteger,primary_key=True)
    username: Mapped[str] = mapped_column(unique=True, nullable=False)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)