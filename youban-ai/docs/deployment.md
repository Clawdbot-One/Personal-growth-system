# 优伴AI 部署与运维手册

> 版本：v1.0  
> 最后更新：2026-06-27  
> 适用范围：优伴AI 全栈项目（前端 + 后端）

---

## 目录

1. [环境要求](#1-环境要求)
2. [项目结构](#2-项目结构)
3. [快速开始（本地开发）](#3-快速开始本地开发)
4. [Docker 部署](#4-docker-部署)
5. [生产环境部署步骤](#5-生产环境部署步骤)
6. [环境变量](#6-环境变量)
7. [运维管理](#7-运维管理)
8. [CI/CD 建议](#8-cicd-建议)
9. [安全检查清单](#9-安全检查清单)

---

## 1. 环境要求

### 1.1 操作系统

| 项目     | 推荐版本                          |
| -------- | --------------------------------- |
| 服务器   | Linux (Ubuntu 20.04+ / CentOS 8+) |

### 1.2 运行时

| 组件       | 版本要求     | 说明                         |
| ---------- | ------------ | ---------------------------- |
| Node.js    | >= 18.x      | 推荐使用 20.x LTS            |
| npm        | >= 9.x       | 随 Node.js 一起安装          |
| MySQL      | >= 8.0       | 或 PostgreSQL >= 14          |
| Redis      | >= 6.x       | 用于缓存与会话管理           |
| Nginx      | >= 1.20      | 反向代理与静态资源服务       |
| Docker     | >= 20.x      | 可选，用于容器化部署         |
| Docker Compose | >= 2.x   | 可选，用于多容器编排         |

### 1.3 推荐硬件配置

| 环境   | CPU   | 内存 | 磁盘   |
| ------ | ----- | ---- | ------ |
| 开发   | 2 核  | 4 GB | 20 GB  |
| 生产   | 4 核+ | 8 GB+| 50 GB+ |

---

## 2. 项目结构

```
youban-ai/
├── frontend/                   # 前端项目（Vue 3 + Vite）
│   ├── .vscode/                # VS Code 配置
│   ├── dist/                   # 构建产物（包含 index.html 与静态资源）
│   │   ├── assets/             # 编译后的 JS/CSS 文件
│   │   ├── favicon.svg         # 网站图标
│   │   ├── icons.svg           # 图标精灵
│   │   └── index.html          # 入口 HTML
│   ├── src/                    # 源代码
│   │   ├── api/                # API 请求封装
│   │   │   └── request.js      # Axios 实例（JWT 拦截、错误处理）
│   │   ├── assets/             # 静态资源
│   │   ├── components/         # 公共组件
│   │   │   └── layout/         # 布局组件
│   │   ├── router/             # 路由配置
│   │   │   └── index.js        # 前端路由定义
│   │   ├── stores/             # Pinia 状态管理
│   │   │   ├── user.js         # 用户状态
│   │   │   ├── assessment.js   # 测评状态
│   │   │   ├── chat.js         # 聊天状态
│   │   │   ├── growth.js       # 成长状态
│   │   │   └── practice.js     # 实践状态
│   │   ├── views/              # 页面视图
│   │   │   ├── Home.vue        # 首页
│   │   │   ├── Admin/          # 管理后台
│   │   │   ├── Assessment/     # 测评模块
│   │   │   ├── Assistant/      # AI 助手
│   │   │   ├── Growth/         # 成长路径
│   │   │   ├── Practice/       # 实践库
│   │   │   └── Profile/        # 个人中心
│   │   ├── App.vue             # 根组件
│   │   ├── main.js             # 入口文件
│   │   └── style.css           # 全局样式
│   ├── index.html              # HTML 模板
│   ├── package.json            # 依赖与脚本
│   ├── vite.config.js          # Vite 构建配置
│   └── .gitignore              # Git 忽略规则
├── backend/                    # 后端项目（Node.js / Express）
│   ├── src/                    # 后端源码
│   ├── package.json            # 后端依赖与脚本
│   ├── Dockerfile              # 后端 Docker 镜像
│   └── .env.example            # 环境变量模板
├── docker/                     # Docker 相关配置
│   └── nginx/                  # Nginx 配置
│       └── nginx.conf          # Nginx 反向代理配置
├── docker-compose.yml          # Docker Compose 编排文件
├── docs/                       # 项目文档
│   └── deployment.md           # 本文件
└── scripts/                    # 运维脚本
    ├── backup.sh               # 数据库备份脚本
    └── restore.sh              # 数据库恢复脚本
```

### 2.1 关键配置文件说明

| 文件                        | 说明                                                         |
| --------------------------- | ------------------------------------------------------------ |
| `frontend/package.json`     | 前端依赖：Vue 3, Element Plus, Pinia, Vue Router, ECharts, Axios, Tailwind CSS |
| `frontend/vite.config.js`   | Vite 构建配置：开发服务器端口 5173，`@` 别名指向 `src/`，开发监听 `0.0.0.0` |
| `frontend/src/api/request.js` | Axios 实例：baseURL 为 `/api`，JWT Token 存储在 `localStorage` 键名 `youban_token`，30 秒超时 |
| `backend/package.json`      | 后端依赖：Express, MySQL2/PG, Redis, jsonwebtoken 等          |
| `.env` / `.env.production`  | 环境变量（详见第 6 节）                                       |

---

## 3. 快速开始（本地开发）

### 3.1 克隆项目

```bash
git clone https://github.com/your-org/youban-ai.git
cd youban-ai
```

### 3.2 安装前端依赖

```bash
cd frontend
npm install
```

### 3.3 配置环境变量

在 `frontend/` 目录下创建 `.env.development` 文件：

```env
# 前端开发环境变量
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=优伴AI
```

> 生产环境使用 `.env.production` 文件，变量前缀为 `VITE_`。

### 3.4 启动开发服务器

```bash
# 在 frontend 目录下
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`，支持热更新（HMR）。

### 3.5 构建生产版本

```bash
# 在 frontend 目录下
npm run build
```

构建产物输出到 `frontend/dist/` 目录。

### 3.6 预览生产构建

```bash
npm run preview
```

---

## 4. Docker 部署

### 4.1 docker-compose.yml

创建项目根目录下的 `docker-compose.yml`：

```yaml
version: "3.8"

services:
  # ==================== Nginx 反向代理 ====================
  nginx:
    image: nginx:1.25-alpine
    container_name: youban-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - frontend_dist:/usr/share/nginx/html:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro      # SSL 证书目录
      - nginx_logs:/var/log/nginx
    depends_on:
      - backend
    networks:
      - youban-net

  # ==================== 后端服务 ====================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: youban-backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=${DB_USER:-youban}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME:-youban_ai}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-7d}
      - AI_API_KEY=${AI_API_KEY}
      - AI_API_ENDPOINT=${AI_API_ENDPOINT}
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - CORS_ORIGIN=${CORS_ORIGIN:-https://youban.example.com}
    volumes:
      - backend_logs:/app/logs
      - backend_uploads:/app/uploads
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - youban-net

  # ==================== MySQL 数据库 ====================
  mysql:
    image: mysql:8.0
    container_name: youban-mysql
    restart: always
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${DB_NAME:-youban_ai}
      - MYSQL_USER=${DB_USER:-youban}
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init:/docker-entrypoint-initdb.d:ro   # 初始化 SQL 脚本
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --default-authentication-plugin=mysql_native_password
      - --max_connections=500
      - --max_allowed_packet=64M
      - --slow_query_log=1
      - --slow_query_log_file=/var/log/mysql/slow.log
      - --long_query_time=2
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - youban-net

  # ==================== Redis 缓存 ====================
  redis:
    image: redis:7-alpine
    container_name: youban-redis
    restart: always
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - youban-net

# ==================== 数据卷 ====================
volumes:
  mysql_data:
    driver: local
  redis_data:
    driver: local
  frontend_dist:
    driver: local
  backend_logs:
    driver: local
  backend_uploads:
    driver: local
  nginx_logs:
    driver: local

# ==================== 网络 ====================
networks:
  youban-net:
    driver: bridge
```

### 4.2 前端 Dockerfile

创建 `frontend/Dockerfile`：

```dockerfile
# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖（利用 Docker 缓存层）
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 复制源码并构建
COPY . .
RUN npm run build

# ==================== 运行阶段（Nginx） ====================
FROM nginx:1.25-alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 4.3 后端 Dockerfile

创建 `backend/Dockerfile`：

```dockerfile
# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# ==================== 运行阶段 ====================
FROM node:20-alpine

RUN apk add --no-cache tini curl

WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/index.js"]
```

### 4.4 Nginx 配置文件

创建 `docker/nginx/nginx.conf`：

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main buffer=16k;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50m;
    client_body_buffer_size 128k;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        image/svg+xml;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 包含站点配置
    include /etc/nginx/conf.d/*.conf;
}
```

创建 `docker/nginx/conf.d/default.conf`：

```nginx
# ==================== 上游后端服务 ====================
upstream backend {
    server backend:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# ==================== HTTP → HTTPS 重定向 ====================
server {
    listen 80;
    server_name youban.example.com;
    return 301 https://$host$request_uri;
}

# ==================== HTTPS 主站点 ====================
server {
    listen 443 ssl http2;
    server_name youban.example.com;

    # SSL 证书
    ssl_certificate     /etc/nginx/ssl/youban.example.com.pem;
    ssl_certificate_key /etc/nginx/ssl/youban.example.com.key;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS (可选，确认 SSL 稳定后再启用)
    # add_header Strict-Transport-Security "max-age=63072000" always;

    # 根路径
    root /usr/share/nginx/html;
    index index.html;

    # ==================== 静态资源 ====================
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /favicon.svg {
        expires 7d;
        add_header Cache-Control "public";
    }

    # ==================== API 反向代理 ====================
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;

        # 文件上传限制
        client_max_body_size 50m;
    }

    # ==================== WebSocket (如需要) ====================
    location /ws/ {
        proxy_pass http://backend/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
    }

    # ==================== SPA 路由回退 ====================
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ==================== 健康检查端点 ====================
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
```

### 4.5 环境变量文件（.env）

创建项目根目录下的 `.env` 文件（不提交到版本控制）：

```env
# ==================== 数据库 ====================
MYSQL_ROOT_PASSWORD=your_root_password_here
DB_USER=youban
DB_PASSWORD=your_db_password_here
DB_NAME=youban_ai

# ==================== Redis ====================
REDIS_PASSWORD=your_redis_password_here

# ==================== JWT ====================
JWT_SECRET=your_jwt_secret_at_least_32_chars
JWT_EXPIRES_IN=7d

# ==================== AI API ====================
AI_API_KEY=sk-your-ai-api-key-here
AI_API_ENDPOINT=https://api.openai.com/v1

# ==================== 其他 ====================
CORS_ORIGIN=https://youban.example.com
LOG_LEVEL=info
```

### 4.6 Docker 操作命令

```bash
# 构建并启动所有服务（后台运行）
docker-compose up -d

# 查看服务运行状态
docker-compose ps

# 查看日志
docker-compose logs -f --tail=100

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f nginx

# 重启单个服务
docker-compose restart backend

# 停止所有服务
docker-compose down

# 停止并删除数据卷（⚠️ 会删除数据库数据）
docker-compose down -v

# 重新构建并启动（代码更新后）
docker-compose up -d --build

# 进入容器调试
docker-compose exec backend sh
docker-compose exec mysql mysql -u youban -p
```

---

## 5. 生产环境部署步骤

### 5.1 服务器准备

#### 5.1.1 系统更新

```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop net-tools

# CentOS
sudo dnf update -y
sudo dnf install -y curl wget git vim htop net-tools
```

#### 5.1.2 安装 Node.js

```bash
# 使用 NodeSource 安装 Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v   # 应显示 v20.x.x
npm -v    # 应显示 10.x.x

# 安装 PM2 进程管理器（全局）
sudo npm install -g pm2
```

#### 5.1.3 安装并配置 MySQL

```bash
# Ubuntu
sudo apt install -y mysql-server

# 安全配置
sudo mysql_secure_installation

# 创建数据库和用户
sudo mysql -u root -p <<EOF
CREATE DATABASE IF NOT EXISTS youban_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'youban'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON youban_ai.* TO 'youban'@'localhost';
FLUSH PRIVILEGES;
EOF

# 调整 MySQL 配置（/etc/mysql/mysql.conf.d/mysqld.cnf）
# 建议设置：
# max_connections = 500
# max_allowed_packet = 64M
# character-set-server = utf8mb4
# collation-server = utf8mb4_unicode_ci
```

#### 5.1.4 安装并配置 Redis

```bash
# Ubuntu
sudo apt install -y redis-server

# 设置密码（编辑 /etc/redis/redis.conf）
# requirepass your_redis_password
# bind 127.0.0.1

sudo systemctl enable redis-server
sudo systemctl restart redis-server

# 验证
redis-cli -a your_redis_password ping   # 应返回 PONG
```

#### 5.1.5 安装并配置 Nginx

```bash
sudo apt install -y nginx

# 验证安装
nginx -v   # 应显示 nginx/1.20+

sudo systemctl enable nginx
```

### 5.2 应用部署

#### 5.2.1 部署后端

```bash
# 克隆项目
cd /opt
git clone https://github.com/your-org/youban-ai.git
cd youban-ai/backend

# 安装依赖
npm ci --only=production

# 创建环境变量文件
cp .env.example .env
vim .env   # 填写生产环境配置（参见第 6 节）

# 初始化数据库表
npm run db:migrate

# 使用 PM2 启动
pm2 start src/index.js --name youban-backend --instances 2

# 配置 PM2 开机自启
pm2 startup
pm2 save

# 常用 PM2 命令
pm2 status                 # 查看进程状态
pm2 logs youban-backend    # 查看日志
pm2 restart youban-backend # 重启
pm2 stop youban-backend    # 停止
pm2 delete youban-backend  # 删除进程
```

#### 5.2.2 部署前端

```bash
cd /opt/youban-ai/frontend

# 创建生产环境变量
cat > .env.production <<EOF
VITE_API_BASE_URL=https://youban.example.com/api
VITE_APP_TITLE=优伴AI
EOF

# 安装依赖并构建
npm ci
npm run build

# 构建产物位于 dist/ 目录
```

### 5.3 Nginx 配置

创建 `/etc/nginx/sites-available/youban-ai`：

```nginx
# 上游后端服务
upstream youban_backend {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name youban.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 主站点
server {
    listen 443 ssl http2;
    server_name youban.example.com;

    # SSL 证书（由 certbot 自动配置）
    ssl_certificate     /etc/letsencrypt/live/youban.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/youban.example.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # 根目录指向前端构建产物
    root /opt/youban-ai/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript image/svg+xml;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # 客户端上传大小限制
    client_max_body_size 50m;

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /favicon.svg {
        expires 7d;
        add_header Cache-Control "public";
    }

    location /icons.svg {
        expires 7d;
        add_header Cache-Control "public";
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://youban_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # WebSocket（如需要）
    location /ws/ {
        proxy_pass http://youban_backend/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400s;
    }

    # SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
```

启用站点：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/youban-ai /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 5.4 SSL 证书配置（Let's Encrypt）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书（自动配置 Nginx）
sudo certbot --nginx -d youban.example.com -d www.youban.example.com

# 验证自动续期
sudo certbot renew --dry-run

# 设置自动续期 cron（certbot 安装后会自动添加）
# 查看：sudo systemctl status certbot.timer
```

### 5.5 启动验证

```bash
# 1. 检查后端进程
pm2 status

# 2. 检查 Nginx
sudo systemctl status nginx

# 3. 检查 MySQL
sudo systemctl status mysql

# 4. 检查 Redis
sudo systemctl status redis-server

# 5. 验证 API
curl -I https://youban.example.com/api/health

# 6. 验证前端
curl -I https://youban.example.com/

# 7. 检查端口监听
sudo ss -tlnp | grep -E '80|443|3000|3306|6379'
```

---

## 6. 环境变量

### 6.1 完整环境变量列表

所有环境变量定义在 `backend/.env`（生产环境）或 `backend/.env.development`（开发环境）中。

| 变量名             | 说明                     | 示例值                                  | 必填 |
| ------------------ | ------------------------ | --------------------------------------- | ---- |
| `NODE_ENV`         | 运行环境                 | `production` / `development`            | 是   |
| `PORT`             | 后端服务端口             | `3000`                                  | 是   |
| `HOST`             | 后端监听地址             | `0.0.0.0`                               | 是   |
| `DB_HOST`          | 数据库主机地址           | `localhost` / `mysql`（Docker）          | 是   |
| `DB_PORT`          | 数据库端口               | `3306`                                  | 是   |
| `DB_USER`          | 数据库用户名             | `youban`                                | 是   |
| `DB_PASSWORD`      | 数据库密码               | `your_secure_password`                  | 是   |
| `DB_NAME`          | 数据库名称               | `youban_ai`                             | 是   |
| `DB_POOL_MIN`      | 数据库连接池最小连接数   | `2`                                     | 否   |
| `DB_POOL_MAX`      | 数据库连接池最大连接数   | `10`                                    | 否   |
| `REDIS_HOST`       | Redis 主机地址           | `localhost` / `redis`（Docker）          | 是   |
| `REDIS_PORT`       | Redis 端口               | `6379`                                  | 是   |
| `REDIS_PASSWORD`   | Redis 密码               | `your_redis_password`                   | 是   |
| `REDIS_DB`         | Redis 数据库编号         | `0`                                     | 否   |
| `JWT_SECRET`       | JWT 签名密钥             | `至少32个字符的随机字符串`              | 是   |
| `JWT_EXPIRES_IN`   | JWT 过期时间             | `7d` / `24h` / `3600`                   | 是   |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token 过期时间 | `30d`                                 | 否   |
| `AI_API_KEY`       | AI 服务 API 密钥         | `sk-xxxxxxxxxxxxxxxx`                   | 是   |
| `AI_API_ENDPOINT`  | AI 服务端点              | `https://api.openai.com/v1`             | 是   |
| `AI_MODEL`         | AI 模型名称              | `gpt-4o` / `deepseek-chat`              | 否   |
| `CORS_ORIGIN`      | 允许的跨域来源           | `https://youban.example.com`            | 是   |
| `LOG_LEVEL`        | 日志级别                 | `error` / `warn` / `info` / `debug`     | 否   |
| `LOG_DIR`          | 日志文件目录             | `/var/log/youban-ai`                    | 否   |
| `UPLOAD_DIR`       | 文件上传目录             | `/opt/youban-ai/uploads`                | 否   |
| `UPLOAD_MAX_SIZE`  | 上传文件大小限制（MB）   | `50`                                    | 否   |
| `SMTP_HOST`        | 邮件服务器地址           | `smtp.example.com`                      | 否   |
| `SMTP_PORT`        | 邮件服务器端口           | `587`                                   | 否   |
| `SMTP_USER`        | 邮件服务器用户名         | `noreply@youban.example.com`            | 否   |
| `SMTP_PASS`        | 邮件服务器密码           | `your_email_password`                   | 否   |
| `RATE_LIMIT_WINDOW`| 限流窗口（毫秒）         | `60000`（1 分钟）                       | 否   |
| `RATE_LIMIT_MAX`   | 限流窗口内最大请求数     | `100`                                   | 否   |

### 6.2 生成安全密钥

```bash
# 生成 JWT Secret（64 字节随机字符串）
openssl rand -base64 64

# 生成数据库密码
openssl rand -base64 32

# 生成 Redis 密码
openssl rand -base64 24
```

### 6.3 环境变量文件模板

`backend/.env.example`：

```env
# ==================== 服务 ====================
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# ==================== 数据库 ====================
DB_HOST=localhost
DB_PORT=3306
DB_USER=youban
DB_PASSWORD=change_me
DB_NAME=youban_ai
DB_POOL_MIN=2
DB_POOL_MAX=10

# ==================== Redis ====================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=change_me
REDIS_DB=0

# ==================== JWT ====================
JWT_SECRET=change_me_to_a_random_string_at_least_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ==================== AI 服务 ====================
AI_API_KEY=sk-your-api-key
AI_API_ENDPOINT=https://api.openai.com/v1
AI_MODEL=gpt-4o

# ==================== 跨域 ====================
CORS_ORIGIN=http://localhost:5173

# ==================== 日志 ====================
LOG_LEVEL=debug
LOG_DIR=./logs

# ==================== 上传 ====================
UPLOAD_DIR=./uploads
UPLOAD_MAX_SIZE=50

# ==================== 邮件（可选） ====================
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@youban.example.com
SMTP_PASS=change_me

# ==================== 限流 ====================
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

---

## 7. 运维管理

### 7.1 健康检查端点

| 端点                      | 方法   | 说明                       | 正常响应       |
| ------------------------- | ------ | -------------------------- | -------------- |
| `/api/health`             | GET    | 后端服务健康检查           | `{"status":"ok"}` |
| `/api/health/db`          | GET    | 数据库连接检查             | `{"db":"connected"}` |
| `/api/health/redis`       | GET    | Redis 连接检查             | `{"redis":"connected"}` |
| `/api/health/ai`          | GET    | AI 服务连通性检查          | `{"ai":"available"}` |
| `/health`                 | GET    | Nginx 健康检查             | `OK`           |

#### 健康检查脚本

```bash
#!/bin/bash
# scripts/healthcheck.sh

BASE_URL="https://youban.example.com"

echo "=== 优伴AI 健康检查 ==="

# 检查 Nginx
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Nginx: 正常"
else
    echo "❌ Nginx: 异常 (HTTP $HTTP_CODE)"
fi

# 检查后端
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 后端服务: 正常"
else
    echo "❌ 后端服务: 异常 (HTTP $HTTP_CODE)"
fi

# 检查数据库
DB_STATUS=$(curl -s "$BASE_URL/api/health/db" | grep -o '"connected"')
if [ -n "$DB_STATUS" ]; then
    echo "✅ 数据库: 正常"
else
    echo "❌ 数据库: 异常"
fi

# 检查 Redis
REDIS_STATUS=$(curl -s "$BASE_URL/api/health/redis" | grep -o '"connected"')
if [ -n "$REDIS_STATUS" ]; then
    echo "✅ Redis: 正常"
else
    echo "❌ Redis: 异常"
fi

echo "=== 检查完成 ==="
```

### 7.2 日志管理

#### 7.2.1 日志路径

| 服务           | 日志路径                            | 说明         |
| -------------- | ----------------------------------- | ------------ |
| 后端应用       | `/opt/youban-ai/backend/logs/`      | 应用日志     |
| Nginx 访问日志 | `/var/log/nginx/access.log`         | 请求访问日志 |
| Nginx 错误日志 | `/var/log/nginx/error.log`          | 错误日志     |
| MySQL 慢查询   | `/var/log/mysql/slow.log`           | 慢查询日志   |
| PM2 日志       | `~/.pm2/logs/`                      | 进程日志     |

#### 7.2.2 日志轮转配置

创建 `/etc/logrotate.d/youban-ai`：

```conf
# 后端应用日志
/opt/youban-ai/backend/logs/*.log {
    daily
    rotate 30
    missingok
    notifempty
    compress
    delaycompress
    dateext
    dateformat -%Y%m%d
    copytruncate
    create 644 appuser appgroup
    postrotate
        pm2 reloadLogs
    endscript
}

# Nginx 日志
/var/log/nginx/*.log {
    daily
    rotate 14
    missingok
    notifempty
    compress
    delaycompress
    dateext
    dateformat -%Y%m%d
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 $(cat /var/run/nginx.pid)
    endscript
}

# PM2 日志
/root/.pm2/logs/*.log {
    daily
    rotate 14
    missingok
    notifempty
    compress
    delaycompress
    dateext
    dateformat -%Y%m%d
    copytruncate
}
```

应用配置：

```bash
sudo logrotate -d /etc/logrotate.d/youban-ai   # 测试
sudo logrotate -f /etc/logrotate.d/youban-ai   # 强制执行
```

#### 7.2.3 查看日志常用命令

```bash
# 后端实时日志
pm2 logs youban-backend --lines 100

# 筛选特定级别日志
pm2 logs youban-backend --lines 100 | grep "ERROR"

# Nginx 访问日志（最近 100 条）
tail -n 100 /var/log/nginx/access.log

# Nginx 错误日志（实时跟踪）
tail -f /var/log/nginx/error.log

# 统计 Nginx 状态码分布
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# 查找访问量最高的 IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# MySQL 慢查询日志
tail -f /var/log/mysql/slow.log
```

### 7.3 备份策略

#### 7.3.1 数据库备份脚本

创建 `scripts/backup.sh`：

```bash
#!/bin/bash
# ============================================
# 优伴AI 数据库备份脚本
# 用法: ./backup.sh [daily|weekly|monthly]
# ============================================

set -euo pipefail

# ==================== 配置 ====================
BACKUP_TYPE="${1:-daily}"
BACKUP_DIR="/opt/backups/youban-ai/${BACKUP_TYPE}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-youban}"
DB_NAME="${DB_NAME:-youban_ai}"
DB_PASSWORD="${DB_PASSWORD}"

# 保留天数
case "$BACKUP_TYPE" in
    daily)   RETENTION_DAYS=7 ;;
    weekly)  RETENTION_DAYS=30 ;;
    monthly) RETENTION_DAYS=365 ;;
    *)       echo "未知备份类型: $BACKUP_TYPE"; exit 1 ;;
esac

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"

# ==================== 创建目录 ====================
mkdir -p "$BACKUP_DIR"

# ==================== 执行备份 ====================
echo "[$(date)] 开始备份数据库: $DB_NAME"

mysqldump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --set-gtid-purged=OFF \
    --default-character-set=utf8mb4 \
    "$DB_NAME" | gzip > "$BACKUP_FILE"

# ==================== 验证备份 ====================
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] 备份成功: $BACKUP_FILE (大小: $BACKUP_SIZE)"
else
    echo "[$(date)] 备份失败!" >&2
    exit 1
fi

# ==================== 清理过期备份 ====================
echo "[$(date)] 清理 ${RETENTION_DAYS} 天前的备份..."
find "$BACKUP_DIR" -name "${DB_NAME}_${BACKUP_TYPE}_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# ==================== 备份到远程（可选） ====================
# rsync -avz "$BACKUP_FILE" user@remote-server:/path/to/backups/

echo "[$(date)] 备份任务完成"
```

#### 7.3.2 数据库恢复脚本

创建 `scripts/restore.sh`：

```bash
#!/bin/bash
# ============================================
# 优伴AI 数据库恢复脚本
# 用法: ./restore.sh /path/to/backup.sql.gz
# ============================================

set -euo pipefail

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
    echo "用法: $0 <备份文件路径>"
    echo "示例: $0 /opt/backups/youban-ai/daily/youban_ai_daily_20260627_030000.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误: 备份文件不存在 - $BACKUP_FILE"
    exit 1
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-youban}"
DB_NAME="${DB_NAME:-youban_ai}"
DB_PASSWORD="${DB_PASSWORD}"

echo "⚠️  即将恢复数据库: $DB_NAME"
echo "   备份文件: $BACKUP_FILE"
echo "   目标: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""
read -rp "确认恢复? 输入 'yes' 继续: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "已取消恢复操作"
    exit 0
fi

echo "[$(date)] 开始恢复数据库..."

# 解压并恢复
gunzip -c "$BACKUP_FILE" | mysql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASSWORD" \
    "$DB_NAME"

echo "[$(date)] 数据库恢复完成"
```

#### 7.3.3 设置定时备份

```bash
# 编辑 crontab
crontab -e

# 添加以下定时任务
# 每日凌晨 3:00 备份
0 3 * * * /opt/youban-ai/scripts/backup.sh daily >> /var/log/youban-backup.log 2>&1

# 每周日凌晨 3:30 备份
30 3 * * 0 /opt/youban-ai/scripts/backup.sh weekly >> /var/log/youban-backup.log 2>&1

# 每月 1 号凌晨 4:00 备份
0 4 1 * * /opt/youban-ai/scripts/backup.sh monthly >> /var/log/youban-backup.log 2>&1
```

### 7.4 监控建议

#### 7.4.1 关键指标

| 监控指标           | 正常范围         | 告警阈值         | 说明                     |
| ------------------ | ---------------- | ---------------- | ------------------------ |
| CPU 使用率         | < 60%            | > 80% 持续 5 分钟 | 服务器 CPU 负载          |
| 内存使用率         | < 70%            | > 85%            | 服务器内存使用           |
| 磁盘使用率         | < 70%            | > 85%            | 磁盘空间                 |
| API 响应时间 (P50) | < 200ms          | > 500ms          | 接口延迟                 |
| API 响应时间 (P95) | < 1s             | > 3s             | 长尾延迟                 |
| API 错误率 (5xx)   | < 0.5%           | > 2%             | 服务端错误率             |
| API 错误率 (4xx)   | < 5%             | > 10%            | 客户端错误率             |
| 数据库连接数       | < 池大小 80%     | > 池大小 90%     | 数据库连接池使用率       |
| Redis 内存使用率   | < 70%            | > 80%            | Redis 内存               |
| Nginx 活跃连接数   | < 1000           | > 5000           | 并发连接                 |
| 服务可用性 (Uptime)| 99.9%+           | < 99.5%          | 服务在线时间             |

#### 7.4.2 推荐监控工具

| 工具           | 用途                         | 部署方式     |
| -------------- | ---------------------------- | ------------ |
| Prometheus     | 指标采集与存储               | Docker/二进制 |
| Grafana        | 可视化仪表盘                 | Docker/二进制 |
| Node Exporter  | 服务器指标采集               | 二进制       |
| PM2 内置监控   | 进程状态与资源使用           | 内置         |
| Uptime Kuma    | 服务可用性监控               | Docker       |
| Sentry         | 前端/后端错误追踪            | SaaS/自托管  |
| ELK Stack      | 集中式日志收集与分析         | Docker       |

#### 7.4.3 简易监控方案（PM2 + 系统命令）

```bash
# PM2 实时监控面板
pm2 monit

# 系统资源监控
htop                      # CPU/内存
df -h                     # 磁盘
sudo iotop -o             # 磁盘 I/O
sudo nethogs              # 网络流量

# 创建简易监控脚本
cat > /opt/scripts/monitor.sh <<'SCRIPT'
#!/bin/bash
echo "=== $(date) ==="
echo "CPU: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2+$4}')%"
echo "内存: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "磁盘: $(df -h / | awk 'NR==2{print $5}')"
echo "后端进程: $(pm2 jlist | grep -c '"status":"online"')/2 在线"
echo "MySQL: $(systemctl is-active mysql)"
echo "Redis: $(systemctl is-active redis-server)"
echo "Nginx: $(systemctl is-active nginx)"
SCRIPT
chmod +x /opt/scripts/monitor.sh
```

### 7.5 常见故障排查

#### 7.5.1 服务无法启动

**症状**：`pm2 status` 显示 `errored` 或反复重启

```bash
# 1. 查看详细错误日志
pm2 logs youban-backend --err --lines 50

# 2. 常见原因排查
# - 端口被占用
sudo ss -tlnp | grep 3000

# - 环境变量缺失
cat /opt/youban-ai/backend/.env | grep -v '^#' | grep -v '^$'

# - 依赖未安装
cd /opt/youban-ai/backend && npm ls --depth=0

# - 文件权限问题
ls -la /opt/youban-ai/backend/

# 3. 手动启动测试
cd /opt/youban-ai/backend && node src/index.js
```

#### 7.5.2 数据库连接失败

**症状**：日志中出现 `ECONNREFUSED`、`ER_ACCESS_DENIED_ERROR` 等

```bash
# 1. 检查 MySQL 是否运行
sudo systemctl status mysql

# 2. 测试连接
mysql -h localhost -u youban -p -e "SELECT 1"

# 3. 检查用户权限
mysql -u root -p -e "SHOW GRANTS FOR 'youban'@'localhost'"

# 4. 检查数据库是否存在
mysql -u root -p -e "SHOW DATABASES LIKE 'youban_ai'"

# 5. 检查最大连接数
mysql -u root -p -e "SHOW VARIABLES LIKE 'max_connections'"
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected'"

# 6. 检查 bind-address
grep bind-address /etc/mysql/mysql.conf.d/mysqld.cnf

# 7. 重启 MySQL
sudo systemctl restart mysql
```

#### 7.5.3 Redis 连接失败

**症状**：日志中出现 `NOAUTH`、`ECONNREFUSED` 等

```bash
# 1. 检查 Redis 是否运行
sudo systemctl status redis-server

# 2. 测试连接
redis-cli -a your_redis_password ping

# 3. 检查 bind 配置
grep "^bind" /etc/redis/redis.conf

# 4. 检查密码配置
grep "^requirepass" /etc/redis/redis.conf

# 5. 检查内存使用
redis-cli -a your_redis_password INFO memory | grep used_memory_human

# 6. 重启 Redis
sudo systemctl restart redis-server
```

#### 7.5.4 502 Bad Gateway

**症状**：Nginx 返回 502 错误

```bash
# 1. 检查后端是否运行
pm2 status

# 2. 检查 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 3. 检查 upstream 配置
# 确认 proxy_pass 地址与后端监听地址一致
grep -A 5 "proxy_pass" /etc/nginx/sites-enabled/youban-ai

# 4. 测试后端端口
curl -v http://127.0.0.1:3000/api/health

# 5. 检查 SELinux（CentOS）
sudo setenforce 0          # 临时关闭
sudo getenforce             # 查看状态
# 永久允许 Nginx 代理
sudo setsebool -P httpd_can_network_connect 1

# 6. 重载 Nginx
sudo nginx -t && sudo systemctl reload nginx
```

#### 7.5.5 前端白屏

**症状**：页面空白，控制台报 JS 加载错误

```bash
# 1. 检查构建产物
ls -la /opt/youban-ai/frontend/dist/
ls -la /opt/youban-ai/frontend/dist/assets/

# 2. 检查 Nginx 配置中的 root 路径
grep "root" /etc/nginx/sites-enabled/youban-ai

# 3. 检查文件权限
sudo chown -R www-data:www-data /opt/youban-ai/frontend/dist/

# 4. 检查浏览器控制台
# 通常为资源 404 或 JS 错误

# 5. 重新构建
cd /opt/youban-ai/frontend && npm run build
```

#### 7.5.6 SSL 证书过期

```bash
# 检查证书到期时间
sudo certbot certificates

# 手动续期
sudo certbot renew

# 检查自动续期定时器
sudo systemctl status certbot.timer

# 证书续期后重载 Nginx
sudo systemctl reload nginx
```

---

## 8. CI/CD 建议

### 8.1 GitHub Actions 工作流

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy 优伴AI

on:
  push:
    branches:
      - main
      - release/*
    tags:
      - 'v*'
  pull_request:
    branches:
      - main

env:
  REGISTRY: docker.io
  IMAGE_NAME_BACKEND: youban-ai/backend
  IMAGE_NAME_FRONTEND: youban-ai/frontend

jobs:
  # ==================== 代码检查 ====================
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: |
            frontend/package-lock.json
            backend/package-lock.json

      - name: Lint Frontend
        run: |
          cd frontend
          npm ci
          npm run lint || true

      - name: Lint Backend
        run: |
          cd backend
          npm ci
          npm run lint || true

  # ==================== 测试 ====================
  test:
    needs: lint
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test_password
          MYSQL_DATABASE: youban_ai_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd "mysqladmin ping -h localhost"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Run Backend Tests
        run: |
          cd backend
          npm ci
          npm test
        env:
          DB_HOST: localhost
          DB_PORT: 3306
          DB_USER: root
          DB_PASSWORD: test_password
          DB_NAME: youban_ai_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          REDIS_PASSWORD: ""
          JWT_SECRET: test_secret_key_for_ci_environment
          JWT_EXPIRES_IN: 1h

  # ==================== 构建与部署 ====================
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_FRONTEND }}
          tags: |
            type=ref,event=branch
            type=ref,event=tag
            type=sha,prefix=
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

      - name: Build & Push Backend Image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build & Push Frontend Image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_FRONTEND }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to Server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/youban-ai

            # 拉取最新镜像
            docker-compose pull

            # 重启服务
            docker-compose up -d --remove-orphans

            # 清理旧镜像
            docker image prune -f

            # 健康检查
            sleep 5
            curl -f http://localhost:3000/api/health || exit 1
            echo "✅ 部署完成"
```

### 8.2 部署密钥配置

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加以下 Secrets：

| Secret 名称        | 说明             |
| ------------------ | ---------------- |
| `DOCKER_USERNAME`  | Docker 注册表用户名 |
| `DOCKER_PASSWORD`  | Docker 注册表密码   |
| `DEPLOY_HOST`      | 生产服务器 IP 地址   |
| `DEPLOY_USER`      | 生产服务器 SSH 用户名 |
| `DEPLOY_SSH_KEY`   | 生产服务器 SSH 私钥   |

---

## 9. 安全检查清单

### 9.1 防火墙配置

```bash
# Ubuntu (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 80/tcp       # HTTP
sudo ufw allow 443/tcp      # HTTPS
sudo ufw enable

# 验证
sudo ufw status verbose

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

> ⚠️ **重要**：数据库端口（3306）和 Redis 端口（6379）不应对外开放！仅在本地或 Docker 内部网络访问。

### 9.2 数据库安全

- [ ] 使用强密码（至少 16 位，包含大小写字母、数字和特殊字符）
- [ ] 禁用远程 root 登录
- [ ] 删除匿名用户和测试数据库
- [ ] 限制数据库用户仅从 `localhost` 或 Docker 网络访问
- [ ] 定期审计数据库用户权限
- [ ] 启用 SSL/TLS 加密数据库连接（生产环境）

```bash
# 限制 MySQL 仅监听本地
sudo sed -i 's/^bind-address.*/bind-address = 127.0.0.1/' /etc/mysql/mysql.conf.d/mysqld.cnf

# 限制 Redis 仅监听本地
sudo sed -i 's/^bind .*/bind 127.0.0.1/' /etc/redis/redis.conf
```

### 9.3 HTTPS 强制

- [ ] 所有 HTTP 流量重定向到 HTTPS
- [ ] 启用 HSTS（HTTP Strict Transport Security）
- [ ] 使用强加密套件，禁用 TLS 1.0/1.1
- [ ] 配置 Let's Encrypt 自动续期
- [ ] 定期检查 SSL 证书到期时间

### 9.4 应用安全

- [ ] 所有环境变量中的密钥使用强随机值生成
- [ ] JWT Secret 至少 32 位随机字符
- [ ] 配置 CORS 严格限制允许的来源
- [ ] 配置请求速率限制（Rate Limiting）
- [ ] 对用户输入进行验证和清理
- [ ] 敏感操作（删除、修改）需要二次确认
- [ ] API 返回数据不暴露敏感信息（密码哈希、内部错误堆栈等）
- [ ] 启用 Helmet 安全头（Express）
- [ ] 文件上传限制类型和大小

### 9.5 服务器安全

- [ ] 禁用 root 直接 SSH 登录，使用密钥认证
- [ ] 配置 fail2ban 防止暴力破解
- [ ] 定期更新系统和软件包
- [ ] 配置自动安全更新
- [ ] 关闭不必要的服务
- [ ] 配置日志审计

```bash
# 禁用 root SSH 登录
sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 安装 fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban

# 配置自动安全更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 9.6 定期更新

```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# Node.js 依赖安全审计
cd /opt/youban-ai/backend && npm audit fix
cd /opt/youban-ai/frontend && npm audit fix

# Docker 镜像更新
docker-compose pull
docker-compose up -d

# 检查已安装包版本
npm outdated
```

### 9.7 安全审计检查表

| 检查项                       | 频率   | 责任人 |
| ---------------------------- | ------ | ------ |
| 操作系统安全更新             | 每周   | 运维   |
| SSL 证书到期检查             | 每月   | 运维   |
| 数据库备份完整性验证         | 每周   | 运维   |
| 依赖安全漏洞扫描（npm audit）| 每次部署 | 开发 |
| 访问日志异常审查             | 每周   | 运维   |
| 用户权限审计                 | 每季度 | 管理员 |
| 渗透测试                     | 每半年 | 安全   |
| 灾难恢复演练                 | 每半年 | 运维   |

---

> **文档维护**：本文档由优伴AI技术团队维护。如有疑问或建议，请联系开发团队。