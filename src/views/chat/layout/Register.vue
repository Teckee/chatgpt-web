<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NCard, NInput, NModal, useMessage } from 'naive-ui'
import { useAuthStore } from '@/store'
import { SvgIcon } from '@/components/common'

interface Props {
  visible: boolean
}

defineProps<Props>()

const authStore = useAuthStore()

const ms = useMessage()

const loading = ref(false)

const phone = ref('')
const password = ref('')
const verifyCode = ref('')
const messageCode = ref('')
const loginPassword = ref('')
const confirmPassword = ref('')

const disabled = computed(() => !phone.value.trim() || !password.value.trim() || !verifyCode.value.trim())

// login: true; register/reset password: false
const currentMode = ref(true)

async function login() {

}

function switchLoginAndRegister() {
  currentMode.value = !currentMode.value
}

// async function handleVerify() {
//   const secretKey = token.value.trim()
//
//   if (!secretKey)
//     return
//
//   try {
//     loading.value = true
//     await fetchVerify(secretKey)
//     authStore.setToken(secretKey)
//     ms.success('success')
//     window.location.reload()
//   }
//   catch (error: any) {
//     ms.error(error.message ?? 'error')
//     authStore.removeToken()
//     token.value = ''
//   }
//   finally {
//     loading.value = false
//   }
// }

function handlePress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey)
    event.preventDefault()
    // handleVerify()
}
</script>

<template>
  <NModal :show="visible" style="width: 90%; max-width: 400px">
    <div class="p-8 bg-white rounded dark:bg-slate-800">
      <div v-show="currentMode">
        <div class="space-y-4">
          <header class="flex items-center">
            <span class="text-xl text-[#4b9e5f]">
              <SvgIcon icon="material-symbols:info" />
            </span>
            <p class="text-base font-bold text-slate-700">
              用户认证
            </p>
          </header>
          <NCard content-style="padding: 10px;">
            <p class="text-slate-600">
              注册即免费赠送10次提问机会
            </p>
          </NCard>
          <NInput v-model:value="phone" placeholder="请输入登录手机号" />
          <NInput v-model:value="password" type="password" placeholder="请输入登录密码" />
          <div>
            <NInput v-model:value="verifyCode" placeholder="请输入右侧验证码" />
          </div>
          <NButton
            block
            type="primary"
            :disabled="disabled"
            :loading="loading"
            @click="login"
          >
            登录
          </NButton>
          <p class="flex items-center justify-center">
            <span class="cursor-pointer" :style="{ 'color': '#18a058', 'text-decoration-line': 'underline' }" @click="switchLoginAndRegister">前往注册/重置密码</span>
          </p>
        </div>
      </div>
      <div v-show="!currentMode">
        <div class="space-y-4">
          <header class="flex items-center">
            <span class="text-xl text-[#4b9e5f]">
              <SvgIcon icon="material-symbols:info" />
            </span>
            <p class="text-base font-bold text-slate-700">
              用户认证
            </p>
          </header>
          <NCard content-style="padding: 10px;">
            <p class="text-slate-600">
              注册即免费赠送10次提问机会
            </p>
          </NCard>
          <NInput v-model:value="phone" placeholder="请输入登录手机号" />
          <div>
            <NInput v-model:value="verifyCode" placeholder="请输入右侧验证码" />
          </div>
          <div>
            <NInput v-model:value="messageCode" placeholder="请输入右侧验证码" />
          </div>
          <div>
            <NInput v-model:value="loginPassword" placeholder="请输入登录密码(6位数以上)" />
          </div>
          <div>
            <NInput v-model:value="confirmPassword" placeholder="请确认登录密码" />
          </div>
          <NButton
            block
            type="primary"
            :disabled="disabled"
            :loading="loading"
            @click="login"
          >
            注册/重置密码
          </NButton>
          <p class="flex items-center justify-center">
            <span class="cursor-pointer" :style="{ 'color': '#18a058', 'text-decoration-line': 'underline' }" @click="switchLoginAndRegister">前往登录</span>
          </p>
        </div>
      </div>
    </div>
  </NModal>
</template>
