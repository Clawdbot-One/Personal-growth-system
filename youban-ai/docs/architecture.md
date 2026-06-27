# 优伴AI 技术架构设计文档

---

## 版本信息

| 版本 | 日期 | 修订内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-06-27 | 初稿 | 技术团队 |

---

## 一、总体架构原则

### 1.1 核心原则

1. **前后端分离**：前端与后端通过 RESTful API 进行通信，各自独立开发、部署和扩展，接口契约先行。
2. **模块化设计**：按业务领域拆分为独立的功能模块，模块间低耦合、高内聚，便于团队并行开发和后期维护。
3. **分层架构**：后端采用 Controller → Service → Repository（DAO）三层架构，前端采用 View → Store → API 三层架构，职责清晰，易于测试。
4. **接口优先**：API 设计遵循 OpenAPI 3.0 规范，前后端基于接口文档并行开发，减少沟通成本。
5. **安全第一**：面向青少年用户群体，安全设计贯穿所有层级，包括传输安全、认证安全、数据安全、内容安全。
6. **可扩展性**：架构设计预留扩展点，支持未来功能迭代、性能伸缩和业务扩展。
7. **技术栈统一**：优先选择社区活跃、生态成熟的技术栈，降低技术风险和团队学习成本。

### 1.2 总体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Client)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ 桌面 Web  │  │ 平板 Web  │  │ 移动 Web  │  │ 微信小程序    │   │
│  │ (Chrome)  │  │ (Safari)  │  │ (H5)     │  │ (Future)     │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
└───────┼─────────────┼─────────────┼───────────────┼────────────┘
        │             │             │               │
        └─────────────┴──────┬──────┴───────────────┘
                             │
                   ┌─────────▼─────────┐
                   │    CDN / WAF      │
                   │  (静态资源加速)     │
                   └─────────┬─────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      网关层 (Gateway)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                Nginx / API Gateway                        │   │
│  │         (反向代理、限流、负载均衡、SSL 终结)                  │   │
│  └──────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                     应用服务层 (Application)                      │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   前端 SPA       │  │   后端 API       │                    │
│  │  Vue3 + Vite     │  │  Python/FastAPI  │                    │
│  │  Element Plus    │  │  或 Node/Express │                    │
│  │  Tailwind CSS    │  │  RESTful API     │                    │
│  └────────┬─────────┘  └────────┬─────────┘                    │
│           │                     │                               │
│           │         ┌───────────▼───────────┐                   │
│           │         │     AI 服务层          │                   │
│           │         │  (LLM API 调用封装)    │                   │
│           │         │  ┌─────────────────┐   │                   │
│           │         │  │ 对话管理         │   │                   │
│           │         │  │ 内容安全过滤     │   │                   │
│           │         │  │ 报告生成         │   │                   │
│           │         │  │ 推荐算法         │   │                   │
│           │         │  └─────────────────┘   │                   │
│           │         └───────────┬───────────┘                   │
└───────────┼─────────────────────┼───────────────────────────────┘
            │                     │
┌───────────▼─────────────────────▼───────────────────────────────┐
│                      数据层 (Data)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │PostgreSQL│  │  Redis   │  │ RabbitMQ │  │ 对象存储 OSS │   │
│  │ (主库)   │  │ (缓存)    │  │ (消息队列)│  │ (文件/图片)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、前端技术方案

### 2.1 技术选型

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| Vue | 3.4+ | Composition API、TypeScript 支持、响应式性能优异 |
| Vite | 5.x | 极速冷启动、HMR 热更新、开箱即用的 TypeScript 支持 |
| Element Plus | 2.x | 成熟的 Vue3 组件库，丰富的表单/表格/图表组件 |
| Tailwind CSS | 3.x | 原子化 CSS，开发效率高，样式一致性有保障 |
| Pinia | 2.x | Vue 官方状态管理库，TypeScript 友好，模块化设计 |
| Vue Router | 4.x | Vue 官方路由，支持嵌套路由、路由守卫、懒加载 |
| Axios | 1.x | 成熟的 HTTP 客户端，支持拦截器、请求取消 |
| ECharts | 5.x | 强大的图表库，满足评估报告和看板的数据可视化需求 |
| TypeScript | 5.x | 类型安全，提升代码可维护性和团队协作效率 |

### 2.2 架构分层

```
┌─────────────────────────────────────────────────────┐
│                    View Layer (视图层)                │
│  Pages / Components / Composables                   │
│  负责 UI 渲染、用户交互、事件处理                        │
├─────────────────────────────────────────────────────┤
│                State Management (状态管理层)          │
│  Pinia Stores (user / assessment / growth / ...)    │
│  负责全局状态管理、跨组件数据共享、缓存策略               │
├─────────────────────────────────────────────────────┤
│                 API Layer (接口请求层)                 │
│  Axios Instance / Interceptors / API Modules        │
│  负责 HTTP 请求封装、统一错误处理、请求/响应拦截           │
├─────────────────────────────────────────────────────┤
│                 Utility Layer (工具层)                │
│  Utils / Composables / Directives / Constants       │
│  负责通用工具函数、自定义组合式函数、指令、常量            │
├─────────────────────────────────────────────────────┤
│              Component Library (组件库)               │
│  Element Plus + Custom Components                   │
│  负责 UI 组件供给、主题定制、通用组件封装                 │
└─────────────────────────────────────────────────────┘
```

### 2.3 核心能力设计

#### 2.3.1 响应式布局

- 采用 Tailwind CSS 响应式断点：`sm`(640px)、`md`(768px)、`lg`(1024px)、`xl`(1280px)、`2xl`(1536px)
- 移动端优先策略，逐步增强至桌面端
- 关键布局方案：
  - 移动端：底部 TabBar 导航 + 单列内容区
  - 平板端：侧边折叠导航 + 双列内容区
  - 桌面端：固定侧边导航 + 多列宽屏内容区
- 图表组件使用 ECharts 的响应式配置，根据容器尺寸自适应渲染

#### 2.3.2 状态管理（Pinia）

```
stores/
├── user.ts          # 用户信息、认证状态、权限
├── assessment.ts    # 评估流程状态、答题进度、结果缓存
├── growth.ts        # 成长目标、任务列表、进度数据
├── companion.ts     # AI 对话状态、消息列表、连接状态
├── practice.ts      # 实践库内容、推荐列表、打卡状态
├── archive.ts       # 成长档案数据
├── notification.ts  # 通知消息、提醒状态
└── app.ts           # 全局应用状态（主题、加载、网络状态）
```

- 每个 Store 采用 Composition API 风格（`setup` 语法）
- 关键数据使用 `pinia-plugin-persistedstate` 持久化至 localStorage
- 评估流程中的答题状态实时持久化，防止刷新丢失

#### 2.3.3 路由设计（Vue Router）

```
/                           # 首页 / 欢迎页
/login                      # 登录
/register                   # 注册
/dashboard                  # 用户仪表盘（首页）
/assessment                 # 评估中心
  /assessment/start         # 开始评估（选择模式）
  /assessment/quiz/:id      # 答题页面
  /assessment/result/:id    # 评估报告
/assessment/history         # 评估历史
/growth                     # 成长路径
  /growth/goals             # 目标管理
  /growth/goal/:id          # 目标详情
  /growth/tasks             # 今日任务
/companion                  # AI 成长伴侣（对话页）
/practice                   # 优势实践库
  /practice/detail/:id      # 内容详情
  /practice/checkin         # 打卡记录
/profile                    # 个人中心
  /profile/settings         # 设置
  /profile/archive          # 成长档案
  /profile/achievements     # 成就与积分
```

- 路由懒加载：所有页面组件按需加载，减小首屏包体积
- 路由守卫：全局前置守卫检查登录状态，未登录跳转至登录页；已登录但访问受限页面跳转至 403
- 路由过渡动画：页面切换使用淡入淡出过渡效果

#### 2.3.4 请求封装（Axios）

```typescript
// 请求层核心设计
- 统一请求实例：baseURL、超时时间（30s）、默认请求头
- 请求拦截器：自动附加 JWT Token、请求 ID 生成
- 响应拦截器：统一错误码处理（401 跳登录、403 提示无权限、500 全局提示）
- Token 刷新：双 Token 机制（Access Token 30min + Refresh Token 7d），无感刷新
- 请求重试：网络异常自动重试（最多 3 次，指数退避）
- 请求取消：页面切换时自动取消未完成的请求
- 并发控制：限制同时发送的请求数（最多 6 个），防止浏览器连接数耗尽
```

#### 2.3.5 性能优化策略

| 策略 | 实现方式 |
|------|----------|
| 代码分割 | 路由级懒加载 + 组件级异步加载（`defineAsyncComponent`） |
| 资源优化 | 图片 WebP 格式 + 懒加载 + 响应式图片；字体子集化 |
| 缓存策略 | 静态资源强缓存（带 hash 文件名）；API 数据协商缓存 |
| 虚拟滚动 | 长列表（对话记录、实践库列表）使用虚拟滚动（`vue-virtual-scroller`） |
| 预加载 | 关键页面资源预加载（`<link rel="prefetch">`）；鼠标悬停时预加载详情页 |
| 打包优化 | Vite 的 Tree Shaking、Gzip 压缩、CDN 部署 |
| SSR/SSG | 后续版本考虑 Nuxt.js 进行服务端渲染，提升首屏速度和 SEO |

### 2.4 项目目录结构

```
youban-ai-web/
├── public/                    # 静态资源（不经过构建）
│   ├── favicon.ico
│   └── og-image.png
├── src/
│   ├── assets/                # 构建资源
│   │   ├── images/            # 图片资源
│   │   ├── icons/             # SVG 图标
│   │   └── styles/            # 全局样式
│   │       ├── variables.css  # CSS 变量（主题色、断点）
│   │       ├── reset.css      # 样式重置
│   │       └── tailwind.css   # Tailwind 入口
│   ├── components/            # 通用组件
│   │   ├── common/            # 基础组件（Button、Modal、Toast 等）
│   │   ├── business/          # 业务组件（RadarChart、GoalCard 等）
│   │   └── layout/            # 布局组件（AppLayout、TabBar、Sidebar）
│   ├── composables/           # 组合式函数
│   │   ├── useAuth.ts         # 认证相关
│   │   ├── useRequest.ts      # 请求封装
│   │   ├── usePagination.ts   # 分页逻辑
│   │   ├── useWebSocket.ts    # WebSocket 连接
│   │   └── useResponsive.ts   # 响应式断点检测
│   ├── directives/            # 自定义指令
│   │   ├── v-permission.ts    # 权限指令
│   │   ├── v-lazy.ts          # 图片懒加载
│   │   └── v-debounce.ts      # 防抖指令
│   ├── pages/                 # 页面组件
│   │   ├── dashboard/         # 仪表盘
│   │   ├── assessment/        # 评估模块
│   │   ├── growth/            # 成长路径
│   │   ├── companion/         # AI 伴侣
│   │   ├── practice/          # 实践库
│   │   └── profile/           # 个人中心
│   ├── router/                # 路由配置
│   │   ├── index.ts           # 路由入口
│   │   ├── routes.ts          # 路由表
│   │   └── guards.ts          # 路由守卫
│   ├── stores/                # Pinia 状态管理
│   │   ├── user.ts
│   │   ├── assessment.ts
│   │   ├── growth.ts
│   │   ├── companion.ts
│   │   ├── practice.ts
│   │   ├── archive.ts
│   │   ├── notification.ts
│   │   └── app.ts
│   ├── api/                   # API 请求模块
│   │   ├── request.ts         # Axios 实例与拦截器
│   │   ├── modules/           # 按业务模块拆分
│   │   │   ├── auth.ts
│   │   │   ├── assessment.ts
│   │   │   ├── growth.ts
│   │   │   ├── companion.ts
│   │   │   ├── practice.ts
│   │   │   ├── archive.ts
│   │   │   └── admin.ts
│   │   └── types.ts           # API 响应类型定义
│   ├── utils/                 # 工具函数
│   │   ├── format.ts          # 格式化（日期、数字）
│   │   ├── validate.ts        # 校验工具
│   │   ├── storage.ts         # 本地存储封装
│   │   └── crypto.ts          # 前端加密工具
│   ├── constants/             # 常量定义
│   │   ├── assessment.ts      # 评估相关常量
│   │   └── index.ts           # 全局常量
│   ├── types/                 # TypeScript 类型定义
│   │   ├── user.d.ts
│   │   ├── assessment.d.ts
│   │   └── api.d.ts
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── postcss.config.js
```

---

## 三、后端技术方案

### 3.1 技术选型

| 技术 | 选型理由 |
|------|----------|
| **Python 3.11+ / FastAPI** | 异步支持好、自动生成 OpenAPI 文档、类型提示完善、AI/ML 生态丰富；适合需要大量 AI 集成的场景 |
| **备选：Node.js / Express + TypeScript** | 如团队前端技术栈更强，可选用 Node.js 实现全栈 TypeScript，降低上下文切换成本 |
| PostgreSQL 15+ | 成熟的关系型数据库，支持 JSON 字段、全文搜索、窗口函数，适合复杂查询 |
| Redis 7+ | 高性能缓存、会话存储、分布式锁、排行榜（Sorted Set） |
| RabbitMQ | 可靠的消息队列，用于异步任务（报告生成、通知推送、数据分析） |
| SQLAlchemy 2.0 (Python) / Prisma (Node) | 数据库 ORM，类型安全、迁移管理 |
| Alembic (Python) / Prisma Migrate (Node) | 数据库迁移工具 |
| Pydantic (Python) / Zod (Node) | 数据校验与序列化 |
| Celery (Python) / BullMQ (Node) | 异步任务队列 |

### 3.2 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                   Controller Layer (控制器层)             │
│  - 接收 HTTP 请求，参数校验，调用 Service，返回响应        │
│  - 职责：路由定义、请求解析、响应格式化、权限校验           │
├─────────────────────────────────────────────────────────┤
│                    Service Layer (服务层)                 │
│  - 核心业务逻辑处理，编排多个 Repository 调用             │
│  - 职责：业务规则、事务管理、缓存策略、第三方服务调用        │
├─────────────────────────────────────────────────────────┤
│                 Repository Layer (数据访问层)              │
│  - 数据持久化操作，封装数据库查询                          │
│  - 职责：CRUD 操作、查询构建、数据映射、批量操作           │
├─────────────────────────────────────────────────────────┤
│                   Common Layer (公共层)                   │
│  - 横切关注点：日志、异常处理、工具函数、常量定义          │
│  - 职责：提供跨层共享的基础能力                           │
└─────────────────────────────────────────────────────────┘
```

### 3.3 核心能力设计

#### 3.3.1 RESTful API 设计规范

```
# 基础路径：/api/v1

# 认证模块
POST   /api/v1/auth/register          # 注册
POST   /api/v1/auth/login             # 登录
POST   /api/v1/auth/refresh           # 刷新 Token
POST   /api/v1/auth/logout            # 登出

# 用户模块
GET    /api/v1/users/me               # 获取当前用户信息
PUT    /api/v1/users/me               # 更新个人信息
DELETE /api/v1/users/me               # 注销账号
GET    /api/v1/users/me/archive       # 获取成长档案

# 评估模块
GET    /api/v1/assessments            # 获取评估列表
POST   /api/v1/assessments            # 创建新评估
GET    /api/v1/assessments/:id        # 获取评估详情
POST   /api/v1/assessments/:id/answers  # 提交答题
GET    /api/v1/assessments/:id/report # 获取评估报告
GET    /api/v1/assessments/trend      # 获取趋势数据

# 成长目标模块
GET    /api/v1/goals                  # 获取目标列表
POST   /api/v1/goals                  # 创建目标
GET    /api/v1/goals/:id              # 获取目标详情
PUT    /api/v1/goals/:id              # 更新目标
DELETE /api/v1/goals/:id              # 删除目标
POST   /api/v1/goals/:id/tasks        # 创建任务
PUT    /api/v1/goals/:id/tasks/:tid   # 更新任务状态
GET    /api/v1/goals/:id/progress     # 获取进度

# AI 伴侣模块
POST   /api/v1/companion/chat         # 发送消息（流式响应）
GET    /api/v1/companion/history      # 获取对话历史
GET    /api/v1/companion/summary      # 获取对话摘要
POST   /api/v1/companion/review       # 触发回顾对话

# 实践库模块
GET    /api/v1/practices              # 获取内容列表（支持筛选/推荐）
GET    /api/v1/practices/:id          # 获取内容详情
POST   /api/v1/practices/:id/checkin  # 打卡
GET    /api/v1/practices/checkins     # 获取打卡记录
GET    /api/v1/practices/recommend    # 获取个性化推荐

# 管理后台模块
GET    /api/v1/admin/users            # 用户管理列表
GET    /api/v1/admin/dashboard        # 运营数据看板
POST   /api/v1/admin/content          # 创建内容
PUT    /api/v1/admin/content/:id      # 更新内容
GET    /api/v1/admin/logs             # 操作日志
```

#### 3.3.2 JWT 认证方案

```
认证流程：
1. 用户登录成功后，服务端返回 Access Token (30min) + Refresh Token (7d)
2. Access Token 携带在请求头 Authorization: Bearer <token>
3. Access Token 过期时，前端自动使用 Refresh Token 换取新的 Access Token
4. Refresh Token 过期时，用户需重新登录

Token 结构：
- Access Token: { sub: user_id, role: user_role, exp: timestamp, iat: timestamp }
- Refresh Token: { sub: user_id, jti: unique_id, exp: timestamp }

安全措施：
- Token 使用 RS256 非对称加密签名
- Refresh Token 存储在 Redis 中，支持主动失效
- 密码修改后，所有 Refresh Token 立即失效
- 登录失败 5 次后，账号锁定 15 分钟
- 支持多设备登录，每设备独立的 Refresh Token
```

#### 3.3.3 参数校验

```python
# Python/FastAPI 示例
from pydantic import BaseModel, Field, validator
from typing import Optional

class CreateGoalRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="目标标题")
    description: Optional[str] = Field(None, max_length=500)
    category: str = Field(..., description="目标分类")
    priority: int = Field(default=1, ge=1, le=5, description="优先级 1-5")
    due_date: Optional[datetime] = None
    dimension_ids: list[int] = Field(default_factory=list, description="关联优势维度")

    @validator("category")
    def validate_category(cls, v):
        allowed = {"language", "logic", "spatial", "bodily",
                   "musical", "interpersonal", "intrapersonal", "naturalistic"}
        if v not in allowed:
            raise ValueError(f"无效的分类: {v}")
        return v
```

#### 3.3.4 统一异常处理

```python
# 全局异常处理中间件
class AppException(Exception):
    def __init__(self, code: int, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

# 统一响应格式
{
    "code": 0,           # 0 = 成功，非 0 = 错误码
    "message": "success",
    "data": { ... },     # 业务数据
    "request_id": "uuid" # 请求追踪 ID
}

# 错误码规范
# 1000-1999: 认证相关
# 2000-2999: 用户相关
# 3000-3999: 评估相关
# 4000-4999: 成长路径相关
# 5000-5999: AI 伴侣相关
# 6000-6999: 实践库相关
# 9000-9999: 系统通用错误
```

#### 3.3.5 AI 中间件层

```
┌─────────────────────────────────────────────┐
│              AI Gateway (AI 网关)            │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ 请求路由  │ │ 模型选择  │ │ 成本控制     │ │
│  └────┬─────┘ └────┬─────┘ └──────┬──────┘ │
│       │             │              │         │
│  ┌────▼─────────────▼──────────────▼──────┐ │
│  │           LLM Provider Layer           │ │
│  │  ┌──────────┐  ┌────────────────────┐  │ │
│  │  │  OpenAI   │  │  国产模型（备选）    │  │ │
│  │  │  GPT-4o   │  │  通义千问 / 文心一言 │  │ │
│  │  └──────────┘  └────────────────────┘  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │          AI 能力模块                    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ │ │
│  │  │ 对话引擎  │ │ 内容安全  │ │评估引擎│ │ │
│  │  │ - 上下文  │ │ - 敏感词  │ │- 报告  │ │ │
│  │  │ - 人格化  │ │ - 风险检测│ │  生成  │ │ │
│  │  │ - 流式输出│ │ - 审核    │ │- 评语  │ │ │
│  │  └──────────┘ └──────────┘ └────────┘ │ │
│  │  ┌──────────┐ ┌────────────────────┐  │ │
│  │  │ 推荐引擎  │ │  Prompt 管理       │  │ │
│  │  │ - 协同过滤│ │ - 模板库           │  │ │
│  │  │ - 内容召回│ │ - 版本控制         │  │ │
│  │  │ - 排序    │ │ - A/B 测试         │  │ │
│  │  └──────────┘ └────────────────────┘  │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 3.4 项目目录结构

```
youban-ai-server/
├── app/
│   ├── api/                    # API 路由层 (Controller)
│   │   ├── v1/                 # API v1 版本
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── assessments.py
│   │   │   ├── goals.py
│   │   │   ├── companion.py
│   │   │   ├── practices.py
│   │   │   └── admin.py
│   │   └── deps.py             # 依赖注入（认证、权限）
│   ├── services/               # 业务逻辑层 (Service)
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── assessment_service.py
│   │   ├── growth_service.py
│   │   ├── companion_service.py
│   │   ├── practice_service.py
│   │   └── report_service.py
│   ├── repositories/           # 数据访问层 (Repository)
│   │   ├── user_repo.py
│   │   ├── assessment_repo.py
│   │   ├── goal_repo.py
│   │   ├── conversation_repo.py
│   │   └── practice_repo.py
│   ├── models/                 # 数据库模型 (ORM)
│   │   ├── user.py
│   │   ├── assessment.py
│   │   ├── goal.py
│   │   ├── conversation.py
│   │   └── practice.py
│   ├── schemas/                # Pydantic 数据校验模型
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── assessment.py
│   │   └── ...
│   ├── ai/                     # AI 相关模块
│   │   ├── gateway.py          # AI 网关（LLM 调用统一入口）
│   │   ├── providers/          # 模型提供商适配
│   │   │   ├── base.py
│   │   │   ├── openai.py
│   │   │   └── qwen.py
│   │   ├── engine/             # AI 引擎
│   │   │   ├── dialogue.py     # 对话引擎
│   │   │   ├── safety.py       # 内容安全引擎
│   │   │   ├── report.py       # 报告生成引擎
│   │   │   └── recommend.py    # 推荐引擎
│   │   └── prompts/            # Prompt 模板管理
│   │       ├── companion.py
│   │       ├── assessment.py
│   │       └── review.py
│   ├── core/                   # 核心配置
│   │   ├── config.py           # 应用配置
│   │   ├── security.py         # 安全相关（JWT、密码哈希）
│   │   ├── database.py         # 数据库连接与会话管理
│   │   ├── redis.py            # Redis 连接
│   │   └── middleware.py       # 中间件（CORS、日志、限流）
│   ├── common/                 # 公共工具
│   │   ├── exceptions.py       # 自定义异常
│   │   ├── response.py         # 统一响应格式
│   │   ├── logger.py           # 日志配置
│   │   └── utils.py            # 工具函数
│   └── tasks/                  # 异步任务
│       ├── celery_app.py       # Celery 配置
│       ├── report_tasks.py     # 报告生成任务
│       └── notification_tasks.py  # 通知推送任务
├── migrations/                 # 数据库迁移文件
├── tests/                      # 测试
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── requirements.txt            # Python 依赖
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── main.py                     # 应用入口
```

---

## 四、缓存与中间件

### 4.1 Redis 缓存策略

| 缓存场景 | 数据类型 | 过期策略 | 说明 |
|----------|----------|----------|------|
| 用户会话 | String | 与 Refresh Token 同步 | 存储用户登录态和设备信息 |
| API 响应缓存 | String (JSON) | 5-30 分钟，随机抖动 | 热门内容列表、配置数据等读多写少的数据 |
| 评估答题状态 | Hash | 24 小时 | 答题过程中的临时状态暂存，提交后清除 |
| 排行榜 | Sorted Set | 每小时更新 | 积分排行榜，按 score 排序 |
| 推荐结果缓存 | String | 1 小时 | 个性化推荐结果，用户行为变化时主动失效 |
| 限流计数器 | String + TTL | 窗口期过期 | 基于滑动窗口的 API 限流 |
| 分布式锁 | String (SET NX) | 30 秒自动释放 | 防止并发操作冲突（如重复创建评估） |
| AI 对话上下文 | List | 30 分钟（对话结束后） | 对话历史上下文暂存，结束后持久化至 DB |

### 4.2 消息队列（异步任务）

| 任务类型 | 队列 | 说明 |
|----------|------|------|
| 评估报告生成 | `report_generation` | 评估完成后异步生成详细报告（含 AI 评语） |
| 推送通知 | `notification` | 任务提醒、成就通知、激励推送等批量发送 |
| 数据分析 | `analytics` | 用户行为数据聚合、指标计算 |
| 内容审核 | `content_review` | UGC 内容异步送审 |
| 数据导出 | `data_export` | 用户档案导出、管理员数据导出 |
| 定期回顾 | `scheduled_review` | 每日/每周/每月回顾的定时触发 |

### 4.3 定时任务

| 任务 | 频率 | 说明 |
|------|------|------|
| 每日回顾推送 | 每天 20:00 | 向活跃用户发送每日回顾提醒 |
| 每周报告生成 | 每周日 18:00 | 生成用户周度成长报告 |
| 月度报告生成 | 每月 1 日 08:00 | 生成用户月度成长报告 |
| 重评提醒 | 每 3 个月 | 提醒用户重新评估，更新画像 |
| 数据备份 | 每天 02:00 | 数据库全量备份至对象存储 |
| 日志归档 | 每天 03:00 | 将超过 30 天的日志归档压缩 |
| 缓存预热 | 每天 06:00 | 预热热门数据缓存 |
| 推荐模型更新 | 每天 04:00 | 基于新增行为数据更新推荐模型 |

---

## 五、性能指标

### 5.1 前端性能

| 指标 | 目标值 | 测量工具 |
|------|--------|----------|
| FCP (First Contentful Paint) | < 1.2s | Lighthouse |
| LCP (Largest Contentful Paint) | < 2.0s | Lighthouse |
| TBT (Total Blocking Time) | < 200ms | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| TTI (Time to Interactive) | < 3.0s | Lighthouse |
| 首屏 JS 包体积 | < 200KB (gzip) | Vite build analyzer |
| 路由切换耗时 | < 500ms | Performance API |

### 5.2 后端性能

| 指标 | 目标值 | 测量工具 |
|------|--------|----------|
| 简单 API 响应时间 | P95 < 100ms | APM 监控 |
| 复杂查询 API 响应时间 | P95 < 200ms | APM 监控 |
| AI 对话首字延迟 | P95 < 1.5s | 端到端监控 |
| 评估报告生成 | P95 < 3s | 异步任务监控 |
| 并发请求处理 | 1000+ QPS (峰值) | 压力测试 |
| 数据库连接池利用率 | < 80% | 数据库监控 |
| 错误率 | < 0.1% | 日志分析 |

### 5.3 并发用户支持

| 场景 | 并发用户数 | 策略 |
|------|-----------|------|
| 常规在线 | 500+ | 无状态 API 水平扩展、数据库读写分离 |
| 峰值在线 | 1000+ | 自动扩容（K8s HPA）、CDN 分流、缓存预热 |
| AI 对话并发 | 200+ | LLM API 调用队列化、流式响应、连接池复用 |
| 评估并发 | 300+ | 评估状态 Redis 缓存、结果异步计算 |

---

## 六、部署架构

### 6.1 Docker 容器化

```
# 容器清单
┌─────────────────────────────────────────────────────┐
│  youban-web       │ 前端 Nginx + Vue SPA 静态文件    │
│  youban-server    │ 后端 FastAPI 应用                │
│  youban-worker    │ Celery 异步任务 Worker           │
│  youban-beat      │ Celery Beat 定时任务调度器        │
│  postgres         │ PostgreSQL 15 数据库             │
│  redis            │ Redis 7 缓存                    │
│  rabbitmq         │ RabbitMQ 消息队列                │
│  nginx            │ 反向代理网关                      │
└─────────────────────────────────────────────────────┘
```

### 6.2 Docker Compose 编排

```yaml
# docker-compose.yml 核心服务定义（概要）

services:
  # 前端服务
  web:
    build: ./youban-ai-web
    ports: ["3000:80"]
    depends_on: [server]

  # 后端 API 服务
  server:
    build: ./youban-ai-server
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq
    depends_on: [postgres, redis, rabbitmq]
    deploy:
      replicas: 2  # 多副本部署

  # 异步任务 Worker
  worker:
    build: ./youban-ai-server
    command: celery -A app.tasks worker --loglevel=info
    depends_on: [postgres, redis, rabbitmq]
    deploy:
      replicas: 2

  # 定时任务调度器
  beat:
    build: ./youban-ai-server
    command: celery -A app.tasks beat --loglevel=info
    depends_on: [postgres, redis, rabbitmq]

  # 数据库
  postgres:
    image: postgres:15-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: youban_ai
      POSTGRES_USER: youban
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  # 缓存
  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]

  # 消息队列
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: youban
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}

  # 反向代理
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: [./nginx.conf:/etc/nginx/nginx.conf]
    depends_on: [web, server]

volumes:
  postgres_data:
  redis_data:
```

### 6.3 生产环境部署拓扑

```
                    ┌──────────────┐
                    │   DNS / CDN  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  WAF / 防火墙 │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Nginx 网关   │
                    │  (负载均衡)   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼──────┐ ┌──▼──────────┐
       │ Web Server 1│ │Web Svr 2│ │ API Server 1 │
       │ (Nginx+SPA) │ │         │ │ (FastAPI)    │
       └─────────────┘ └─────────┘ └──────┬───────┘
                                          │
                               ┌──────────┼──────────┐
                               │          │          │
                        ┌──────▼──┐ ┌────▼───┐ ┌───▼──────┐
                        │ API Svr │ │ Worker │ │  Worker  │
                        │    2    │ │   1    │ │    2     │
                        └──────┬──┘ └────┬───┘ └────┬─────┘
                               │          │          │
                               └──────────┼──────────┘
                                          │
                    ┌─────────────────────┼─────────────────┐
                    │                     │                 │
             ┌──────▼──────┐  ┌──────────▼───┐  ┌─────────▼──┐
             │ PostgreSQL  │  │    Redis      │  │  RabbitMQ  │
             │  (主从)     │  │  (Sentinel)   │  │  (Cluster) │
             └─────────────┘  └──────────────┘  └────────────┘
```

---

## 七、扩展性考量

### 7.1 水平扩展

| 组件 | 扩展策略 |
|------|----------|
| 前端静态服务 | CDN 分发 + Nginx 多实例部署，无状态，可任意扩展 |
| API 服务 | 无状态设计，通过 Nginx 反向代理 + 负载均衡水平扩展，支持 K8s HPA 自动扩缩容 |
| Worker 服务 | 基于消息队列的工作节点，按队列积压量动态增减 Worker 数量 |
| 数据库 | 主从复制 + 读写分离；后续可考虑分库分表（按 user_id 哈希） |
| Redis | Redis Sentinel 高可用 + 分片（Redis Cluster） |
| 消息队列 | RabbitMQ 集群模式，支持镜像队列保障消息可靠性 |

### 7.2 功能扩展预留

| 扩展方向 | 预留设计 |
|----------|----------|
| 微信小程序 | API 层已按 RESTful 设计，前端可复用 API；小程序端独立开发 |
| 多语言支持 | 前端使用 vue-i18n 国际化方案，后端错误消息和提示文案支持多语言配置 |
| 第三方登录 | 认证模块预留 OAuth2.0 扩展接口，支持微信/QQ/Apple 登录 |
| 付费体系 | 用户模型预留会员等级和订阅状态字段，权限模块支持按角色/等级控制功能访问 |
| 开放平台 | API 设计遵循 OpenAPI 3.0 规范，后续可直接导出文档供第三方集成 |
| 数据中台 | 日志和数据采集采用标准化格式，便于后续接入数据仓库和 BI 工具 |
| AI 模型切换 | AI 网关层抽象了 Provider 接口，支持无缝切换底层 LLM 模型 |

### 7.3 技术演进路径

```
Phase 1 (MVP)              Phase 2 (Growth)           Phase 3 (Scale)
─────────────────────────────────────────────────────────────────────
单机 Docker Compose  →    多机 Swarm / K8s     →    多区域 K8s 集群
单实例 PostgreSQL    →    PostgreSQL 主从      →    分库分表 + 读写分离
单实例 Redis         →    Redis Sentinel       →    Redis Cluster
同步处理              →    异步任务 + 消息队列   →    事件驱动架构
单体 API             →    模块化 API             →    微服务拆分
手工部署             →    CI/CD (GitHub Actions) →   GitOps (ArgoCD)
```

---

## 附录

### A. 关键技术决策记录

| 决策 | 选项 | 选择 | 理由 |
|------|------|------|------|
| 后端语言 | Python vs Node.js | Python/FastAPI | AI/ML 生态更成熟，类型提示完善，异步性能优秀 |
| 数据库 | PostgreSQL vs MySQL | PostgreSQL | JSON 支持更好，全文搜索更强，扩展性更优 |
| 消息队列 | RabbitMQ vs Kafka | RabbitMQ | 当前规模下更轻量，管理界面友好，协议支持广泛 |
| 前端状态管理 | Pinia vs Vuex | Pinia | Vue 官方推荐，TypeScript 支持更好，API 更简洁 |
| CSS 方案 | Tailwind vs SCSS | Tailwind CSS | 原子化提高效率，样式一致性更强，打包体积更小 |

### B. 参考文档

- Vue 3 官方文档: https://vuejs.org/
- Vite 官方文档: https://vitejs.dev/
- Element Plus 文档: https://element-plus.org/
- Tailwind CSS 文档: https://tailwindcss.com/
- FastAPI 官方文档: https://fastapi.tiangolo.com/
- PostgreSQL 文档: https://www.postgresql.org/docs/
- Redis 文档: https://redis.io/docs/
- Celery 文档: https://docs.celeryq.dev/