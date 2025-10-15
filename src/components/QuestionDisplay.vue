<template>
  <div class="question-card" @click="toggleAnswerInput">
    <div class="question-header">
      <span class="question-type-tag" :style="chapterStyle">第 {{ question.chapter }} 章</span>
      <span class="question-knowledge-point">题号: {{ question.question_number }}</span>
    </div>
    <div class="question-body">
      <p class="question-title">{{ question.content }}</p>
      <div v-if="question.has_images" class="image-container">
        <img
          v-for="image in question.matched_images"
          :key="image.path"
          :src="`/${image.path.replace('extracted_images/', '')}`"
          alt="Question image"
          class="question-image"
        />
      </div>
    </div>
    <transition name="fade">
      <div v-if="isAnswerVisible" class="answer-section" @click.stop>
        <el-input
          v-model="answerText"
          type="textarea"
          :rows="4"
          placeholder="请输入你的答案..."
          class="answer-input"
        ></el-input>
        <div class="action-bar">
          <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            :auto-upload="false"
            multiple
          >
            <el-button type="primary" plain>添加附件</el-button>
          </el-upload>
          <el-button type="primary" @click="submitAnswer" :loading="isSubmitting">提交答案</el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DbQuestion } from '@/types'
import { ElMessage } from 'element-plus'
import type { UploadUserFile } from 'element-plus'

const props = defineProps<{
  question: DbQuestion
}>()

const chapterStyle = computed(() => {
  const chapter = props.question.chapter
  // 预定义一些颜色组合
  const colors = [
    { bg: '#f0f9eb', text: '#67c23a' }, // 1. Green
    { bg: '#ecf5ff', text: '#409eff' }, // 2. Blue
    { bg: '#fdf6ec', text: '#e6a23c' }, // 3. Orange
    { bg: '#fef0f0', text: '#f56c6c' }, // 4. Red
    { bg: '#f3e8fd', text: '#9b59b6' }, // 5. Purple
    { bg: '#e1f3f8', text: '#00a1d6' }, // 6. Cyan
    { bg: '#fffbe6', text: '#d4b106' }, // 7. Yellow
    { bg: '#e0f2f1', text: '#009688' }, // 8. Teal
    { bg: '#fff0e6', text: '#fa541c' }, // 9. Bright Orange
    { bg: '#fce4ec', text: '#e91e63' }, // 10. Pink
    { bg: '#e6f7ff', text: '#1890ff' }, // 11. Bright Blue
    { bg: '#e8eaf6', text: '#3f51b5' }, // 12. Indigo
    { bg: '#efebe9', text: '#795548' }  // 13. Brown
  ]
  // 使用章节号来选择颜色，如果章节号超过颜色数组长度，则循环使用
  const color = colors[(chapter - 1) % colors.length]
  return {
    backgroundColor: color.bg,
    color: color.text
  }
})

const isAnswerVisible = ref(false)
const answerText = ref('')
const fileList = ref<UploadUserFile[]>([])
const isSubmitting = ref(false)

const toggleAnswerInput = () => {
  isAnswerVisible.value = !isAnswerVisible.value
}

const submitAnswer = async () => {
  if (!answerText.value && fileList.value.length === 0) {
    ElMessage.warning('请输入答案或上传附件')
    return
  }

  isSubmitting.value = true

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1500))

  console.log('提交的答案:', {
    questionId: props.question.id,
    text: answerText.value,
    files: fileList.value.map(file => file.name)
  })

  isSubmitting.value = false
  ElMessage.success('答案提交成功！')
  
  // 重置
  isAnswerVisible.value = false
  answerText.value = ''
  fileList.value = []
}
</script>

<style scoped>
.question-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  cursor: pointer;
}

.question-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-type-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.question-knowledge-point {
  color: #909399;
  font-size: 13px;
}

.question-title {
  font-size: 15px;
  color: #303133;
  line-height: 1.7;
  margin: 0 0 16px 0;
}

.image-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.question-image {
  max-width: 100%;
  max-height: 250px;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid transparent;
}

.answer-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.answer-input {
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.upload-demo {
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
