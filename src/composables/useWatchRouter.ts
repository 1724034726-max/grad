import { useRoute, useRouter } from 'vue-router'
import { watch, ref } from 'vue'
export interface BreadcrumbItem {
  path: string
  name: string
}
export const useWatchRouter = () => {
  const route = useRoute()
  const routeHistory = ref<BreadcrumbItem[]>([])
  const router = useRouter()
  watch(
    route,
    (newVal) => {
      // 有title的才添加到routeHistory
      if (newVal.meta?.title) {
        if (routeHistory.value.some((item) => item.path === newVal.path)) {
          return
        }
        routeHistory.value.push({
          path: newVal.path,
          name: newVal.meta?.title as string,
        })
      }
    },
    { immediate: true },
  )
  const onDeleteRouteHistory = (path: string) => {
    const idx = routeHistory.value.findIndex((item) => item.path === path)
    // 删除前判断是否是当前路由，如果是则跳转到上一个或下一个路由
    if (route.path === path && idx >= 0) {
      const next = routeHistory.value[idx + 1]
      const prev = routeHistory.value[idx - 1]
      router.push((next ?? prev)!.path)
    }

    routeHistory.value = routeHistory.value.filter((item) => item.path !== path)
  }
  return {
    routeHistory,
    currentRoute: route,
    router,
    onDeleteRouteHistory,
  }
}
