<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NCard, NImage, NInput, NModal, useMessage } from 'naive-ui'
import { Md5 } from 'ts-md5/dist/md5'
import { useAuthStore } from '@/store'
import { SvgIcon } from '@/components/common'
import type { LoginRequest, PicCodeType, RegisterRequest, SmsCodeRequest } from '@/api/user'
import { getPicCode, getSmsCode, loginUser, registerUser } from '@/api/user'

interface Props {
  visible: boolean
}

defineProps<Props>()

const authStore = useAuthStore()

const ms = useMessage()

const loading = ref(false)

const phone = ref('')
const loginPassword = ref('')
const verifyCaptchaCode = ref('')
const messageCode = ref('')
const registerPassword = ref('')
const confirmPassword = ref('')

const disabled = computed(() => !phone.value.trim() || !loginPassword.value.trim() || !verifyCaptchaCode.value.trim())

// login: true; register/reset password: false
const currentMode = ref(true)

/* captcha related */
const picData = ref<PicCodeType>({
  base64Data: '',
  sessionId: '',
})

async function getCaptchaData() {
  try {
    const { data } = await getPicCode()
    picData.value.base64Data = `data:image/png;base64,${data?.base64Data}`
    picData.value.sessionId = data?.sessionId
  }
  catch (error) {
    ms.error(error.message ?? 'error')
  }
}
// init the captcha
getCaptchaData()

/*  get sms code  */
const smsButtonText = ref('获取短信验证码')
const smsLoading = ref(false)
const smsDisabled = ref(false)

const smsButtomTime = ref(60)
async function getPhoneSmsCode() {
  if (!phone.value.trim() || !verifyCaptchaCode.value.trim()) {
    ms.error('请输入手机号和验证码！')
    return
  }

  const smsRequest: SmsCodeRequest = {
    phoneNumber: phone.value,
    captchaSessionId: picData.value.sessionId,
    captchaVerifyCode: verifyCaptchaCode.value,
  }

  try {
    smsLoading.value = true
    smsButtonText.value = '短信发送中！'
    await getSmsCode(smsRequest)
    smsLoading.value = false
    ms.success('验证码发送成功！')
    // 开启定时器
    const time = setInterval(() => {
      smsDisabled.value = true
      smsButtomTime.value--
      smsButtonText.value = `重新发送(${smsButtomTime.value})`
      if (smsButtomTime.value <= 0) {
        clearInterval(time)
        smsButtomTime.value = 60
        smsButtonText.value = '获取短信验证码'
        smsDisabled.value = false
      }
    }, 1000)
  }
  catch (error) {
    ms.error(error.message ?? 'error')
  }
  finally {
    smsButtonText.value = '获取短信验证码'
    smsLoading.value = false
  }
}

/* register user */
const registerDisabled = computed(() => !phone.value.trim() || !verifyCaptchaCode.value.trim()
	|| !messageCode.value.trim() || !registerPassword.value.trim() || !confirmPassword.value.trim())
const registerLoading = ref(false)
async function register() {
  if (registerPassword.value.trim().length < 6) {
    ms.error('密码长度过短！')
    return
  }

  if (confirmPassword.value !== registerPassword.value) {
    ms.error('两次输入的密码不同！')
    return
  }

  const registerRequest: RegisterRequest = {
    phoneNumber: phone.value,
    smsVerifyCode: messageCode.value,
    password: Md5.hashStr(registerPassword.value),
  }

  try {
    registerLoading.value = true
    const { data } = await registerUser(registerRequest)
    ms.success(data)
  }
  catch (error) {
    ms.error(error.message ?? 'error')
  }
  finally {
    registerLoading.value = false
  }
}

const loginLoading = ref(false)
async function login() {
  const loginRequest: LoginRequest = {
    phoneNumber: phone.value,
    captchaSessionId: picData.value.sessionId,
    captchaVerifyCode: verifyCaptchaCode.value,
    password: Md5.hashStr(loginPassword.value),
  }

  try {
    loginLoading.value = true
    const { data } = await loginUser(loginRequest)
    ms.success('登录成功')

    // 登录成功后 存token
    authStore.setToken(data?.token)
    // 重载页面
    window.location.reload()
  }
  catch (error) {
    ms.error(error.message ?? 'error')
  }
  finally {
    loginLoading.value = false
  }
}

function switchLoginAndRegister() {
  currentMode.value = !currentMode.value
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
              首次登录前请先注册!
            </p>
          </NCard>
          <NInput v-model:value="phone" placeholder="请输入登录手机号" />
          <NInput v-model:value="loginPassword" type="password" placeholder="请输入登录密码" />
          <div class="flex">
            <NInput v-model:value="verifyCaptchaCode" class="mr-4" placeholder="请输入右侧验证码" />
            <div style="width: 200px; height: 34px;">
              <NImage :src="picData.base64Data" :preview-disabled="true" class="cursor-pointer" @click="getCaptchaData" />
            </div>
          </div>
          <NButton
            block
            type="primary"
            :loading="loginLoading"
            :disabled="disabled"
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
              注册即免费赠送5次提问机会
            </p>
          </NCard>
          <NInput v-model:value="phone" placeholder="请输入登录手机号" />
          <div class="flex">
            <NInput v-model:value="verifyCaptchaCode" class="mr-4" placeholder="请输入右侧验证码" />
            <div style="width: 200px; height: 34px;">
              <NImage :src="picData.base64Data" :preview-disabled="true" class="cursor-pointer" @click="getCaptchaData" />
            </div>
          </div>
          <div class="flex">
            <NInput v-model:value="messageCode" class="mr-2" placeholder="请输入短信验证码" />
            <div style="width: 190px; height: 32px;">
              <NButton
                block
                type="primary"
                :loading="smsLoading"
                :disabled="smsDisabled"
                @click="getPhoneSmsCode"
              >
                {{ smsButtonText }}
              </NButton>
            </div>
          </div>
          <div>
            <NInput v-model:value="registerPassword" type="password" placeholder="请输入登录密码(6位数以上)" />
          </div>
          <div>
            <NInput v-model:value="confirmPassword" type="password" placeholder="请确认登录密码" />
          </div>
          <NButton
            block
            type="primary"
            :disabled="registerDisabled"
            :loading="registerLoading"
            @click="register"
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
