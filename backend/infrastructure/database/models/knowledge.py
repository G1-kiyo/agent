from sqlalchemy import BigInteger,DateTime,ForeignKey,PrimaryKeyConstraint
from .base import Base
from sqlalchemy.orm import Mapped, mapped_column,relationship
from sqlalchemy import Table,Column
from datetime import datetime
from typing import List

knowledge_tag = Table(
    "knowledge_tag",
    Base.metadata,
    Column("knowledge_id",ForeignKey("knowledge.id",ondelete="CASCADE")),
    Column("tag_id",ForeignKey("tag.id",ondelete="CASCADE")),
    PrimaryKeyConstraint("knowledge_id","tag_id")
)

class Knowledge(Base):
    __tablename__ = "knowledge"

    id: Mapped[int] = mapped_column(BigInteger,primary_key=True)
    title: Mapped[str] = mapped_column(nullable=False,unique=True)
    summary: Mapped[str] = mapped_column(nullable=False)
    source: Mapped[str] = mapped_column(nullable=False)
    source_url:Mapped[str] = mapped_column(nullable=True)
    create_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user_id:Mapped[int] = mapped_column(BigInteger,ForeignKey("user.id"))
    tags:Mapped[List["Tag"]] = relationship(secondary=knowledge_tag,back_populates="knowledge")


class Tag(Base):
    __tablename__ = "tag"

    id: Mapped[int] = mapped_column(BigInteger,primary_key=True)
    tag_name:Mapped[str] = mapped_column(nullable=False,unique=True)

    knowledge:Mapped[List["Knowledge"]] = relationship(secondary=knowledge_tag,back_populates="tags")


    