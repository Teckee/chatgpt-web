<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { NButton, NInput, NPopconfirm, useMessage } from 'naive-ui'
import type { Theme } from '@/store/modules/app/helper'
import { SvgIcon } from '@/components/common'
import { useAppStore, useAuthStore, useUserStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { getCurrentDate } from '@/utils/functions'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import type { UserUpdateRequest } from '@/api/user'
import { getUserInfo, updateUserInfo } from '@/api/user'

const appStore = useAppStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const { isMobile } = useBasicLayout()

const ms = useMessage()

const theme = computed(() => appStore.theme)

const userInfo = computed(() => userStore.userInfo)

const name = ref(userInfo.value.name ?? '')
const userType = ref(userInfo.value.type ?? '')
const userTypeText = computed(() => {
  if (userType.value === 'free')
    return '免费用户'
  else if (userType.value === 'vip')
    return '付费会员'
  else if (userType.value === 'admin')
    return '管理员'
  else
    return '体验用户'
})

const latestRemainCount = ref(-1)

const remainCount = computed(() => latestRemainCount.value !== -1 ? latestRemainCount.value : (userInfo.value.remainCount ?? 0))

const themeOptions: { label: string; key: Theme; icon: string }[] = [
  {
    label: 'Auto',
    key: 'auto',
    icon: 'ri:contrast-line',
  },
  {
    label: 'Light',
    key: 'light',
    icon: 'ri:sun-foggy-line',
  },
  {
    label: 'Dark',
    key: 'dark',
    icon: 'ri:moon-foggy-line',
  },
]

async function saveUserInfo(options: Partial<UserInfo>) {
  try {
    const userUpdateRequest: UserUpdateRequest = {
      userName: options.name,
    }
    await updateUserInfo(userUpdateRequest)
    userStore.updateUserInfo(options)
    ms.success('保存成功')
  }
  catch (error) {
    ms.error(error.message ?? '保存失败')
  }
}

function handleReset() {
  userStore.resetUserInfo()
  ms.success(t('common.success'))
  window.location.reload()
}

function exportData(): void {
  const date = getCurrentDate()
  const data: string = localStorage.getItem('chatStorage') || '{}'
  const jsonString: string = JSON.stringify(JSON.parse(data), null, 2)
  const blob: Blob = new Blob([jsonString], { type: 'application/json' })
  const url: string = URL.createObjectURL(blob)
  const link: HTMLAnchorElement = document.createElement('a')
  link.href = url
  link.download = `chat-store_${date}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function importData(event: Event): void {
  const target = event.target as HTMLInputElement
  if (!target || !target.files)
    return

  const file: File = target.files[0]
  if (!file)
    return

  const reader: FileReader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      localStorage.setItem('chatStorage', JSON.stringify(data))
      ms.success(t('common.success'))
      location.reload()
    }
    catch (error) {
      ms.error(t('common.invalidFileFormat'))
    }
  }
  reader.readAsText(file)
}

function clearData(): void {
  localStorage.removeItem('chatStorage')
  location.reload()
}

function handleImportButtonClick(): void {
  const fileInput = document.getElementById('fileInput') as HTMLElement
  if (fileInput)
    fileInput.click()
}

async function refreshUserInfo() {
  try {
    const { data } = await getUserInfo()

    const lastestUserInfo: UserInfo = {
      name: data?.userName,
      type: data?.userType,
      remainCount: data?.remainCount,
    }

    latestRemainCount.value = data?.remainCount

    userStore.refreshUserInfo(lastestUserInfo)
    userInfo.value = lastestUserInfo
  }
  catch (error) {
    ms.error(error.message ?? 'error')
  }
}

// refresh the user info every time when user open the settings
onMounted(() => {
  refreshUserInfo()
})

function logout(): void {
  // 移除token
  authStore.removeToken()
  userStore.resetUserInfo()
  // 重载页面
  window.location.reload()
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <p>
          &#x2B50;	尊敬的 <span class="text-red">{{ name }}</span>
          您好，您当前为<span class="text-red">{{ userTypeText }}</span>，
          当前剩余可用对话次数为<span class="text-green">{{ remainCount }}</span>次。(若在过程中出现异常或者无结果，将不会扣除您的次数。)
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">用户昵称</span>
        <div class="w-[200px]">
          <NInput v-model:value="name" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="saveUserInfo({ name })">
          保存
        </NButton>
      </div>
      <div
        class="flex items-center space-x-4"
        :class="isMobile && 'items-start'"
      >
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.chatHistory') }}</span>

        <div class="flex flex-wrap items-center gap-4">
          <NButton size="small" @click="exportData">
            <template #icon>
              <SvgIcon icon="ri:download-2-fill" />
            </template>
            {{ $t('common.export') }}
          </NButton>

          <input id="fileInput" type="file" style="display:none" @change="importData">
          <NButton size="small" @click="handleImportButtonClick">
            <template #icon>
              <SvgIcon icon="ri:upload-2-fill" />
            </template>
            {{ $t('common.import') }}
          </NButton>

          <NPopconfirm placement="bottom" @positive-click="clearData">
            <template #trigger>
              <NButton size="small">
                <template #icon>
                  <SvgIcon icon="ri:close-circle-line" />
                </template>
                {{ $t('common.clear') }}
              </NButton>
            </template>
            {{ $t('chat.clearHistoryConfirm') }}
          </NPopconfirm>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.theme') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <template v-for="item of themeOptions" :key="item.key">
            <NButton
              size="small"
              :type="item.key === theme ? 'primary' : undefined"
              @click="appStore.setTheme(item.key)"
            >
              <template #icon>
                <SvgIcon :icon="item.icon" />
              </template>
            </NButton>
          </template>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <NButton size="small" color="#FF4500" @click="logout">
          注销登录
        </NButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-red {
	color: red;
	margin-left: 2px;
	margin-right: 2px;
}

.text-green {
	color: green;
	margin-left: 2px;
	margin-right: 2px;
}
</style>
