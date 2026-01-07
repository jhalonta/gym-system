<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'


const router = useRouter()
const searchQuery = ref('')
const isDarkMode = ref(true)

// Check theme on mount
import { onMounted } from 'vue'
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light') {
    isDarkMode.value = false
    document.documentElement.classList.add('light-mode')
  } else {
    isDarkMode.value = true
    document.documentElement.classList.remove('light-mode')
  }
})

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.remove('light-mode')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.add('light-mode')
    localStorage.setItem('theme', 'light')
  }
}

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/members', query: { search: searchQuery.value } })
    searchQuery.value = '' // Optional: clear after search or keep it
  }
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo-container">
        <span class="material-symbols-outlined logo-icon">fitness_center</span>
        <span class="logo-text">GymTouch</span>
      </div>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item" active-class="active">
          <span class="material-symbols-outlined">dashboard</span>
          Dashboard
        </router-link>
        <router-link to="/members" class="nav-item" active-class="active">
          <span class="material-symbols-outlined">group</span>
          Members
        </router-link>
        <router-link to="/plans" class="nav-item" active-class="active">
          <span class="material-symbols-outlined">sell</span>
          Plans
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="nav-item logout" style="width: 100%; border: none; background: transparent; cursor: pointer; justify-content: flex-start;">
          <span class="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <div class="top-bar">
        <div class="search-bar" v-if="$route.path !== '/plans'">
          <span class="material-symbols-outlined">search</span>
          <input 
            type="text" 
            placeholder="Buscar miembro..." 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          >
        </div>
        <div class="search-bar-placeholder" v-else></div> <!-- Spacer to keep layout alignment -->

        <div class="user-profile">
          <button class="icon-btn" @click="toggleTheme" title="Toggle Theme">
            <span class="material-symbols-outlined">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
          </button>
          <button class="icon-btn">
            <span class="material-symbols-outlined">notifications</span>
            <span class="badge"></span>
          </button>
          <div class="avatar-sm">AD</div>
        </div>
      </div>
      
      <div class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background-color: var(--bg-secondary);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  transition: width 0.3s ease;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 3rem;
  padding-left: 0.5rem;
}

.logo-icon {
  font-size: 2rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent);
  color: var(--primary-color);
  border-left: 3px solid var(--primary-color);
}

.nav-item .material-symbols-outlined {
  font-size: 1.25rem;
}

.sidebar-footer {
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1rem;
}

.logout:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

/* Main Content */
.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.top-bar {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  width: 300px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.search-bar:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.search-bar input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  width: 100%;
  outline: none;
}

.search-bar .material-symbols-outlined {
  color: var(--text-secondary);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-btn {
  background: transparent;
  color: var(--text-secondary);
  position: relative;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  box-shadow: none;
}

.icon-btn:hover {
  color: var(--text-primary);
  background: rgba(255,255,255,0.05);
  transform: none;
}

.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

.avatar-sm {
  width: 36px;
  height: 36px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: white;
  border: 2px solid var(--bg-card);
}

.content-area {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
