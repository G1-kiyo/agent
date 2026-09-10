#!/bin/sh

set -e  # 遇到错误立即退出

echo "等待 Kafka Connect 服务就绪..."
while [ $(curl -s -o /dev/null -w %{http_code} http://kafka_connect:8083/connectors/) -ne 200 ]; do
  sleep 3
done

echo "Kafka Connect 已就绪，开始注册连接器..."

# 方式一：JSON 写在脚本里（用 EOF）
curl -X POST http://kafka_connect:8083/connectors/ \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "db",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "SuperComplicatedPassword2024!",
    "database.dbname": "agent",
    "topic.prefix": "agent_topic",
    "plugin.name":"decoderbufs",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "schema.history.internal.kafka.topic": "schemahistory.inventory"
  }
}
EOF