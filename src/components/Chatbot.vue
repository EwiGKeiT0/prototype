<template>
  <div class="chatbot-container">
    <div class="messages-area" ref="messagesArea">
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role === 'user' ? 'user' : 'bot'">
        <div class="avatar" :class="msg.role === 'user' ? 'user' : 'bot'">{{ msg.role === 'user' ? 'U' : 'AI' }}</div>
        <div class="text-bubble">
          <template v-for="(part, partIndex) in parseMessage(msg.content)" :key="partIndex">
            <span v-if="part.type === 'text'">{{ part.value }}</span>
            <a v-else-if="part.type === 'link'" href="#" @click.prevent="handleLinkClick(part.targetView, part.targetParam)">
              {{ part.text }}
            </a>
          </template>
        </div>
      </div>
      <div v-if="isTyping" class="message bot">
        <div class="avatar bot">AI</div>
        <div class="text-bubble typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
    <div class="input-area">
      <el-input
        v-model="userInput"
        placeholder="输入您的问题..."
        @keyup.enter="sendMessage"
        clearable
        size="large"
      >
        <template #append>
          <el-button @click="sendMessage" :icon="Promotion" />
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { Promotion } from '@element-plus/icons-vue';

const emit = defineEmits(['navigate']);

const userInput = ref('');
const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([]);
const isTyping = ref(false);
const messagesArea = ref<HTMLElement | null>(null);

const parseMessage = (content: string) => {
  const parts = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
    }
    // Add the link
    const [_, text, target] = match;
    const [targetView, targetParam] = target.split(':');
    parts.push({ type: 'link', text, targetView, targetParam });
    lastIndex = regex.lastIndex;
  }

  // Add any remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.substring(lastIndex) });
  }

  return parts;
};

const handleLinkClick = (targetView: string, targetParam: string) => {
  emit('navigate', { view: targetView, param: targetParam });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
    }
  });
};

const sendMessage = () => {
  const text = userInput.value.trim();
  if (!text) return;

  messages.value.push({ role: 'user', content: text });
  userInput.value = '';
  scrollToBottom();

  isTyping.value = true;

  // 模拟后端LLM响应
  setTimeout(() => {
    isTyping.value = false;
    const botResponse = `这是对“${text}”的模拟回答。您可以 [点击这里查看教材第5页](textbook:5) 以获取更多信息。`;
    messages.value.push({ role: 'assistant', content: botResponse });
    scrollToBottom();
  }, 1500);
};
</script>

<style scoped>
.chatbot-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.messages-area {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.bot {
  align-self: flex-start;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.avatar.user {
  background-color: #409eff;
}

.avatar.bot {
  background-color: #67c23a;
}

.text-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.6;
  font-size: 14px;
}

.message.user .text-bubble {
  background-color: #409eff;
  color: white;
  border-top-right-radius: 4px;
}

.message.bot .text-bubble {
  background-color: #eef;
  color: #333;
  border-top-left-radius: 4px;
}

.message.bot .text-bubble a {
  color: #409eff;
  text-decoration: underline;
  font-weight: bold;
}

.message.bot .text-bubble a:hover {
  color: #79bbff;
}

.input-area {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #909399;
  border-radius: 50%;
  display: inline-block;
  animation: wave 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes wave {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
}
</style>
