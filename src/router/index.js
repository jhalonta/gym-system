import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import MainLayout from '../layouts/MainLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Members from '../views/Members.vue'
import Plans from '../views/Plans.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { layout: 'empty' }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'members',
        name: 'Members',
        component: Members
      },
      {
        path: 'plans',
        name: 'Plans',
        component: Plans
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // Wait for auth to initialize
  const currentUser = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(user)
    })
  })

  if (requiresAuth && !currentUser) {
    next('/login')
  } else if (to.path === '/login' && currentUser) {
    next('/')
  } else {
    next()
  }
})

export default router
