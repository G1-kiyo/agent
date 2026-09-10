from enum import Enum
from pydantic import BaseModel,ConfigDict
from typing import Optional

class CategoryName(Enum):
    ALL = "全部"
    TECHNOLOGY = "技术"
    PRODUCT = "产品"
    DESIGN = "设计"
    TEAM = "团队"
    OTHER = "其他"


class Category(int, Enum):
    ALL = 0
    TECHNOLOGY = 1
    PRODUCT = 2
    DESIGN = 3
    TEAM = 4
    OTHER = 5

    @property
    def label(self):
        return {
            Category.ALL: "全部",
            Category.TECHNOLOGY: "技术",
            Category.PRODUCT: "产品",
            Category.DESIGN: "设计",
            Category.TEAM: "团队",
            Category.OTHER: "其他",
        }[self]

    @classmethod
    def to_chinesename(self, code):
        return {
            Category.ALL.value: "全部",
            Category.TECHNOLOGY.value: "技术",
            Category.PRODUCT.value: "产品",
            Category.DESIGN.value: "设计",
            Category.TEAM.value: "团队",
            Category.OTHER.value: "其他",
        }[code]

    @classmethod
    def to_code(self, chinesename):
        return {
            CategoryName.ALL.value: 0,
            CategoryName.TECHNOLOGY.value: 1,
            CategoryName.PRODUCT.value: 2,
            CategoryName.DESIGN.value: 3,
            CategoryName.TEAM.value: 4,
            CategoryName.OTHER.value: 5,
        }[chinesename]




class Sort(Enum):
    LAST_ACTIVITY = 1
    MESSAGE_NUM = 2
    CREATE_AT = 3


class Reaction(int, Enum):
    GOOD = 1
    BAD = 2
    SMILE = 3
    PARTY = 4
    UNHAPPY = 5
    HEART = 6
    ROCKET = 7
    EYE = 8

    @property
    def label(self):
        return {
            Reaction.GOOD: "👍",
            Reaction.BAD: "👎",
            Reaction.SMILE: "😄",
            Reaction.PARTY: "🎉",
            Reaction.UNHAPPY: "😞",
            Reaction.HEART: "❤️",
            Reaction.ROCKET: "🚀",
            Reaction.EYE: "👀",
        }[self]


class OperateType(Enum):
    CONFIRM = 1
    CANCEL = 2


class Style(Enum):
    BALANCED = "balanced"
    CRITICAL = "critical"
    PRACTICAL = "practical"
    THEORETICAL = "theoretical"

    @classmethod
    def values(self):
        return [item.value for item in self]

    @classmethod
    def to_chinesename(self, englishname):
        return {
            "balanced": "均衡辩论",
            "critical": "深度批判",
            "practical": "实用主义",
            "theoretical": "理论探讨",
        }[englishname]


class ForkType(int, Enum):
    DISCUSSION = 1
    NON_DISCUSSION = 2


class DiscussionCreate(BaseModel):
    title: str
    category: Category
    desc: str

    model_config = ConfigDict(from_attributes=True)


class DiscussionCategory(BaseModel):
    id: int
    name: str


class MessageReaction(BaseModel):
    type: int
    content: str


class DiscussionListRequest(BaseModel):
    category: Optional[Category] = Category.ALL
    sortby: Optional[Sort] = None
    search_title: Optional[str] = None
    page_size: int
    page_num: int


class MessageRequest(BaseModel):
    discussion_id: int
    page_size: int
    last_message_id: Optional[int] = None


class SendMessageRequest(BaseModel):
    discussion_id: int
    content: str


class ReplyMessageRequest(BaseModel):
    discussion_id: int
    message_id: int
    content: str


class ReactMessageRequest(BaseModel):
    discussion_id: int
    message_id: int
    type: Reaction
    content: str
    operate_type: OperateType


class ForkRequest(BaseModel):
    type: ForkType
    discussion_id: Optional[int] = None
    content: str
