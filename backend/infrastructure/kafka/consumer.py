from aiokafka import AIOKafkaConsumer
from fastapi import FastAPI
import json

def deserializer(value):
    if value is None:
        return None
    return json.loads(value)


async def start_kafka_consumer():
    consumer = AIOKafkaConsumer(
        "agent_topic.public.message",
        "agent_topic.public.reply",
        "agent_topic.public.reaction",
        bootstrap_servers="kafka:9092",
        group_id="discussion_group_consumer",
        value_deserializer=deserializer
    )
    await consumer.start()

    return consumer

async def stop_kafka_consumer(consumer:AIOKafkaConsumer):
    if consumer:
        await consumer.stop()

