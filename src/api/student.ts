import type { Question, WeakKnowledgePoint } from '../types'

// 后端API基础配置
const API_BASE_URL = 'http://localhost:8080'

// 学生相关API
export const studentApi = {
  // 获取推荐题目
  getRecommendedQuestions: async (studentId: string, knowledgePoints?: string[]): Promise<Question[]> => {
    /* 
    // 真实API调用代码
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/recommend-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          knowledgePoints: knowledgePoints || []
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.code !== 200) {
        throw new Error(result.message || '请求失败')
      }
      
      // 转换API响应格式到前端Question类型
      return result.data.questions.map((q: any) => ({
        id: parseInt(q.questionId),
        title: q.description,
        type: '选择题',
        options: q.options.map((opt: any) => ({
          key: opt.id,
          text: opt.text
        })),
        correctAnswer: '', // 前端不应该知道正确答案
        explanation: '', // 前端不应该预先获得解析
        knowledgePoint: q.knowledgePoint
      }))
    } catch (error) {
      console.error('获取推荐题目失败:', error)
      throw error
    }
    */
    
    // 当前使用的模拟数据
    console.log('获取推荐题目:', { studentId, knowledgePoints })
    return new Promise((resolve) => {
      setTimeout(() => resolve([]), 1000)
    })
  },

  // 提交答案
  submitAnswer: async (data: {
    questionId: string
    studentId: string
    selectedOption: string
  }): Promise<{ isCorrect: boolean; correctAnswer: string }> => {
    /*
    // 真实API调用代码
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.code !== 200) {
        throw new Error(result.message || '提交答案失败')
      }
      
      return {
        isCorrect: result.data.isCorrect,
        correctAnswer: result.data.correctAnswer
      }
    } catch (error) {
      console.error('提交答案失败:', error)
      throw error
    }
    */
    
    // 当前使用的模拟数据
    console.log('提交答案:', data)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isCorrect: data.selectedOption === 'B', // 模拟判断
          correctAnswer: 'B'
        })
      }, 800)
    })
  },

  // 获取题目解析
  getExplanation: async (data: {
    questionId: string
    studentId: string
    selectedOption: string
  }): Promise<{ explanation: string }> => {
    /*
    // 真实API调用代码
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/get-explanation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.code !== 200) {
        throw new Error(result.message || '获取解析失败')
      }
      
      return {
        explanation: result.data.explanation
      }
    } catch (error) {
      console.error('获取解析失败:', error)
      throw error
    }
    */
    
    // 当前使用的模拟数据
    console.log('获取解析:', data)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          explanation: 'HELLOWORLDHELLOWORLD'
        })
      }, 1000)
    })
  },

  // 获取薄弱知识点
  getWeakKnowledgePoints: async (studentId: string): Promise<WeakKnowledgePoint[]> => {
    /*
    // 真实API调用代码
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/weak-knowledge-points?studentId=${encodeURIComponent(studentId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.code !== 200) {
        throw new Error(result.message || '获取薄弱知识点失败')
      }
      
      // 转换API响应格式到前端WeakKnowledgePoint类型
      return result.data.weakKnowledgePoints.map((point: any) => ({
        id: point.id,
        name: point.name,
        description: `${point.name}掌握程度较低`, // 可根据实际需要调整
        score: point.currentScore
      }))
    } catch (error) {
      console.error('获取薄弱知识点失败:', error)
      throw error
    }
    */
    
    // 当前使用的模拟数据
    console.log('获取薄弱知识点:', studentId)
    return new Promise((resolve) => {
      setTimeout(() => resolve([]), 1000)
    })
  }
}
