<template>
  <el-card class="question-card" shadow="hover">
    <template #header>
      <div class="question-header">
        <span class="question-type">{{ question.type }}</span>
      </div>
    </template>
    
    <div class="question-content">
      <h4 class="question-title">{{ question.title }}</h4>
      <div class="question-description" v-if="question.description">
        {{ question.description }}
      </div>
      
      <div class="options-container">
        <el-radio-group v-model="selectedAnswer" @change="handleAnswerChange" :disabled="showFeedback">
          <div 
            v-for="(option, index) in question.options" 
            :key="index"
            class="option-item"
          >
            <el-radio :value="option.key" class="option-radio">
              <span class="option-content">
                <strong>{{ option.key }}.</strong> {{ option.text }}
              </span>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      
      <div class="question-actions">
        <el-button 
          type="primary" 
          @click="submitAnswer"
          :disabled="!selectedAnswer || showFeedback"
          :loading="submitting"
        >
          {{ showFeedback ? '已提交' : '提交答案' }}
        </el-button>
      </div>
      
      <!-- 答题反馈 -->
      <div v-if="showFeedback" class="feedback-container">
        <el-alert
          :type="isCorrect ? 'success' : 'error'"
          :title="isCorrect ? '回答正确！' : '回答错误'"
          show-icon
          :closable="false"
        >
          <div class="feedback-content">
            <p><strong>正确答案：</strong>{{ question.correctAnswer }}</p>
            <div class="explanation-section">
              <el-button 
                v-if="!showExplanation" 
                type="primary" 
                size="small"
                @click="getExplanation"
                :loading="explanationLoading"
              >
                获取解析
              </el-button>
              <div v-if="showExplanation" class="explanation-content">
                <p><strong>解析：</strong>{{ explanationText }}</p>
              </div>
            </div>
          </div>
        </el-alert>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { apiHelper } from '../utils/api-helper';

interface QuestionOption {
  key: string;
  text: string;
}

interface Question {
  id: number;
  title: string;
  description?: string;
  type: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  knowledgePoint: string;
}

interface Props {
  question: Question;
}

const props = defineProps<Props>();
const emit = defineEmits(['answer-submitted']);

const selectedAnswer = ref('');
const submitting = ref(false);
const showFeedback = ref(false);
const isCorrect = ref(false);
const showExplanation = ref(false);
const explanationLoading = ref(false);
const explanationText = ref('');

const handleAnswerChange = (value: string) => {
  if (showFeedback.value) return;
  selectedAnswer.value = value;
};

const submitAnswer = async () => {
  if (!selectedAnswer.value) {
    ElMessage.warning('请选择一个答案');
    return;
  }
  
  submitting.value = true;
  
  try {
    // 调用API提交答案
    const response = await apiHelper.submitAnswer(props.question, selectedAnswer.value);
    
    isCorrect.value = response.isCorrect;
    showFeedback.value = true;
    submitting.value = false;
    
    // 发送事件给父组件
    emit('answer-submitted', {
      questionId: props.question.id,
      selectedAnswer: selectedAnswer.value,
      isCorrect: isCorrect.value,
      knowledgePoint: props.question.knowledgePoint
    });
    
    if (isCorrect.value) {
      ElMessage.success('回答正确！');
    } else {
      ElMessage.error('回答错误，点击获取解析查看详情');
    }
  } catch (error) {
    submitting.value = false;
    ElMessage.error('提交失败，请重试');
  }
};

const getExplanation = async () => {
  explanationLoading.value = true;
  
  try {
    // 调用API获取解析
    const explanation = await apiHelper.getExplanation(props.question, selectedAnswer.value);
    explanationText.value = explanation;
    showExplanation.value = true;
    explanationLoading.value = false;
    ElMessage.success('解析获取成功！');
  } catch (error) {
    explanationLoading.value = false;
    ElMessage.error('获取解析失败，请重试');
    // 降级到使用本地解析
    explanationText.value = props.question.explanation;
    showExplanation.value = true;
  }
};
</script>

<style scoped>
.question-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-type {
  font-weight: 600;
  color: #409EFF;
}

.question-content {
  padding: 0;
}

.question-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #2c3e50;
  line-height: 1.5;
}

.question-description {
  margin-bottom: 20px;
  color: #6c757d;
  line-height: 1.6;
}

.options-container {
  margin-bottom: 20px;
}

.option-item {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.option-item:hover {
  background: #f8f9fa;
  border-color: #409EFF;
}

.option-radio {
  width: 100%;
}

.option-radio :deep(.el-radio__label) {
  width: 100%;
  padding-left: 8px;
}

.option-content {
  display: block;
  line-height: 1.5;
}

.question-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.feedback-container {
  margin-top: 20px;
  text-align: left;
}

.feedback-container :deep(.el-alert) {
  text-align: left;
}

.feedback-container :deep(.el-alert__content) {
  text-align: left;
}

.feedback-content {
  margin-top: 12px;
  text-align: left;
}

.feedback-content p {
  margin: 8px 0;
  line-height: 1.5;
  text-align: left;
}

.explanation-section {
  margin-top: 12px;
}

.explanation-content {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.explanation-content p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.6;
}
</style>
