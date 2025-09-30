<template>
  <div class="student-layout">
    <el-header class="student-header">
      <div class="header-content">
        <h2>CSrecomMIND</h2>
        <div class="header-actions">
          <el-button type="primary" @click="logout">退出登录</el-button>
        </div>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 左侧导航栏 -->
      <el-aside width="300px" class="knowledge-aside">
        <!-- 智能问答 -->
        <el-card class="chatbot-card clickable-card" :class="{ active: currentView === 'chatbot' }" shadow="never" @click="currentView = 'chatbot'">
          <template #header>
            <div class="nav-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>智能问答</span>
            </div>
          </template>
          <div class="chatbot-desc">
            <p>有任何问题，随时向我提问</p>
          </div>
        </el-card>

        <!-- 查看教材 -->
        <el-card class="textbook-card clickable-card" :class="{ active: currentView === 'textbook' }" shadow="never" @click="showTextbook">
          <template #header>
            <div class="nav-header">
              <el-icon><Collection /></el-icon>
              <span>查看教材</span>
            </div>
          </template>
          <div class="textbook-desc">
            <p>随时查阅课程相关教材</p>
          </div>
        </el-card>

        <!-- 题目推荐 -->
        <el-card class="smart-recommend-card clickable-card" :class="{ active: currentView === 'smart' }" shadow="never" @click="currentView = 'smart'">
          <template #header>
            <div class="nav-header">
              <el-icon><MagicStick /></el-icon>
              <span>题目推荐</span>
            </div>
          </template>
          
          <div class="recommend-content">
            <p class="recommend-desc">基于您的学习情况，为您推荐练习题目</p>
            <el-button 
              type="primary" 
              @click.stop="refreshSmartRecommendations"
              :loading="recommendLoading"
              class="recommend-btn"
            >
              重新获取推荐题目
            </el-button>
          </div>
        </el-card>

        <!-- 薄弱知识点导航 -->
        <el-card class="weak-points-card clickable-card" :class="{ active: currentView === 'weak' }" shadow="never">
          <template #header>
            <div class="nav-header">
              <el-icon><Warning /></el-icon>
              <span>薄弱知识点导航</span>
            </div>
          </template>
          
          <div class="weak-points-list">
            <div 
              v-for="point in weakKnowledgePoints" 
              :key="point.id"
              class="weak-point-item"
              @click="selectWeakPoint(point)"
            >
              <div class="weak-point-info">
                <h4>{{ point.name }}</h4>
                <p>{{ point.description }}</p>
              </div>
              <div class="weak-point-score">
                <el-progress 
                  :percentage="point.score" 
                  :stroke-width="6"
                  :show-text="false"
                  color="#F56C6C"
                />
                <span class="score-text">{{ point.score }}%</span>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-if="weakKnowledgePoints.length === 0" class="empty-weak-points">
              <el-icon><CircleCheck /></el-icon>
              <p>暂无薄弱知识点</p>
            </div>
          </div>
        </el-card>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="questions-main">
        <!-- 题目推荐内容 -->
        <div v-show="currentView === 'smart'" class="smart-content">
          <div class="questions-header">
            <h3>题目推荐</h3>
          </div>
          <div class="questions-container">
            <QuestionCard 
              v-for="question in smartRecommendedQuestions" 
              :key="question.id"
              :question="question"
              @answer-submitted="handleAnswerSubmitted"
            />
            <el-empty 
              v-if="smartRecommendedQuestions.length === 0"
              description="暂无题目推荐"
              :image-size="120"
            />
          </div>
        </div>

        <!-- 薄弱知识点内容 -->
        <div v-show="currentView === 'weak'" class="weak-content">
          <div class="questions-header">
            <h3>{{ selectedWeakPoint ? selectedWeakPoint.name + ' 强化' : '薄弱知识点强化' }}</h3>
          </div>
          <div class="questions-container">
            <QuestionCard 
              v-for="question in weakPointQuestions" 
              :key="question.id"
              :question="question"
              @answer-submitted="handleAnswerSubmitted"
            />
            <el-empty 
              v-if="weakPointQuestions.length === 0"
              description="暂无薄弱知识点题目"
              :image-size="120"
            />
          </div>
        </div>

        <!-- 智能问答内容 -->
        <div v-show="currentView === 'chatbot'" class="chatbot-content">
          <div class="questions-header">
            <h3>智能问答</h3>
          </div>
          <Chatbot @navigate="handleNavigate" />
        </div>

        <!-- 教材内容 -->
        <div v-if="currentView === 'textbook'" class="textbook-content">
          <div class="questions-header">
            <h3>查看教材</h3>
            <div class="filter-controls">
              <el-button @click="currentView = 'chatbot'" :icon="ArrowLeft">返回智能问答</el-button>
            </div>
          </div>
          <div class="pdf-container">
            <iframe :src="textbookUrl" width="100%" height="100%" style="border: none;"></iframe>
          </div>
        </div>

        <!-- 默认题目推荐 -->
        <div v-show="currentView === 'default'" class="default-content">
          <div class="questions-header">
            <h3>个性化题目推荐</h3>
            <div class="filter-controls">
              <el-button @click="refreshQuestions" :icon="Refresh">刷新题目</el-button>
            </div>
          </div>
          <div class="questions-container">
            <QuestionCard 
              v-for="question in filteredQuestions" 
              :key="question.id"
              :question="question"
              @answer-submitted="handleAnswerSubmitted"
            />
            <el-empty 
              v-if="filteredQuestions.length === 0"
              description="暂无推荐题目"
              :image-size="120"
            />
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Refresh, MagicStick, Warning, CircleCheck, ChatDotRound, Collection, ArrowLeft } from '@element-plus/icons-vue';
import QuestionCard from '../components/QuestionCard.vue';
import Chatbot from '../components/Chatbot.vue';

const router = useRouter();

// 响应式数据
const recommendLoading = ref(false);
const weakPointLoading = ref(false);
const currentView = ref('chatbot'); // 'default', 'smart', 'weak', 'chatbot', 'textbook'
const selectedWeakPoint = ref<any>(null); // 当前选中的薄弱知识点

// 薄弱知识点数据
const weakKnowledgePoints = ref([
  {
    id: 'process_weak',
    name: '进程管理',
    description: '对进程状态转换和调度的理解不足',
    score: 42
  },
  {
    id: 'memory_weak',
    name: '内存管理',
    description: '分页和分段机制需要加强',
    score: 55
  },
  {
    id: 'deadlock_weak',
    name: '死锁',
    description: '死锁的预防和检测算法掌握不牢',
    score: 35
  },
  {
    id: 'io_weak',
    name: 'I/O管理',
    description: '对I/O中断和DMA的理解需要提升',
    score: 48
  },
  {
    id: 'file_system_weak',
    name: '文件系统',
    description: '文件的物理和逻辑结构',
    score: 51
  }
]);

// 题目数据
const questions = ref([
  {
    id: 1,
    title: '在操作系统中，什么是进程？',
    type: '选择题',
    options: [
      { key: 'A', text: '一个在内存中执行的程序' },
      { key: 'B', text: '一个存储在磁盘上的文件' },
      { key: 'C', text: '一个指向内存的指针' },
      { key: 'D', text: '一个CPU寄存器' }
    ],
    correctAnswer: 'A',
    explanation: '进程是程序的一次执行过程，是系统进行资源分配和调度的基本单位。',
    knowledgePoint: '进程管理'
  },
  {
    id: 2,
    title: '下列哪项不是解决死锁的方法？',
    type: '选择题',
    options: [
      { key: 'A', text: '死锁预防' },
      { key: 'B', text: '死锁避免' },
      { key: 'C', text: '死锁检测与解除' },
      { key: 'D', text: '死锁忽略' }
    ],
    correctAnswer: 'D',
    explanation: '死锁忽略（鸵鸟算法）是一种不处理死锁的策略，而不是一种解决方法。',
    knowledgePoint: '死锁'
  },
  {
    id: 3,
    title: '虚拟内存的主要目的是什么？',
    type: '选择题',
    options: [
      { key: 'A', text: '提高CPU速度' },
      { key: 'B', text: '扩大主存的逻辑容量' },
      { key: 'C', text: '提高磁盘读写速度' },
      { key: 'D', text: '增加进程数量' }
    ],
    correctAnswer: 'B',
    explanation: '虚拟内存技术允许程序使用比物理内存更大的地址空间，从而在逻辑上扩充了主存容量。',
    knowledgePoint: '内存管理'
  }
]);

// 计算属性
const filteredQuestions = computed(() => {
  return questions.value;
});

// 题目推荐
const smartRecommendedQuestions = computed(() => {
  // 模拟题目推荐逻辑，返回最适合的题目
  return questions.value.slice(0, 3);
});

// 薄弱知识点题目  
const weakPointQuestions = computed(() => {
  if (!selectedWeakPoint.value) {
    return [];
  }
  // 模拟针对薄弱知识点的题目
  return questions.value.filter(q => q.knowledgePoint === selectedWeakPoint.value.name);
});

const textbookUrl = ref('/textbook.pdf');

const showTextbook = () => {
  textbookUrl.value = '/textbook.pdf';
  currentView.value = 'textbook';
};

const handleNavigate = (payload: { view: string; param?: string }) => {
  if (payload.view === 'textbook' && payload.param) {
    textbookUrl.value = `/textbook.pdf#page=${payload.param}`;
    currentView.value = 'textbook';
  } else {
    currentView.value = payload.view;
  }
};

const handleAnswerSubmitted = (result: any) => {
  console.log('答题结果:', result);
  // TODO: 更新知识点掌握度
};

const refreshQuestions = () => {
  ElMessage.success('题目已刷新');
  // TODO: 从后端获取新的推荐题目
};

const refreshSmartRecommendations = async () => {
  recommendLoading.value = true;
  ElMessage.info('正在重新获取题目推荐...');
  
  // 模拟API调用
  setTimeout(() => {
    // 这里可以模拟更新smartRecommendedQuestions
    ElMessage.success('已为您重新推荐合适的题目！');
    recommendLoading.value = false;
    // 自动跳转到题目推荐页面
    currentView.value = 'smart';
  }, 2000);
};

const selectWeakPoint = async (point: any) => {
  weakPointLoading.value = true;
  selectedWeakPoint.value = point;
  ElMessage.info(`正在获取"${point.name}"的专项练习题目...`);
  
  // 模拟API调用获取特定知识点的题目
  setTimeout(() => {
    // TODO: 实际调用后端API
    // const response = await api.get(`/student/weak-point-questions/${point.id}`)
    // 更新题目数据
    
    ElMessage.success(`已获取"${point.name}"的练习题目！`);
    weakPointLoading.value = false;
    // 跳转到薄弱知识点强化页面
    currentView.value = 'weak';
  }, 1500);
};

const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('username');
  router.push('/login');
};

onMounted(() => {
  // 初始化时可以根据学习情况自动选择知识点
});
</script>

<style scoped>
.student-layout {
  width: 100vw;
  height: 100vh;
  background: #f5f7fa;
}

.student-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.header-content {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-content h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-container {
  height: calc(100vh - 60px);
}

.knowledge-aside {
  background: transparent;
  padding: 20px 10px 20px 10px;
}

.smart-recommend-card, .weak-points-card, .chatbot-card, .textbook-card {
  margin-bottom: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.smart-recommend-card.active, .weak-points-card.active, .chatbot-card.active, .textbook-card.active {
  border-color: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.recommend-content {
  text-align: center;
  padding: 16px;
  margin: -16px;
  border-radius: 8px;
}

.recommend-desc {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.recommend-btn {
  width: 100%;
}

.recommend-btn:focus {
  outline: none !important;
  box-shadow: none !important;
}

.weak-points-list {
  max-height: 300px;
  overflow-y: auto;
}

.weak-point-item {
  padding: 16px;
  margin-bottom: 12px;
  background: #fef2f2;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #fecaca;
}

.weak-point-item:hover {
  background: #fee2e2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.weak-point-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
}

.weak-point-info p {
  margin: 0;
  font-size: 12px;
  color: #7f1d1d;
  line-height: 1.4;
}

.weak-point-score {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-text {
  font-size: 12px;
  color: #dc2626;
  font-weight: 600;
  min-width: 35px;
}

.empty-weak-points {
  text-align: center;
  padding: 32px 16px;
  color: #6c757d;
}

.empty-weak-points .el-icon {
  font-size: 48px;
  color: #67C23A;
  margin-bottom: 16px;
}

.empty-weak-points p {
  margin: 0;
  font-size: 14px;
}

.textbook-desc,
.chatbot-desc {
  padding: 16px;
  margin: -16px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.clickable-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.questions-main {
  padding: 20px 30px 30px 20px;
  background: transparent;
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.questions-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.questions-container {
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 8px;
}

.chatbot-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 移除内边距，让Chatbot组件撑满 */
  padding: 0; 
  /* 确保背景和阴影在父级应用 */
  background-color: transparent;
  box-shadow: none;
}

.textbook-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pdf-container {
  flex-grow: 1;
  overflow: hidden;
}

/* 自定义滚动条 */
.questions-container::-webkit-scrollbar {
  width: 6px;
}

.questions-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.questions-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.questions-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
