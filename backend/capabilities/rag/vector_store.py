from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance,PointStruct
from qdrant_client.http.exceptions import UnexpectedResponse
from pydantic import BaseModel
import uuid
from settings import settings
from infrastructure.logging.logger import KnowledgeLogger
from .constant import COLLECTION_NAME,MODEL_VECTOR_SIZE,SEARCH_LIMIT



_qdrant_client = None
# qdrant初始化
def get_qdrant():
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    # 检查是否已存在集合
    collections = _qdrant_client.get_collections()
    collection_names = [collection.name for collection in collections.collections]
    # 如果不存在，新建集合
    if COLLECTION_NAME not in collection_names:

        _qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=MODEL_VECTOR_SIZE, distance=Distance.COSINE
            ),
        )
    return _qdrant_client


class DocumentEmbeddingPayload(BaseModel):
    # 文档名称
    source_url: str
    # 文档块索引
    chunk_index: int
    # 文档索引
    doc_index: int
    # 文档块内容
    content: str

class DocumentEmbeddingPoint(BaseModel):
    vector: list[float]
    payload: DocumentEmbeddingPayload


# 存储向量
def store_document_vectors(input_points: list[DocumentEmbeddingPoint], qdrant:QdrantClient):
    try:
        qdrant.upsert(
                collection_name=COLLECTION_NAME,
                points=[
                    PointStruct(
                        id=uuid.uuid4(),
                        vector=point.get("vector"),
                        payload=point.get("payload")
                    ) for point in input_points
                ]
            )
    except UnexpectedResponse as e:
        KnowledgeLogger.error(f"request to upsert qdrant failed,status code:{e.status_code}",extra={"error":e.content})
        raise

def search_in_vectors_store(vectors:list[float]):
    try:
        qdrant = get_qdrant()
        result = qdrant.query_points(
            collection_name=COLLECTION_NAME,
            query=vectors,
            limit=SEARCH_LIMIT,
            with_payload=True,
            score_threshold=0.0
        ).points
        payload_list = [item.payload for item in result]
        return payload_list

    except UnexpectedResponse as e:
        KnowledgeLogger.error(f"request to upsert qdrant failed,status code:{e.status_code}",extra={"error":e.content})
        raise

    
