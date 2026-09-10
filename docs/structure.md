ai-news-social-agent-enterprise/
│
├── README.md
├── LICENSE
├── .env.example
├── .gitignore
├── Makefile
│
├── pyproject.toml                                    # Poetry 依赖管理
├── poetry.lock
├── requirements/
│   ├── base.txt                                      # 基础依赖
│   ├── dev.txt                                       # 开发依赖
│   └── prod.txt                                      # 生产依赖
│
├── docker-compose.yml                                # 完整服务编排
├── docker-compose.dev.yml                            # 开发环境
├── Dockerfile                                        # 应用镜像
├── Dockerfile.worker                                 # Celery Worker 镜像
├── .dockerignore
│
├── deploy/                                           # 部署配置
│   ├── kubernetes/                                   # K8s 配置
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── backend-service.yaml
│   │   ├── worker-deployment.yaml
│   │   ├── redis-deployment.yaml
│   │   ├── postgres-deployment.yaml
│   │   ├── qdrant-deployment.yaml
│   │   ├── nginx-ingress.yaml
│   │   └── hpa.yaml                                  # 自动扩缩容
│   └── helm/                                         # Helm Chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│
├── backend/                                          # 后端源码
│   ├── __init__.py
│   ├── main.py                                       # FastAPI 入口
│   ├── asgi.py                                       # ASGI 配置
│   ├── celery_app.py                                 # Celery 应用
│   │
│   ├── api/                                          # API 层
│   │   ├── __init__.py
│   │   ├── deps.py                                   # 依赖注入
│   │   ├── exceptions.py                             # 异常处理
│   │   ├── middleware.py                             # 中间件
│   │   ├── routes/                                   # 路由
│   │   │   ├── __init__.py
│   │   │   ├── v1/                                   # API v1
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── chat.py
│   │   │   │   ├── social.py
│   │   │   │   ├── knowledge.py
│   │   │   │   ├── admin.py
│   │   │   │   └── checkpoint.py
│   │   │   └── websocket.py                          # WebSocket 路由
│   │   └── schemas/                                  # Pydantic Schema
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── chat.py
│   │       ├── social.py
│   │       ├── knowledge.py
│   │       ├── admin.py
│   │       └── common.py
│   │
│   ├── core/                                         # 核心引擎层
│   │   ├── __init__.py
│   │   ├── graph_builder.py                          # LangGraph 构建
│   │   ├── state.py                                  # State 定义
│   │   ├── nodes/                                    # 节点
│   │   │   ├── __init__.py
│   │   │   ├── agent.py
│   │   │   ├── tools.py
│   │   │   ├── router.py
│   │   │   ├── supervisor.py
│   │   │   ├── admin.py
│   │   │   └── social.py
│   │   └── edges/                                    # 边
│   │       ├── __init__.py
│   │       ├── condition.py
│   │       └── command.py
│   │
│   ├── capabilities/                                 # 能力层
│   │   ├── __init__.py
│   │   ├── llm/                                      # LLM 抽象
│   │   │   ├── __init__.py
│   │   │   ├── factory.py
│   │   │   ├── prompts.py
│   │   │   └── streaming.py
│   │   ├── tools/                                    # 工具
│   │   │   ├── __init__.py
│   │   │   ├── registry.py
│   │   │   ├── tavily.py
│   │   │   ├── web_search.py                         # 多搜索引擎
│   │   │   └── vector_retrieve.py
│   │   ├── rag/                                      # RAG
│   │   │   ├── __init__.py
│   │   │   ├── vector_store.py                       # Qdrant/Milvus
│   │   │   ├── embeddings.py
│   │   │   ├── retriever.py
│   │   │   ├── re_ranker.py
│   │   │   └── indexer.py
│   │   └── memory/                                   # 记忆
│   │       ├── __init__.py
│   │       ├── checkpointer.py                       # PostgreSQL 版
│   │       ├── thread_manager.py
│   │       └── archiver.py
│   │
│   ├── infrastructure/                               # 基础设施
│   │   ├── __init__.py
│   │   ├── database/                                 # 数据库
│   │   │   ├── __init__.py
│   │   │   ├── session.py                            # SQLAlchemy
│   │   │   ├── models/                               # ORM 模型
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py
│   │   │   │   ├── thread.py
│   │   │   │   ├── message.py
│   │   │   │   ├── checkpoint.py
│   │   │   │   ├── document.py
│   │   │   │   ├── post.py
│   │   │   │   └── audit.py
│   │   │   └── migrations/                           # Alembic 迁移
│   │   │       ├── env.py
│   │   │       └── versions/
│   │   ├── cache/                                    # 缓存
│   │   │   ├── __init__.py
│   │   │   ├── redis_client.py
│   │   │   └── cache_manager.py
│   │   ├── queue/                                    # 消息队列
│   │   │   ├── __init__.py
│   │   │   ├── celery_config.py
│   │   │   └── tasks/                                # Celery 任务
│   │   │       ├── __init__.py
│   │   │       ├── agent_tasks.py
│   │   │       ├── rag_tasks.py
│   │   │       └── scheduled_tasks.py
│   │   ├── logging/                                  # 日志
│   │   │   ├── __init__.py
│   │   │   ├── logger.py
│   │   │   ├── audit.py
│   │   │   └── exporters.py
│   │   └── monitoring/                               # 监控
│   │       ├── __init__.py
│   │       ├── metrics.py                            # Prometheus
│   │       ├── health.py
│   │       └── alarms.py
│   │
│   ├── services/                                     # 业务服务
│   │   ├── __init__.py
│   │   ├── auth.py                                   # 认证服务
│   │   ├── chat.py                                   # 聊天服务
│   │   ├── social.py                                 # 社交服务
│   │   ├── knowledge.py                              # 知识库服务
│   │   ├── admin.py                                  # 管理服务
│   │   └── checkpoint.py                             # 检查点服务
│   │
│   ├── utils/                                        # 工具
│   │   ├── __init__.py
│   │   ├── config.py                                 # 配置加载
│   │   ├── logger.py
│   │   ├── decorators.py
│   │   └── validators.py
│   │
│   └── tests/                                        # 测试
│       ├── __init__.py
│       ├── conftest.py
│       ├── unit/
│       ├── integration/
│       ├── e2e/
│       └── fixtures/
│
├── frontend/                                         # 前端（不变）
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│
├── scripts/                                          # 运维脚本
│   ├── init_db.sh
│   ├── run_migrations.sh
│   ├── backup.sh
│   ├── health_check.sh
│   ├── load_testing.py                               # 压测脚本
│   └── deploy.sh
│
├── docs/                                             # 文档
│   ├── architecture.md
│   ├── api_reference.md
│   ├── deployment.md
│   ├── development.md
│   ├── security.md
│   └── knowledge_mapping.md
│
└── data/                                             # 数据目录（运行时）
    ├── logs/
    ├── media/
    ├── checkpoints/
    └── vector_data/