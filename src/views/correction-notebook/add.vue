<template>
  <div class="wrong-add">
    <el-card shadow="hover">
      <div class="page-head">
        <div class="page-head__left">
          <el-button link type="primary" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
        </div>
        <span class="page-head__title">新增错题</span>
        <div class="page-head__right" />
      </div>

      <el-radio-group v-model="inputMode" class="mode-tabs" size="default">
        <el-radio-button value="ocr">上传图片 / OCR识别</el-radio-button>
        <el-radio-button value="manual">手动输入文本</el-radio-button>
        <el-radio-button value="voice">语音录入</el-radio-button>
      </el-radio-group>

      <div v-show="inputMode === 'ocr'" v-loading="parsing" class="section">
        <el-upload
          class="upload-block"
          drag
          accept="image/*"
          :limit="1"
          :show-file-list="true"
          :http-request="handleParseImage"
        >
          <el-icon class="upload-block__icon"><UploadFilled /></el-icon>
          <div class="upload-block__tip">拖拽或点击上传，自动调用图片解析</div>
        </el-upload>
      </div>

      <div v-show="inputMode === 'manual'" class="section muted-box">
        <p class="muted-box__text">在下方「识别结果」中直接编辑题目文本即可</p>
      </div>

      <div v-show="inputMode === 'voice'" class="section muted-box">
        <el-button type="primary" plain>点击开始录音（示意）</el-button>
        <p class="muted-box__hint">录音结束后可将转写结果填入识别结果</p>
      </div>

      <div class="section">
        <div class="field-label">识别结果（可编辑）：</div>
        <el-input v-model="recognitionText" type="textarea" :rows="4" placeholder="题目正文" />
      </div>

      <div class="section">
        <div class="field-label">题目解析（选填）：</div>
        <el-input v-model="analysis" placeholder="简要解析" clearable />
      </div>

      <div class="section">
        <div class="field-label">关联知识点</div>
        <div class="tag-row">
          <el-tag
            v-for="kp in knowledgePoints"
            :key="`${kp.id}-${kp.name}`"
            class="tag-row__item"
            closable
            @close="removeKnowledgePoint(kp)"
          >
            {{ kp.name }}
          </el-tag>
          <el-button size="small" @click="addKnowledgePoint">+ 添加标签</el-button>
        </div>
      </div>

      <div class="section section--inline">
        <div class="field-inline">
          <span class="field-label field-label--inline">所属科目</span>
          <el-select
            v-model="subject"
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入科目"
            style="width: 220px"
          >
            <el-option label="数学" value="数学" />
            <el-option label="物理" value="物理" />
            <el-option label="英语" value="英语" />
            <el-option label="化学" value="化学" />
          </el-select>
        </div>
        <div class="field-inline">
          <span class="field-label field-label--inline">难度</span>
          <el-rate v-model="difficulty" />
        </div>
      </div>

      <el-button type="primary" class="save-btn" size="large" :loading="saving" @click="onSave">
        保存错题
      </el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft, UploadFilled } from '@element-plus/icons-vue'
  import type { UploadRequestOptions } from 'element-plus'
  import { ElMessageBox } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    createQuestion,
    parseQuestionImage,
    type KnowledgePointItem,
    type ParseImageData,
    type QuestionCreateJson,
  } from './apis'

  const router = useRouter()

  const inputMode = ref<'ocr' | 'manual' | 'voice'>('ocr')
  const parsing = ref(false)
  const saving = ref(false)
  /** 最近一次解析结果，保存时可合并 options / answer / qtype */
  const lastParse = ref<ParseImageData | null>(null)
  const recognitionText = ref('')
  const analysis = ref('')
  const knowledgePoints = ref<KnowledgePointItem[]>([])
  const subject = ref('')
  const difficulty = ref(3)

  function goBack() {
    router.push('/correction-notebook')
  }

  function applyParseResult(data: ParseImageData) {
    lastParse.value = data
    recognitionText.value = data.rawText
    subject.value = data.createJson.subject
    difficulty.value = Math.min(5, Math.max(1, data.createJson.difficulty || 1))
    knowledgePoints.value = [...data.knowledgePoints]
  }

  async function handleParseImage(options: UploadRequestOptions) {
    const file = options.file as File
    parsing.value = true
    try {
      const data = await parseQuestionImage(file)
      applyParseResult(data)
      ElMessage.success('解析完成')
    } catch (e) {
      const msg = e instanceof Error ? e.message : '图片解析失败'
      ElMessage.error(msg)
      throw e
    } finally {
      parsing.value = false
    }
  }

  function removeKnowledgePoint(kp: KnowledgePointItem) {
    knowledgePoints.value = knowledgePoints.value.filter(
      (k) => k.id !== kp.id || k.name !== kp.name
    )
  }

  async function addKnowledgePoint() {
    try {
      const { value } = await ElMessageBox.prompt(
        '知识点 ID（需与后台一致，如 rj-math-g3-U-6-1）',
        '添加标签',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S+/,
          inputErrorMessage: '不能为空',
        }
      )
      const id = value.trim()
      if (knowledgePoints.value.some((k) => k.id === id)) return
      knowledgePoints.value.push({ id, name: id })
    } catch {
      /* 取消 */
    }
  }

  function buildSaveDto(): QuestionCreateJson {
    const base = lastParse.value?.createJson
    return {
      subject: subject.value.trim(),
      knowledgePointIds: knowledgePoints.value.map((k) => k.id).filter((id) => id.length > 0),
      difficulty: difficulty.value,
      qtype: base?.qtype ?? 'choice',
      stem: recognitionText.value.trim(),
      options: base?.options ? { ...base.options } : {},
      answer: base?.answer ?? '',
    }
  }

  async function onSave() {
    const stem = recognitionText.value.trim()
    if (!stem) {
      ElMessage.warning('请填写题干（识别结果）')
      return
    }
    if (!subject.value.trim()) {
      ElMessage.warning('请选择或填写科目')
      return
    }
    saving.value = true
    try {
      await createQuestion(buildSaveDto())
      ElMessage.success('保存成功')
      await router.push('/correction-notebook')
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '保存失败')
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped lang="scss">
  .wrong-add {
    max-width: 720px;
    margin: 0 auto;
  }

  .page-head {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 20px;
  }

  .page-head__left {
    justify-self: start;
  }

  .page-head__right {
    justify-self: end;
  }

  .page-head__title {
    justify-self: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .mode-tabs {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin-bottom: 20px;

    :deep(.el-radio-button__inner) {
      width: 100%;
    }
  }

  .section {
    margin-bottom: 20px;
  }

  .section--inline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 24px 32px;
  }

  .field-label {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin-bottom: 8px;
  }

  .field-label--inline {
    margin-bottom: 0;
    margin-right: 10px;
  }

  .field-inline {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .upload-block {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      min-height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
  }

  .upload-block__icon {
    font-size: 48px;
    color: var(--el-text-color-placeholder);
    margin-bottom: 8px;
  }

  .upload-block__tip {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .muted-box {
    padding: 16px;
    border-radius: var(--el-border-radius-base);
    background: var(--el-fill-color-light);
    text-align: center;
  }

  .muted-box__text {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .muted-box__hint {
    margin: 12px 0 0;
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .save-btn {
    width: 100%;
    margin-top: 8px;
  }
</style>
