<template>
  <div class="chatbot-wrapper">
    <div class="chatbot-container" :class="{ 'preview-is-open': isPreviewOpen }">
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
    <div v-if="previewData" class="preview-sidebar" :class="{ 'is-open': isPreviewOpen }">
      <div class="preview-toggle" @click="togglePreview">
        <el-icon>
          <ArrowLeft v-if="!isPreviewOpen" />
          <ArrowRight v-else />
        </el-icon>
      </div>
      <PdfPreview
        :source="previewData.source"
        :page="previewData.page"
        @view-details="handleViewDetails"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Promotion, ArrowRight, ArrowLeft } from '@element-plus/icons-vue';
import PdfPreview from './PdfPreview.vue';

const emit = defineEmits(['navigate']);

const userInput = ref('');
const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([]);
const isTyping = ref(false);
const messagesArea = ref<HTMLElement | null>(null);
const previewData = ref<{ source: string; page: number } | null>(null);
const isPreviewOpen = ref(false);

const parseMessage = (content: string) => {
  const parts = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.substring(lastIndex, match.index) });
    }
    const [_, text, target] = match;
    const [targetView, targetParam] = target.split(':');
    parts.push({ type: 'link', text, targetView, targetParam });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.substring(lastIndex) });
  }

  return parts;
};

const handleLinkClick = (targetView: string, targetParam?: string) => {
  if (targetView === 'textbook' && targetParam) {
    previewData.value = { source: '/textbook.pdf', page: parseInt(targetParam, 10) };
    isPreviewOpen.value = true; // 自动展开预览
  } else {
    emit('navigate', { view: targetView, param: targetParam });
  }
};

const handleViewDetails = () => {
  if (previewData.value) {
    emit('navigate', { view: 'textbook', param: String(previewData.value.page) });
  }
};

const togglePreview = () => {
  isPreviewOpen.value = !isPreviewOpen.value;
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
  
  // 如果预览是打开的，则关闭它
  if (isPreviewOpen.value) {
    isPreviewOpen.value = false;
  }
  previewData.value = null; // 清除旧的预览

  isTyping.value = true;

  // 模拟后端LLM响应
  setTimeout(() => {
    isTyping.value = false;
    const botResponse = `这是对“${text}”的模拟回答。您可以 [123](textbook:5) 以获取更多信息。`;
    messages.value.push({ role: 'assistant', content: botResponse });
    scrollToBottom();
  }, 1500);
};
</script>

<style scoped>
.chatbot-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background-color: #f9fafb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
}

.chatbot-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.chatbot-container.preview-is-open {
  padding-right: 320px;
}

.preview-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 320px;
  transform: translateX(100%);
  border-left: 1px solid #e4e7ed;
  transition: transform 0.3s ease;
  background-color: #fff;
  z-index: 20;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
}

.preview-sidebar.is-open {
  transform: translateX(0);
}

.preview-toggle {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%) translateX(-100%);
  width: 24px;
  height: 48px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-right: none;
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: -2px 0 8px rgba(0,0,0,0.05);
  z-index: 10;
}

.preview-toggle:hover {
  background-color: #f5f7fa;
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
  cursor: pointer;
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
