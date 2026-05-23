<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <span class="login-title">登录</span>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" native-type="submit" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { loginApi } from './apis'

  const router = useRouter()
  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const form = reactive({
    username: '',
    password: '',
  })

  const rules: FormRules = {
    username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  }

  const onSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      loading.value = true
      try {
        const { access_token } = await loginApi({
          account: form.username,
          password: form.password,
        })
        localStorage.setItem('token', access_token)
        ElMessage.success('登录成功')
        await router.push('/dashboard')
      } finally {
        loading.value = false
      }
    })
  }
</script>

<style scoped lang="scss">
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    background: linear-gradient(160deg, var(--el-fill-color-light) 0%, var(--el-bg-color) 45%);
  }

  .login-card {
    width: 100%;
    max-width: 400px;
  }

  .login-title {
    font-size: 18px;
    font-weight: 600;
  }

  .submit-btn {
    width: 100%;
  }
</style>
