import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()
    if (!authStore.token) {
      if (to.path === '/500')
        next({ name: 'Root' })
      else
        next()
    }
    else {
      next()
    }
  })
}
