FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl && \
    apt-get install -y --no-install-recommends build-essential python3-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 设置 Python 路径
ENV PYTHONPATH=/app

# 先复制依赖，缓存依赖
COPY requirements/base.txt /app/requirements/base.txt

RUN pip install torch==2.2.2 torchvision==0.17.2 \
    -f https://mirrors.aliyun.com/pytorch-wheels/cpu/
    #-f https://mirrors.aliyun.com/pytorch-wheels/cu124

RUN pip install --no-cache-dir -r requirements/base.txt && \
    pip uninstall -y opencv-python 2>/dev/null || true && \
    pip install --no-cache-dir opencv-python-headless==4.11.0.86


# 再复制实际代码
COPY . .


