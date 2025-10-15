// import request from './index' // 真实API请求时取消注释
import type { ChatRequest, ChatResponse } from '../types'

const CHAPTER_PAGE_MAP: Record<number, number> = {
  1: 11, 2: 34, 3: 51, 4: 80, 5: 111, 6: 134, 7: 155, 
  8: 173, 9: 195, 10: 209, 11: 227, 12: 244, 13: 254, 
  14: 274, 15: 294, 16: 312
};

// 模拟后端响应
const MOCK_CHAT_API = {
  getChatResponse: (data: ChatRequest): Promise<ChatResponse> => {
    console.log('Sending chat message to backend:', data)
    return new Promise((resolve) => {
      setTimeout(() => {
        const docs = [];
        if (data.useRag) {
          // 生成第一个文档
          const chapter1 = Math.floor(Math.random() * 16) + 1;
          const pageInChapter1 = Math.floor(Math.random() * 10) + 1;
          const source1 = `ch${chapter1}.pdf`;
          docs.push({ source: source1, page: pageInChapter1, content: '这是第一个文档的摘要...' });

          // 生成第二个文档
          const chapter2 = Math.floor(Math.random() * 16) + 1;
          const pageInChapter2 = Math.floor(Math.random() * 10) + 1;
          const source2 = `ch${chapter2}.pdf`;
          docs.push({ source: source2, page: pageInChapter2, content: '这是第二个文档的摘要...' });
        }

        const response: ChatResponse = {
          thought: `用户输入是 "${data.userInput}"。RAG模式为 ${data.useRag ? '开启' : '关闭'}。我需要思考如何回答这个问题。`,
          answer: `这是对“${data.userInput}”的模拟回答。`,
          documents: docs
        }

        console.log('Mock backend response:', response)
        resolve(response)
      }, 1500)
    })
  }
}

export const chatbotApi = {
  getChatResponse: async (data: ChatRequest): Promise<ChatResponse> => {
    // 暂时使用模拟API，如果后端准备好了，可以切换到真实请求
    const response = await MOCK_CHAT_API.getChatResponse(data)

    if (data.useRag && response.documents.length > 0) {
      const references = response.documents
        .map((doc) => {
          const match = doc.source.match(/ch(\d+)\.pdf/)
          if (match) {
            const chapter = parseInt(match[1], 10)
            const basePage = CHAPTER_PAGE_MAP[chapter] || 0
            const finalPage = basePage ? basePage + doc.page - 1 : doc.page
            return `[教材第${chapter}章第${doc.page}页](textbook:${finalPage})`
          }
          return null
        })
        .filter((ref) => ref !== null)

      if (references.length > 0) {
        response.answer += ` 您可以参考 ${references.join('、')} 获取更多信息。`
      }
    }

    return response
    /*
    // 真实API请求
    return request({
      url: '/chat',
      method: 'post',
      data
    })
    */
  }
}
