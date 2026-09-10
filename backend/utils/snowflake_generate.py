from snowflakekit import SnowflakeGenerator,SnowflakeConfig
from snowflake_id_toolkit import TwitterSnowflakeIDGenerator
from datetime import datetime

# 异步
config = SnowflakeConfig(epoch=int(datetime(2026,1,1,0,0,0).timestamp()*1000))
snowflake_generate = SnowflakeGenerator(config)

# 同步
sync_snowflake_generator = TwitterSnowflakeIDGenerator(node_id=0,epoch=int(datetime(2026,1,1,0,0,0).timestamp()*1000))