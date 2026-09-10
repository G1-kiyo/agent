from sentence_transformers import SentenceTransformer,CrossEncoder
from langchain_docling.loader import DoclingLoader
import os
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .vector_store import DocumentEmbeddingPayload
from .constant import MATCH_NUMS



# 初始嵌入模型
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
rerank_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L6-v2')

def generate_document_vectors(texts:str):
    # 生成向量
    vector = embedding_model.encode_document(texts).tolist()
    return vector


# 返回初步分好块的文档列表
def load_documents_from_file(file: str):

    # 使用loader按照path加载
    loader = DoclingLoader(file)
    file_name = os.path.basename(file)
    documents = loader.load()  # 默认是chunk
    return documents, file_name


# 对内容进行进一步分块
def split_documents(doc):
    # 对文档进行更加细粒度的拆分
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=[
            "\n\n",
            "\n",
            " ",
            ".",
            ",",
            "\u200b",  # Zero-width space
            "\uff0c",  # Fullwidth comma
            "\u3001",  # Ideographic comma
            "\uff0e",  # Fullwidth full stop
            "\u3002",  # Ideographic full stop
            "",
        ],
    )
    return text_splitter.split_text(doc)

# 对文本结果进行重排
def rerank_content(query:str,payload_list:list[DocumentEmbeddingPayload]):
    content_pair_list = [(query,payload.get("content")) for payload in payload_list]
    scores = rerank_model.predict(content_pair_list).tolist()
    payload_score_list = []
    for idx,payload in enumerate(payload_list):
        score_dict = {}
        score_dict["payload"] = payload
        score_dict["score"] = scores[idx]
        payload_score_list.append(score_dict)
    
    rerank_payload = [item.get("payload",{}) for item in sorted(payload_score_list,key=lambda k:k.get("score"),reverse=True)]
    print(f"rerank>>{rerank_payload}")
    return rerank_payload[:MATCH_NUMS]

