from .base import Base
from sqlalchemy.orm import Mapped,mapped_column,relationship
from sqlalchemy import BigInteger,DateTime,ForeignKey,Enum,Integer
from api.schemas.discussion import Category,Reaction
from datetime import datetime
from typing import List
class Discussion(Base):
    __tablename__ = "discussion"
    id:Mapped[int] = mapped_column(BigInteger, primary_key=True)
    title:Mapped[str] = mapped_column(nullable=False,unique=True)
    category:Mapped[Category] = mapped_column(Integer, nullable=False)
    desc:Mapped[str] = mapped_column(nullable=False)
    create_at:Mapped[datetime] = mapped_column(DateTime(timezone=True),nullable=False)

    user_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("user.id"))

class Message(Base):
    __tablename__ = "message"

    id:Mapped[int] = mapped_column(BigInteger, primary_key=True)
    content:Mapped[str] = mapped_column(nullable=False)
    create_at:Mapped[datetime] = mapped_column(DateTime(timezone=True),nullable=False)

    user_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("user.id"))
    discussion_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("discussion.id"))

class Reply(Base):
    __tablename__ = "reply"

    id:Mapped[int] = mapped_column(BigInteger, primary_key=True)
    content:Mapped[str] = mapped_column(nullable=False)
    create_at:Mapped[datetime] = mapped_column(DateTime(timezone=True),nullable=False)

    user_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("user.id"))
    message_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("message.id"))
    discussion_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("discussion.id"))
    

class Reaction(Base):
    __tablename__ = "reaction"

    id:Mapped[int] = mapped_column(BigInteger, primary_key=True)
    type:Mapped[Reaction] = mapped_column(Integer, nullable=False, unique=True)
    content:Mapped[str] = mapped_column(nullable=False,unique=True)
    create_at:Mapped[datetime] = mapped_column(DateTime(timezone=True),nullable=False)

    user_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("user.id"))
    message_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("message.id"))
    discussion_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("discussion.id"))
    

