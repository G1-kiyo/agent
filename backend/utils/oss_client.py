import asyncio
import alibabacloud_oss_v2 as oss
import alibabacloud_oss_v2.aio as oss_aio
from settings import settings
from fastapi import FastAPI


credentials_provider = oss.credentials.EnvironmentVariableCredentialsProvider()
cfg = oss.config.load_default()
cfg.credentials_provider = credentials_provider
cfg.region = settings.OSS_REGION


async def start_oss_client():
    oss_client = oss_aio.AsyncClient(config=cfg) 
    return oss_client

async def stop_oss_client(oss_client:oss_aio.AsyncClient):
    if oss_client:
        await oss_client.close()







