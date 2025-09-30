<template>
  <div class="pdf-preview-container" v-if="source">
    <h4>教材预览</h4>
    <div class="pdf-wrapper">
      <vue-pdf-embed :source="source" :page="page" />
    </div>
    <p class="page-number">第 {{ page }} 页</p>
    <el-button type="primary" @click="viewDetails" class="details-btn">
      跳转至该页
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';

const props = defineProps<{
  source: string;
  page: number;
}>();

const emit = defineEmits(['view-details']);

const viewDetails = () => {
  emit('view-details');
};
</script>

<style scoped>
.pdf-preview-container {
  width: 320px;
  padding: 20px;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f9fafb;
}
.pdf-preview-container h4 {
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.pdf-wrapper {
  flex-grow: 1;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.page-number {
  text-align: center;
  margin: 0;
  color: #606266;
  font-size: 14px;
}
.details-btn {
  width: 100%;
}
</style>
