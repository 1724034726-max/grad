import { createRouter, createWebHashHistory } from 'vue-router'
import { Notebook, Link, EditPen, ChatDotSquare, House } from '@element-plus/icons-vue'
const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: House,
        },
      },
      {
        path: '/correction-notebook',
        component: () => import('../views/correction-notebook/index.vue'),
        meta: {
          title: '错题本',
          icon: Notebook,
        },
      },
      {
        path: '/correction-notebook/add',
        component: () => import('../views/correction-notebook/add.vue'),
        meta: {
          title: '新增错题',
          hidden: true,
        },
      },
      {
        path: '/mapping-knowledge-domain',
        component: () => import('../views/mapping-knowledge-domain/index.vue'),
        meta: {
          title: '知识图谱',
          icon: Link,
        },
      },
      {
        path: '/smart-practice',
        component: () => import('../views/smart-practice/index.vue'),
        meta: {
          title: '智能练习',
          icon: EditPen,
        },
      },
      {
        path: '/learning-report',
        component: () => import('../views/learning-report/index.vue'),
        meta: {
          title: '学习报告',
          icon: ChatDotSquare,
        },
      },
    ],
  },
  {
    path: '/login',
    component: () => import('../views/login/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  if (to.path === '/login') {
    next()
    return
  }
  if (!localStorage.getItem('token')) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
