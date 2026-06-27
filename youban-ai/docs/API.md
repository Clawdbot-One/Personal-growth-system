# 优伴AI — API 接口文档

> 版本：v1.0  
> 更新日期：2026-06-27  
> 状态：已发布

---

## 目录

1. [API 约定](#1-api-约定)
   - [1.1 基础信息](#11-基础信息)
   - [1.2 请求格式](#12-请求格式)
   - [1.3 响应格式](#13-响应格式)
   - [1.4 HTTP 状态码](#14-http-状态码)
   - [1.5 业务错误码](#15-业务错误码)
2. [认证模块 — Auth](#2-认证模块--auth)
3. [测评模块 — Assessment](#3-测评模块--assessment)
4. [成长模块 — Growth](#4-成长模块--growth)
5. [AI 对话模块 — Chat](#5-ai-对话模块--chat)
6. [实践模块 — Practice](#6-实践模块--practice)
7. [档案模块 — Archive](#7-档案模块--archive)
8. [管理模块 — Admin](#8-管理模块--admin)

---

## 1. API 约定

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 生产环境 | `https://api.youban-ai.com/v1` |
| 测试环境 | `https://api-test.youban-ai.com/v1` |
| 协议 | HTTPS |
| 请求格式 | `application/json` |
| 响应格式 | `application/json` |
| 字符编码 | UTF-8 |
| 认证方式 | JWT Bearer Token（Header: `Authorization: Bearer <token>`） |

### 1.2 请求格式

所有 `POST` / `PUT` 请求使用 JSON 格式，需设置 Header：

```
Content-Type: application/json
```

需要认证的接口需设置 Header：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 1.3 响应格式

#### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    // 业务数据
  },
  "timestamp": 1719446400
}
```

#### 分页响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 150,
      "total_pages": 8
    }
  },
  "timestamp": 1719446400
}
```

#### 错误响应

```json
{
  "code": 40101,
  "message": "未登录或Token已过期",
  "data": null,
  "timestamp": 1719446400
}
```

### 1.4 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| `200` | 请求成功 |
| `201` | 创建成功 |
| `400` | 请求参数错误 |
| `401` | 未认证 |
| `403` | 无权限 |
| `404` | 资源不存在 |
| `409` | 资源冲突 |
| `422` | 请求参数校验失败 |
| `429` | 请求频率超限 |
| `500` | 服务器内部错误 |
| `503` | 服务暂不可用 |

### 1.5 业务错误码

| 错误码 | 说明 |
|--------|------|
| `0` | 成功 |
| `40001` | 参数缺失 |
| `40002` | 参数格式错误 |
| `40003` | 参数值非法 |
| `40101` | 未登录或 Token 已过期 |
| `40102` | 用户名或密码错误 |
| `40103` | 账号已被禁用 |
| `40301` | 无操作权限 |
| `40302` | 会员权限不足 |
| `40401` | 用户不存在 |
| `40402` | 目标不存在 |
| `40403` | 任务不存在 |
| `40404` | 项目不存在 |
| `40405` | 会话不存在 |
| `40901` | 手机号已注册 |
| `40902` | 资源状态冲突 |
| `42901` | 请求过于频繁，请稍后重试 |
| `50001` | 服务器内部错误 |
| `50002` | AI 服务异常 |

---

## 2. 认证模块 — Auth

### 2.1 POST /api/auth/login

**描述**：用户登录，返回 JWT Token。

**认证**：否

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `phone` | `string` | 是 | 手机号 |
| `password` | `string` | 是 | 密码（明文，传输层 HTTPS 加密） |

**请求示例**：

```json
{
  "phone": "13800138000",
  "password": "Abc12345"
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "user": {
      "id": 1,
      "phone": "138****8000",
      "nickname": "小明",
      "avatar": "https://cdn.youban-ai.com/avatars/1.jpg",
      "member_level": 1,
      "member_expire_at": "2027-06-27T00:00:00Z"
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40102` | 手机号或密码错误 |
| `40103` | 账号已被禁用 |

---

### 2.2 POST /api/auth/register

**描述**：用户注册。

**认证**：否

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `phone` | `string` | 是 | 手机号 |
| `password` | `string` | 是 | 密码（8-20位，含字母和数字） |
| `nickname` | `string` | 否 | 昵称，默认使用系统生成 |
| `sms_code` | `string` | 是 | 短信验证码 |

**请求示例**：

```json
{
  "phone": "13800138000",
  "password": "Abc12345",
  "nickname": "小明",
  "sms_code": "123456"
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200,
    "user": {
      "id": 1,
      "phone": "138****8000",
      "nickname": "小明",
      "avatar": null,
      "member_level": 0,
      "member_expire_at": null
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40901` | 手机号已注册 |
| `40002` | 短信验证码错误或已过期 |
| `40003` | 密码格式不符合要求 |

---

### 2.3 POST /api/auth/logout

**描述**：用户登出，使当前 Token 失效。

**认证**：是

**请求参数**：无

**请求示例**：

```json
{}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": null,
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |

---

### 2.4 GET /api/auth/profile

**描述**：获取当前登录用户信息。

**认证**：是

**请求参数**：无

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "138****8000",
    "nickname": "小明",
    "avatar": "https://cdn.youban-ai.com/avatars/1.jpg",
    "member_level": 1,
    "member_expire_at": "2027-06-27T00:00:00Z",
    "status": 1,
    "created_at": "2026-01-15T10:30:00Z",
    "last_login_at": "2026-06-27T08:00:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |

---

### 2.5 PUT /api/auth/profile

**描述**：更新当前用户个人信息。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `nickname` | `string` | 否 | 新昵称 |
| `avatar` | `string` | 否 | 新头像 URL |

**请求示例**：

```json
{
  "nickname": "大明白",
  "avatar": "https://cdn.youban-ai.com/avatars/2.jpg"
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "nickname": "大明白",
    "avatar": "https://cdn.youban-ai.com/avatars/2.jpg"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40003` | 昵称长度超过限制（最大 64 字符） |

---

## 3. 测评模块 — Assessment

### 3.1 GET /api/assessment/questions

**描述**：获取测评题目列表。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | `string` | 是 | 测评类型：`quick`（快速测评，10题）、`full`（完整测评，40题） |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "type": "quick",
    "total": 10,
    "questions": [
      {
        "id": 1,
        "type": "talent",
        "dimension": "逻辑推理",
        "question_text": "当面对一个复杂问题时，你通常：",
        "options": [
          {"label": "A", "text": "先分析问题的各个部分再行动", "score": 5},
          {"label": "B", "text": "凭直觉快速做出判断", "score": 3},
          {"label": "C", "text": "向他人请教后再决定", "score": 4},
          {"label": "D", "text": "先尝试再根据结果调整", "score": 2}
        ],
        "difficulty": 2
      }
    ]
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40003` | type 参数值非法（仅支持 `quick` / `full`） |

---

### 3.2 POST /api/assessment/submit

**描述**：提交测评答案，生成测评报告。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | `string` | 是 | 测评类型：`quick` / `full` |
| `answers` | `array` | 是 | 答案列表 |

**answers 数组元素**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `question_id` | `integer` | 是 | 题目 ID |
| `selected` | `string` | 是 | 选中的选项（如 "A"） |

**请求示例**：

```json
{
  "type": "quick",
  "answers": [
    {"question_id": 1, "selected": "A"},
    {"question_id": 2, "selected": "C"},
    {"question_id": 3, "selected": "B"}
  ]
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "result_id": 42,
    "assessment_type": "quick",
    "scores": {
      "逻辑推理": 85,
      "沟通表达": 72,
      "创造力": 90,
      "领导力": 68,
      "共情能力": 78
    },
    "top_strengths": ["创造力", "逻辑推理", "共情能力"],
    "full_report": {
      "summary": "你的核心优势在于创造性思维和逻辑分析能力...",
      "dimensions": [
        {
          "name": "逻辑推理",
          "score": 85,
          "level": "优秀",
          "analysis": "你在逻辑推理方面表现出色，能够快速识别问题的关键要素...",
          "suggestions": ["可以尝试参与辩论活动进一步提升", "推荐阅读《批判性思维工具》"]
        }
      ],
      "overall_advice": "基于你的测评结果，建议重点关注领导力方向的提升..."
    },
    "duration": 180,
    "created_at": "2026-06-27T10:30:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40001` | 答案列表为空 |
| `40002` | 答案数量与题目数量不匹配 |

---

### 3.3 GET /api/assessment/reports

**描述**：获取用户所有测评报告列表。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | `string` | 否 | 筛选类型：`quick` / `full`，不传则返回全部 |
| `page` | `integer` | 否 | 页码，默认 `1` |
| `size` | `integer` | 否 | 每页条数，默认 `10`，最大 `50` |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 42,
        "assessment_type": "quick",
        "top_strengths": ["创造力", "逻辑推理", "共情能力"],
        "duration": 180,
        "created_at": "2026-06-27T10:30:00Z"
      },
      {
        "id": 35,
        "assessment_type": "full",
        "top_strengths": ["逻辑推理", "领导力", "沟通表达"],
        "duration": 420,
        "created_at": "2026-06-20T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 5,
      "total_pages": 1
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |

---

### 3.4 GET /api/assessment/reports/:id

**描述**：获取指定测评报告的完整详情。

**认证**：是

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `integer` | 是 | 报告 ID |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 42,
    "assessment_type": "quick",
    "scores": {
      "逻辑推理": 85,
      "沟通表达": 72,
      "创造力": 90,
      "领导力": 68,
      "共情能力": 78
    },
    "top_strengths": ["创造力", "逻辑推理", "共情能力"],
    "full_report": {
      "summary": "你的核心优势在于创造性思维和逻辑分析能力...",
      "dimensions": [
        {
          "name": "逻辑推理",
          "score": 85,
          "level": "优秀",
          "analysis": "你在逻辑推理方面表现出色..."
        }
      ],
      "overall_advice": "基于你的测评结果，建议重点关注领导力方向的提升..."
    },
    "duration": 180,
    "created_at": "2026-06-27T10:30:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40401` | 报告不存在 |
| `40301` | 无权查看该报告（非本人报告） |

---

### 3.5 GET /api/assessment/profile

**描述**：获取用户当前优势画像。

**认证**：是

**请求参数**：无

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 12,
    "user_id": 1,
    "profile_data": {
      "radar": {
        "逻辑推理": 85,
        "沟通表达": 72,
        "创造力": 90,
        "领导力": 68,
        "共情能力": 78
      },
      "summary": "你是一位富有创造力的思考者，擅长逻辑分析和共情沟通...",
      "growth_suggestions": [
        {"dimension": "领导力", "priority": "high", "suggestion": "参与团队项目，逐步承担组织协调角色"}
      ]
    },
    "strength_tags": ["创造力", "逻辑推理", "共情能力"],
    "version": 3,
    "is_current": true,
    "created_at": "2026-06-27T10:30:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40401` | 尚未生成优势画像，请先完成测评 |

---

## 4. 成长模块 — Growth

### 4.1 GET /api/growth/goals

**描述**：获取用户所有成长目标列表。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | `integer` | 否 | 筛选状态：`1`=进行中, `2`=已完成, `0`=已取消，不传返回全部 |
| `category` | `string` | 否 | 筛选分类：`talent` / `skill` / `character` / `value` / `custom` |
| `page` | `integer` | 否 | 页码，默认 `1` |
| `size` | `integer` | 否 | 每页条数，默认 `10`，最大 `50` |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "提升公开演讲能力",
        "category": "skill",
        "priority": 1,
        "cycle": "month",
        "status": 1,
        "progress": 35.00,
        "created_at": "2026-06-01T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 3,
      "total_pages": 1
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |

---

### 4.2 POST /api/growth/goals

**描述**：创建新的成长目标。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | 是 | 目标名称，最大 128 字符 |
| `description` | `string` | 否 | 详细描述 |
| `category` | `string` | 是 | 分类：`talent` / `skill` / `character` / `value` / `custom` |
| `priority` | `integer` | 否 | 优先级：`1`=高, `2`=中, `3`=低，默认 `2` |
| `cycle` | `string` | 否 | 周期：`day` / `week` / `month` / `quarter` / `year`，默认 `month` |
| `expected_outcome` | `string` | 否 | 期望成果 |
| `current_basis` | `string` | 否 | 当前基础 |

**请求示例**：

```json
{
  "name": "提升公开演讲能力",
  "description": "能够在50人以上场合进行清晰、有条理的演讲",
  "category": "skill",
  "priority": 1,
  "cycle": "month",
  "expected_outcome": "完成3次公开演讲，获得正面反馈",
  "current_basis": "有一定基础，但面对大场合容易紧张"
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 5,
    "name": "提升公开演讲能力",
    "description": "能够在50人以上场合进行清晰、有条理的演讲",
    "category": "skill",
    "priority": 1,
    "cycle": "month",
    "expected_outcome": "完成3次公开演讲，获得正面反馈",
    "current_basis": "有一定基础，但面对大场合容易紧张",
    "status": 1,
    "progress": 0.00,
    "created_at": "2026-06-27T12:00:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40001` | 目标名称为空 |
| `40003` | category 值非法 |
| `42901` | 创建过于频繁（单用户每日最多创建 5 个目标） |

---

### 4.3 GET /api/growth/goals/:id

**描述**：获取指定目标的详细信息。

**认证**：是

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `integer` | 是 | 目标 ID |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 5,
    "user_id": 1,
    "name": "提升公开演讲能力",
    "description": "能够在50人以上场合进行清晰、有条理的演讲",
    "category": "skill",
    "priority": 1,
    "cycle": "month",
    "expected_outcome": "完成3次公开演讲，获得正面反馈",
    "current_basis": "有一定基础，但面对大场合容易紧张",
    "status": 1,
    "progress": 35.00,
    "created_at": "2026-06-27T12:00:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40402` | 目标不存在 |
| `40301` | 无权查看该目标 |

---

### 4.4 PUT /api/growth/goals/:id

**描述**：更新指定目标的信息。

**认证**：是

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `integer` | 是 | 目标 ID |

**请求参数**（全部可选，至少传一个）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | 否 | 目标名称 |
| `description` | `string` | 否 | 详细描述 |
| `category` | `string` | 否 | 分类 |
| `priority` | `integer` | 否 | 优先级 |
| `cycle` | `string` | 否 | 周期 |
| `expected_outcome` | `string` | 否 | 期望成果 |
| `current_basis` | `string` | 否 | 当前基础 |
| `status` | `integer` | 否 | 状态：`0`=取消, `1`=进行中, `2`=完成 |
| `progress` | `number` | 否 | 进度百分比（0-100） |

**请求示例**：

```json
{
  "name": "提升公开演讲与汇报能力",
  "progress": 50.00
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 5,
    "name": "提升公开演讲与汇报能力",
    "progress": 50.00,
    "updated_at": "2026-06-27T14:00:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40402` | 目标不存在 |
| `40301` | 无权修改该目标 |
| `40902` | 目标已完成或已取消，无法修改 |

---

### 4.5 DELETE /api/growth/goals/:id

**描述**：删除指定目标及其关联的所有任务。

**认证**：是

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `integer` | 是 | 目标 ID |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": null,
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40402` | 目标不存在 |
| `40301` | 无权删除该目标 |

---

### 4.6 GET /api/growth/goals/:id/tasks

**描述**：获取指定目标下的所有任务列表。

**认证**：是

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `integer` | 是 | 目标 ID |

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | `integer` | 否 | 筛选状态：`0`=待开始, `1`=进行中, `2`=已完成 |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "goal_id": 5,
    "goal_name": "提升公开演讲能力",
    "tasks": [
      {
        "id": 10,
        "content": "每天练习15分钟即兴演讲",
        "milestone": "第一周基础训练",
        "due_date": "2026-07-04",
        "status": 1,
        "completed_at": null,
        "created_at": "2026-06-27T12:00:00Z"
      },
      {
        "id": 11,
        "content": "录制一段3分钟演讲视频并自我复盘",
        "milestone": "第二周进阶训练",
        "due_date": "2026-07-11",
        "status": 0,
        "completed_at": null,
        "created_at": "2026-06-27T12:00:00Z"
      }
    ]
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40402` | 目标不存在 |

---

### 4.7 POST /api/growth/goals/:id/tasks

**描述**：在指定目标下创建新任务。

**认证**：是

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `integer` | 是 | 目标 ID |

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | `string` | 是 | 任务内容，最大 512 字符 |
| `milestone` | `string` | 否 | 里程碑名称 |
| `due_date` | `string` | 否 | 截止日期，格式 `YYYY-MM-DD` |

**请求示例**：

```json
{
  "content": "每天练习15分钟即兴演讲",
  "milestone": "第一周基础训练",
  "due_date": "2026-07-04"
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 12,
    "goal_id": 5,
    "content": "每天练习15分钟即兴演讲",
    "milestone": "第一周基础训练",
    "due_date": "2026-07-04",
    "status": 0,
    "created_at": "2026-06-27T14:00:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40402` | 目标不存在 |
| `40001` | 任务内容为空 |
| `40902` | 目标已完成或已取消，无法添加任务 |

---

### 4.8 PUT /api/growth/tasks/:id

**描述**：更新指定任务（支持状态变更、标记完成）。

**认证**：是

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `integer` | 是 | 任务 ID |

**请求参数**（全部可选，至少传一个）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | `string` | 否 | 任务内容 |
| `milestone` | `string` | 否 | 里程碑名称 |
| `due_date` | `string` | 否 | 截止日期 |
| `status` | `integer` | 否 | 状态：`0`=待开始, `1`=进行中, `2`=已完成 |

**请求示例**：

```json
{
  "status": 2
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 12,
    "status": 2,
    "completed_at": "2026-06-27T15:00:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40403` | 任务不存在 |
| `40301` | 无权修改该任务 |

---

### 4.9 GET /api/growth/dashboard

**描述**：获取用户成长仪表盘数据（概览统计）。

**认证**：是

**请求参数**：无

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "summary": {
      "total_goals": 5,
      "active_goals": 3,
      "completed_goals": 2,
      "total_tasks": 18,
      "completed_tasks": 7,
      "overall_progress": 42.50
    },
    "recent_goals": [
      {
        "id": 5,
        "name": "提升公开演讲能力",
        "progress": 35.00,
        "priority": 1
      }
    ],
    "upcoming_tasks": [
      {
        "id": 11,
        "content": "录制一段3分钟演讲视频并自我复盘",
        "due_date": "2026-07-11",
        "goal_name": "提升公开演讲能力"
      }
    ]
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |

---

## 5. AI 对话模块 — Chat

### 5.1 POST /api/chat/send

**描述**：发送消息并获取 AI 回复（支持 SSE 流式输出）。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `session_id` | `string` | 是 | 会话 ID |
| `message` | `string` | 是 | 用户消息内容 |
| `scene` | `string` | 否 | 场景：`general` / `assessment` / `growth` / `practice` / `coach`，默认 `general` |

**请求示例**：

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "根据我的测评结果，应该如何提升沟通能力？",
  "scene": "coach"
}
```

**SSE 流式响应格式**：

```
Content-Type: text/event-stream

data: {"type":"start","session_id":"a1b2c3d4-..."}

data: {"type":"chunk","content":"根据"}

data: {"type":"chunk","content":"你的"}

data: {"type":"chunk","content":"测评"}

data: {"type":"chunk","content":"结果"}

data: {"type":"chunk","content":"，沟通"}

data: {"type":"done","message_id":789,"token_used":150}

data: [DONE]
```

**非流式响应（当客户端不支持 SSE 时）**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "message_id": 789,
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "role": "assistant",
    "content": "根据你的测评结果，沟通能力得分72分，处于中等水平...",
    "token_used": 150,
    "created_at": "2026-06-27T15:00:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40001` | 消息内容为空 |
| `50002` | AI 服务异常，请稍后重试 |
| `42901` | 请求过于频繁（单用户每分钟最多 20 次） |

---

### 5.2 GET /api/chat/sessions

**描述**：获取当前用户的会话列表。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | `integer` | 否 | 页码，默认 `1` |
| `size` | `integer` | 否 | 每页条数，默认 `20`，最大 `50` |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "scene": "coach",
        "last_message": "根据你的测评结果，沟通能力得分72分...",
        "last_role": "assistant",
        "message_count": 12,
        "created_at": "2026-06-27T12:00:00Z",
        "updated_at": "2026-06-27T15:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 5,
      "total_pages": 1
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |

---

### 5.3 GET /api/chat/sessions/:id/messages

**描述**：获取指定会话的所有消息记录。

**认证**：是

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 会话 ID（UUID 格式） |

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | `integer` | 否 | 页码，默认 `1` |
| `size` | `integer` | 否 | 每页条数，默认 `50`，最大 `100` |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "scene": "coach",
    "messages": [
      {
        "id": 788,
        "role": "user",
        "content": "根据我的测评结果，应该如何提升沟通能力？",
        "token_used": 30,
        "created_at": "2026-06-27T15:00:00Z"
      },
      {
        "id": 789,
        "role": "assistant",
        "content": "根据你的测评结果，沟通能力得分72分，处于中等水平...",
        "token_used": 150,
        "created_at": "2026-06-27T15:00:05Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 50,
      "total": 12,
      "total_pages": 1
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40405` | 会话不存在 |
| `40301` | 无权查看该会话 |

---

### 5.4 POST /api/chat/sessions

**描述**：创建新的对话会话。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `scene` | `string` | 否 | 场景：`general` / `assessment` / `growth` / `practice` / `coach`，默认 `general` |
| `title` | `string` | 否 | 会话标题，默认自动生成 |

**请求示例**：

```json
{
  "scene": "coach",
  "title": "沟通能力提升咨询"
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "session_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "scene": "coach",
    "title": "沟通能力提升咨询",
    "created_at": "2026-06-27T16:00:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40003` | scene 值非法 |

---

## 6. 实践模块 — Practice

### 6.1 GET /api/practice/projects

**描述**：获取实践项目列表（支持按分类和难度筛选）。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `category` | `string` | 否 | 分类：`talent` / `skill` / `character` / `value` |
| `difficulty` | `integer` | 否 | 难度：`1`=简单, `2`=中等, `3`=困难 |
| `page` | `integer` | 否 | 页码，默认 `1` |
| `size` | `integer` | 否 | 每页条数，默认 `10`，最大 `50` |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "即兴演讲挑战",
        "category": "skill",
        "tags": ["演讲", "沟通", "表达"],
        "match_strength": "沟通表达",
        "difficulty": 2,
        "duration": 30,
        "benefit": "提升即兴表达能力和临场应变能力",
        "created_at": "2026-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 25,
      "total_pages": 3
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |

---

### 6.2 GET /api/practice/projects/:id

**描述**：获取实践项目的详细信息。

**认证**：是

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `integer` | 是 | 项目 ID |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "即兴演讲挑战",
    "category": "skill",
    "tags": ["演讲", "沟通", "表达"],
    "match_strength": "沟通表达",
    "content": "本实践项目旨在帮助你通过即兴演讲的方式，锻炼在压力下的表达能力...",
    "difficulty": 2,
    "duration": 30,
    "steps": [
      {"order": 1, "desc": "准备3个随机话题卡片", "tip": "话题可以涵盖生活、工作、社会热点"},
      {"order": 2, "desc": "随机抽取一张卡片，准备1分钟", "tip": "不需要完美，关键是开口说"},
      {"order": 3, "desc": "进行3分钟即兴演讲并录音", "tip": "注意语速、逻辑结构和肢体语言"},
      {"order": 4, "desc": "回听录音并写下3个改进点", "tip": "关注内容逻辑和表达流畅度"}
    ],
    "benefit": "提升即兴表达能力和临场应变能力，改善沟通自信心",
    "status": 1,
    "created_at": "2026-01-01T00:00:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40404` | 项目不存在 |

---

### 6.3 POST /api/practice/checkin

**描述**：实践打卡（提交实践记录）。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `project_id` | `integer` | 是 | 实践项目 ID |
| `content` | `string` | 否 | 实践内容描述 |
| `images` | `array` | 否 | 上传图片 URL 列表 |
| `reflection` | `string` | 否 | 反思总结 |

**请求示例**：

```json
{
  "project_id": 1,
  "content": "今天完成了即兴演讲训练，选择了"AI对教育的影响"这个话题...",
  "images": [
    "https://cdn.youban-ai.com/practice/1.jpg",
    "https://cdn.youban-ai.com/practice/2.jpg"
  ],
  "reflection": "发现自己在开头部分有些紧张，但1分钟后逐渐进入状态。需要加强开场的准备。"
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 55,
    "user_id": 1,
    "project_id": 1,
    "project_name": "即兴演讲挑战",
    "content": "今天完成了即兴演讲训练，选择了"AI对教育的影响"这个话题...",
    "images": [
      "https://cdn.youban-ai.com/practice/1.jpg",
      "https://cdn.youban-ai.com/practice/2.jpg"
    ],
    "reflection": "发现自己在开头部分有些紧张...",
    "created_at": "2026-06-27T16:30:00Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40404` | 项目不存在 |
| `40001` | 项目 ID 为空 |

---

### 6.4 GET /api/practice/records

**描述**：获取当前用户的实践记录列表。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `project_id` | `integer` | 否 | 筛选项目 ID |
| `page` | `integer` | 否 | 页码，默认 `1` |
| `size` | `integer` | 否 | 每页条数，默认 `10`，最大 `50` |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 55,
        "project_id": 1,
        "project_name": "即兴演讲挑战",
        "content": "今天完成了即兴演讲训练...",
        "images": ["https://cdn.youban-ai.com/practice/1.jpg"],
        "reflection": "发现自己在开头部分有些紧张...",
        "created_at": "2026-06-27T16:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 12,
      "total_pages": 2
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |

---

## 7. 档案模块 — Archive

### 7.1 GET /api/archive

**描述**：获取用户成长档案列表（分页）。

**认证**：是

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | `string` | 否 | 类型筛选：`assessment` / `goal` / `task` / `practice` / `chat`，不传返回全部 |
| `page` | `integer` | 否 | 页码，默认 `1` |
| `size` | `integer` | 否 | 每页条数，默认 `20`，最大 `100` |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 101,
        "data_type": "assessment",
        "ref_id": 42,
        "summary": "完成了一次快速测评，核心优势：创造力、逻辑推理、共情能力",
        "created_at": "2026-06-27T10:30:00Z"
      },
      {
        "id": 100,
        "data_type": "goal",
        "ref_id": 5,
        "summary": "创建了成长目标「提升公开演讲能力」，优先级：高",
        "created_at": "2026-06-27T12:00:00Z"
      },
      {
        "id": 99,
        "data_type": "practice",
        "ref_id": 55,
        "summary": "完成了「即兴演讲挑战」实践打卡",
        "created_at": "2026-06-27T16:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 45,
      "total_pages": 3
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40003` | type 参数值非法 |

---

### 7.2 GET /api/archive/stats

**描述**：获取用户成长档案统计数据。

**认证**：是

**请求参数**：无

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total_events": 45,
    "by_type": {
      "assessment": 5,
      "goal": 8,
      "task": 18,
      "practice": 12,
      "chat": 2
    },
    "first_event_at": "2026-01-15T10:30:00Z",
    "latest_event_at": "2026-06-27T16:30:00Z",
    "active_days": 42,
    "streak": {
      "current": 7,
      "longest": 14
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |

---

## 8. 管理模块 — Admin

> **注意**：管理模块所有接口需要管理员权限（`role = admin`），普通用户调用将返回 `40301`。

### 8.1 GET /api/admin/users

**描述**：获取用户列表（管理员功能）。

**认证**：是（管理员）

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyword` | `string` | 否 | 搜索关键词（匹配手机号或昵称） |
| `status` | `integer` | 否 | 筛选状态：`0`=禁用, `1`=正常 |
| `member_level` | `integer` | 否 | 筛选会员等级：`0`-`3` |
| `page` | `integer` | 否 | 页码，默认 `1` |
| `size` | `integer` | 否 | 每页条数，默认 `20`，最大 `100` |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "phone": "138****8000",
        "nickname": "小明",
        "avatar": "https://cdn.youban-ai.com/avatars/1.jpg",
        "member_level": 1,
        "member_expire_at": "2027-06-27T00:00:00Z",
        "status": 1,
        "created_at": "2026-01-15T10:30:00Z",
        "last_login_at": "2026-06-27T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 150,
      "total_pages": 8
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40301` | 无管理员权限 |

---

### 8.2 PUT /api/admin/users/:id

**描述**：修改用户信息（管理员功能，如封禁/解封、修改会员等级）。

**认证**：是（管理员）

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `integer` | 是 | 用户 ID |

**请求参数**（全部可选，至少传一个）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | `integer` | 否 | 状态：`0`=禁用, `1`=正常 |
| `member_level` | `integer` | 否 | 会员等级：`0`-`3` |
| `member_expire_at` | `string` | 否 | 会员到期时间（ISO 8601 格式） |

**请求示例**：

```json
{
  "status": 1,
  "member_level": 2,
  "member_expire_at": "2027-12-31T23:59:59Z"
}
```

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "status": 1,
    "member_level": 2,
    "member_expire_at": "2027-12-31T23:59:59Z"
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40301` | 无管理员权限 |
| `40401` | 用户不存在 |

---

### 8.3 GET /api/admin/dashboard/stats

**描述**：获取管理后台仪表盘统计数据。

**认证**：是（管理员）

**请求参数**：无

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_stats": {
      "total_users": 1500,
      "active_users_today": 320,
      "active_users_week": 890,
      "new_users_today": 25,
      "new_users_week": 180
    },
    "member_stats": {
      "normal": 1200,
      "silver": 200,
      "gold": 80,
      "diamond": 20
    },
    "assessment_stats": {
      "total_assessments": 3200,
      "today_assessments": 45,
      "quick_count": 2800,
      "full_count": 400
    },
    "growth_stats": {
      "total_goals": 5600,
      "active_goals": 3200,
      "completed_goals": 1800,
      "total_tasks": 18000,
      "completed_tasks": 7500
    },
    "chat_stats": {
      "total_sessions": 8900,
      "total_messages": 45000,
      "total_tokens": 12500000
    },
    "practice_stats": {
      "total_checkins": 2300,
      "today_checkins": 35
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40301` | 无管理员权限 |

---

### 8.4 GET /api/admin/logs

**描述**：获取系统操作日志（管理员功能）。

**认证**：是（管理员）

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `user_id` | `integer` | 否 | 筛选指定用户的操作日志 |
| `operation_type` | `string` | 否 | 筛选操作类型：`login` / `register` / `assessment` / `goal` / `task` / `practice` / `admin` |
| `start_time` | `string` | 否 | 开始时间（ISO 8601 格式） |
| `end_time` | `string` | 否 | 结束时间（ISO 8601 格式） |
| `page` | `integer` | 否 | 页码，默认 `1` |
| `size` | `integer` | 否 | 每页条数，默认 `50`，最大 `200` |

**成功响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 5001,
        "user_id": 1,
        "operation_type": "login",
        "content": "用户登录成功",
        "ip_address": "192.168.*.*",
        "created_at": "2026-06-27T08:00:00Z"
      },
      {
        "id": 5000,
        "user_id": 2,
        "operation_type": "assessment",
        "content": "用户完成了快速测评（ID: 42）",
        "ip_address": "10.0.*.*",
        "created_at": "2026-06-27T07:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 50,
      "total": 12000,
      "total_pages": 240
    }
  },
  "timestamp": 1719446400
}
```

**错误码**：

| 错误码 | 说明 |
|--------|------|
| `40101` | 未登录或 Token 已过期 |
| `40301` | 无管理员权限 |

---

> **文档维护**：本文档由后端团队维护，API 变更时需同步更新本文档。  
> **接口版本**：所有接口前缀为 `/v1`，后续版本升级时通过路径区分（如 `/v2/api/...`）。  
> **联系方式**：API 问题请通过项目 Issue 或内部协作平台反馈。