# 学生端推荐题目模块API

## 1. 请求推荐题目

### 接口说明
学生请求获取推荐题目

### 请求格式
- **URL**: `/api/student/recommend-questions`
- **Method**: `POST`

### 请求参数
```json
{
  "studentId": "string, 必填, 学生ID",
  "knowledgePoints": "array, 可选, 指定的知识点ID列表，为空时系统自动推荐",
}
```

### 请求示例
```json
{
  "studentId": "1120220001",
  "knowledgePoints": ["basic", "euler"]
}
```

### 成功响应
```json
{
  "code": 200,
  "message": "推荐题目获取成功",
  "data": {
    "questions": [
      {
        "questionId": "q001",
        "description": "你是？",
        "knowledgePoint": "basic",
        "knowledgePointName": "图的基本概念",
        "options": [
          {
            "id": "A",
            "text": "是A"
          },
          {
            "id": "B", 
            "text": "是B"
          },
          {
            "id": "C",
            "text": "是C"
          },
          {
            "id": "D",
            "text": "是D"
          }
        ]
      }
    ]
  }
}
```

### 2. 提交答案
### 接口说明
学生提交题目答案

### 请求格式
- **URL**: `/api/student/submit-answer`
- **Method**: `POST`

### 请求参数
```json
{
  "questionId": "string, 必填, 题目ID",
  "studentId": "string, 必填, 学生ID",
  "selectedOption": "string, 必填, 学生选择的选项ID"
}
```

### 请求示例
```json
{
  "questionId": "q001",
  "studentId": "1120220001",
  "selectedOption": "B"
}
```

### 成功响应
```json
{
  "code": 200,
  "message": "答案提交成功",
  "data": {
    "isCorrect": true,
    "correctAnswer": "B",
    "explanation": "这是答案解释（可选）"
  }
}
```

---

## 3. 请求薄弱知识点列表

### 接口说明
获取学生的薄弱知识点列表

### 请求格式
- **URL**: `/api/student/weak-knowledge-points`
- **Method**: `GET`

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | string | 是 | 学生ID |

### 请求示例
```
GET /api/student/weak-knowledge-points?studentId=1120220001
```

### 成功响应
```json
{
  "code": 200,
  "message": "薄弱知识点获取成功",
  "data": {
    "weakKnowledgePoints": [
      {
        "id": "hamilton",
        "name": "哈密顿图",
        "currentScore": 65
      },
      {
        "id": "coloring",
        "name": "着色",
        "currentScore": 68
      }
    ]
  }
}
```
