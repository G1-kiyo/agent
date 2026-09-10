# Docker与Python开发环境知识点系统性总结

## 1. Docker与docker-compose核心概念

### 1.1 什么是docker-compose

一句话概括：通过一个配置文件（docker-compose.yml）和一条命令（docker-compose up），将项目所需的所有服务（数据库、缓存、Nginx等）一键启动，每个服务运行在独立的容器中。

### 1.2 价值对比

| 传统开发方式 | Docker Compose方式 |
|-------------|-------------------|
| 手动安装MySQL、Redis、Nginx等 | 编写配置文件，一条命令启动所有服务 |
| 环境配置复杂，跨系统兼容性差 | 环境一致性，开发/测试/生产完全一样 |
| 换电脑需重装所有软件 | 新同事只需安装Docker，5分钟启动环境 |
| 服务间端口、网络配置繁琐 | 容器自动组成内部网络，服务名互相访问 |
| 卸载不干净，残留文件多 | docker-compose down一键全删，不留痕迹 |

### 1.3 形象类比

- **传统方式**：开餐厅要自己打井、发电、砌炉灶，每个项目重新搞一套
- **Docker Compose方式**：有一键部署工具箱，水、电、炉灶自动搭好，各项目用独立移动集装箱

## 2. Docker安装指南

### 2.1 安装前提

必须安装Docker Desktop，这是唯一需要手动安装的东西，docker-compose会自动附带。

### 2.2 各平台安装方法

| 平台 | 安装方式 | 备注 |
|-----|---------|------|
| **Windows** | 官网下载Docker Desktop，双击安装，勾选"使用WSL 2" | 装完必须重启 |
| **Mac** | 1. 官网下载Docker.dmg手动安装<br>2. 或使用命令：`brew install --cask docker` | 推荐手动下载避免网络问题 |
| **Linux (Ubuntu)** | `sudo apt update`<br>`sudo apt install docker.io docker-compose -y`<br>`sudo systemctl start docker`<br>`sudo systemctl enable docker` | 需要启动并设置开机自启 |

### 2.3 Mac安装常见问题

- **命令笔误**：正确应为 `brew install --cask docker`（不是 --cast）
- **下载失败**：使用 `brew install docker` 只会安装命令行客户端，不包含引擎
- **网络问题**：官网手动下载 .dmg 文件是最稳定方式
- **芯片选择**：
  - Apple Silicon (M1/M2/M3)：下载ARM64版本
  - Intel芯片：下载AMD64版本

### 2.4 安装后验证

```bash
docker --version        # 显示版本号如 Docker version 24.0.7
docker-compose --version # 显示版本号如 Docker Compose version v2.23.0
```

### 2.5 安装后关键操作

- **Windows用户**：启用WSL 2（以管理员身份运行 `wsl --install`）
- **Linux用户**：解决sudo权限问题 `sudo usermod -aG docker $USER`，然后注销重新登录

## 3. docker-compose.yml 配置文件详解

### 3.1 基本结构

```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "8080:80"
  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: 123456
  redis:
    image: redis:alpine
```

### 3.2 build vs image

| 指令 | 用途 | 使用场景 |
|-----|------|---------|
| **image** | 直接使用已有镜像 | 数据库、Redis、Nginx等官方或第三方镜像 |
| **build** | 根据Dockerfile构建镜像 | 自定义应用代码（后端、前端项目） |

**关键点**：

- build 可以指定 context（构建上下文路径）和 dockerfile（指定Dockerfile文件）
- 本地开发时，build 会读取Dockerfile，执行其中定义的构建步骤
- build 支持所有编程语言的后端、前端项目，不限于后端

### 3.3 常用配置项映射

| docker run 参数 | docker-compose.yml 写法 | 作用 |
|----------------|----------------------|------|
| `-p 8080:80` | `ports: - "8080:80"` | 端口映射 |
| `-v /my/data:/data` | `volumes: - /my/data:/data` | 挂载卷（数据持久化/代码热更新） |
| `-e MYSQL_ROOT_PASSWORD=123` | `environment: MYSQL_ROOT_PASSWORD: 123` | 设置环境变量 |
| `--network my-net` | `networks: - my-net` | 指定网络 |
| `--name my-app` | `container_name: my-app` | 指定容器名称（不推荐） |

### 3.4 常见服务配置示例

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    command: sh -c "npm install && npm run dev"  # 启动命令
    ports:
      - "3000:3000"
    working_dir: /app
    volumes:
      - ./:/app  # 代码挂载实现热更新
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: myapp
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

## 4. 执行命令与工作原理

### 4.1 核心命令对比

| 命令 | 作用 | 特点 |
|-----|------|------|
| `docker-compose up` | 启动所有服务 | 前台运行，日志输出到终端 |
| `docker-compose up -d` | 后台启动所有服务 | daemon模式，后台运行 |
| `docker-compose build` | 构建/重新构建镜像 | 只执行Dockerfile中的构建步骤，不启动容器 |

### 4.2 执行流程关键点

**并行启动**：docker-compose up 会并行执行各服务的初始化和构建

**依赖顺序**：depends_on 只控制启动顺序，不等待服务就绪（如数据库完全初始化）

**build vs up关系**：
- 首次 docker-compose up 时会先执行 build（如果配置了），然后启动容器
- 单独 docker-compose build 只构建不启动
- 修改代码后，通常不需要重新build（通过volumes挂载实现热更新）

### 4.3 关于启动命令的澄清

误解纠正：在Dockerfile中用 `RUN npm run dev` 不是启动，而是在构建阶段执行。正确方式是：

- 使用 CMD 或 ENTRYPOINT 定义容器启动时执行的命令
- 或在 docker-compose.yml 中用 command 覆盖默认命令

**示例**：

Dockerfile：
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 容器启动时执行
CMD ["npm", "run", "dev"]
```

或直接写在compose文件中：

```yaml
services:
  app:
    build: .
    command: npm run dev  # 覆盖Dockerfile中的CMD
```

## 5. Python项目依赖管理

### 5.1 requirements.txt 作用

最直白的解释：记录Python项目所需的所有第三方库及版本号，类似购物清单。

### 5.2 为什么需要它？

| 场景 | 没有 requirements.txt | 有 requirements.txt |
|-----|-------------------|------------------|
| 新同事入职 | 口述半小时装库清单 | `pip install -r requirements.txt` 搞定 |
| 版本冲突 | 你装Flask 2.3，同事装1.0，代码跑不起来 | 锁定版本，完全一致 |
| 部署上线 | 手动在服务器上一个个装，漏一个就报错 | 自动化部署直接读取安装 |
| 换电脑 | 忘记用了哪些库，得看import语句慢慢找 | 复制文件，一条命令搞定 |

### 5.3 生成requirements.txt

**方法一：导出当前环境所有包（最常用）**

```bash
pip freeze > requirements.txt
```

**方法二：只导出项目真正用到的（更干净）**

```bash
pip install pipreqs
pipreqs ./ --force
```

### 5.4 版本号写法

| 写法 | 含义 | 示例 |
|-----|------|-----|
| `flask==2.3.2` | 精确版本（推荐） | 必须用2.3.2 |
| `flask>=2.3.0` | 最低版本 | 2.3.0及以上都行 |
| `flask~=2.3.0` | 兼容版本 | 2.3.x都可以，不会升到3.0 |
| `flask` | 无版本号（不推荐） | 可能不兼容 |

### 5.5 与其他语言对比

| 语言 | 依赖管理文件 |
|-----|-----------|
| Python | requirements.txt 或 pyproject.toml |
| Node.js | package.json |
| Ruby | Gemfile |
| Go | go.mod |
| Java (Maven) | pom.xml |

## 6. Docker与requirements.txt的分工

| 工具 | 管理范围 | 示例 |
|-----|---------|------|
| **Docker** | 操作系统层面环境 | Python版本、MySQL、Redis、操作系统底层 |
| **requirements.txt** | Python包层面依赖 | Flask、requests、pandas等第三方库 |

### 6.1 标准Dockerfile示例

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt  # 安装所有Python依赖
COPY . .
CMD ["python", "app.py"]
```

## 7. 完整工作流程建议

### 7.1 Python项目开发流程

1. 创建项目并维护好 requirements.txt
2. 编写 Dockerfile 定义Python环境和依赖
3. 编写 docker-compose.yml 整合Web服务 + 数据库 + 缓存
4. 使用 docker-compose up -d 一键启动完整开发环境
5. 通过 volumes 挂载实现代码热更新

### 7.2 新人上手流程

```bash
# 1. 克隆代码
git clone xxx

# 2. 进入项目目录
cd your-project

# 3. 启动所有环境（首次下载镜像稍慢）
docker-compose up -d

# 4. 开始开发，浏览器访问 localhost:8080
```

## 8. 常见问题与解决方案

| 问题 | 解决方法 |
|-----|---------|
| 镜像下载太慢 | 配置国内镜像加速器（阿里云/中科大） |
| Windows启动提示虚拟化未启用 | 进BIOS开启Intel VT-x / AMD-V |
| 端口被占用 | 修改端口映射如 "8081:80" |
| 内存不足 | Docker Desktop设置中调高内存限制（至少4GB） |
| Mac下载失败 | 官网手动下载.dmg文件安装 |
| depends_on不等待服务就绪 | 在应用代码中加入重试机制 |

## 9. 核心概念总结图

```text
┌─────────────────────────────────────────────────┐
│              Docker Desktop                      │
│  (唯一需要手动安装的基础设施)                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           docker-compose.yml                     │
│  ┌─────────┬─────────┬─────────┬─────────┐    │
│  │  web    │  mysql  │  redis  │  nginx  │    │
│  │ build   │  image  │  image  │  image  │    │
│  │ ports   │  env    │  ports  │  ports  │    │
│  │ volumes │ volumes │ volumes │ volumes │    │
│  └─────────┴─────────┴─────────┴─────────┘    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
        docker-compose up -d
                 │
                 ▼
    ┌────────────────────────┐
    │  所有容器并行启动       │
    │  服务名互相可访问       │
    │  环境完全隔离           │
    └────────────────────────┘
```

## 10. 关键要点提醒

- build 用于构建自定义镜像（你的代码），image 用于直接使用现成镜像（数据库、Redis等）
- build 不限于后端，前端项目同样适用
- 开发环境下通过 volumes 挂载代码实现热更新，避免频繁build
- docker-compose up 会先执行 build（如果配置）再启动容器
- depends_on 仅控制启动顺序，不保证服务已就绪
- Docker管操作系统环境，requirements.txt管Python包依赖，两者互补
- 所有语言都有类似的依赖管理文件，理解原理一通百通