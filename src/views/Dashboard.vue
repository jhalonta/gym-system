<template>
  <div class="dashboard-view">
    <header class="view-header">
      <h1>Panel de Control</h1>
      <p class="subtitle">Bienvenido de nuevo, Admin</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="icon-wrapper users">
          <span class="material-symbols-outlined">group</span>
        </div>
        <div class="stat-info">
          <h3>Members Activos</h3>
          <p class="stat-value">{{ activeMembers }}</p>
          <span class="stat-change positive">Total: {{ totalMembers }} registrados</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="icon-wrapper revenue">
          <span class="material-symbols-outlined">payments</span>
        </div>
        <div class="stat-info">
          <h3>Ingresos Mensuales</h3>
          <p class="stat-value">${{ monthlyRevenue.toLocaleString() }}</p>
          <span class="stat-change positive">Estimado por planes</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="icon-wrapper gym">
          <span class="material-symbols-outlined">fitness_center</span>
        </div>
        <div class="stat-info">
          <h3>Planes Activos</h3>
          <p class="stat-value">{{ totalMembers }}</p>
          <span class="stat-change neutral">100% de ocupación</span>
        </div>
      </div>
      
       <div class="stat-card">
        <div class="icon-wrapper alerts">
           <span class="material-symbols-outlined">notifications_active</span>
        </div>
        <div class="stat-info">
          <h3>Alertas</h3>
          <p class="stat-value">0</p>
          <span class="stat-change negative">Sistema funcionando</span>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity card">
      <h2>Actividad Reciente (Nuevos Members)</h2>
      <ul class="activity-list" v-if="recentMembers.length > 0">
        <li v-for="member in recentMembers" :key="member.id" class="activity-item">
          <div class="activity-avatar">{{ getInitials(member.name) }}</div>
          <div class="activity-details">
            <span class="activity-text"><strong>{{ member.name }}</strong> se unió con el plan <strong>{{ member.plan }}</strong></span>
            <span class="activity-time">Registrado el {{ formatDate(member.joinedDate) }}</span>
          </div>
        </li>
      </ul>
      <p v-else style="padding: 1rem; color: var(--text-secondary);">No hay actividad reciente.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'

const members = ref([])
const loading = ref(true)

// Real-time listener
let unsubscribe = null

onMounted(() => {
  const q = query(
    collection(db, 'members'), 
    orderBy('joinedDate', 'desc')
  )
  
  unsubscribe = onSnapshot(q, (snapshot) => {
    members.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    loading.value = false
  }, (error) => {
    console.error("Error fetching dashboard data: ", error)
    loading.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

// Metrics Calculations
const totalMembers = computed(() => members.value.length)

const activeMembers = computed(() => {
  return members.value.filter(m => m.status === 'Active').length
})

const monthlyRevenue = computed(() => {
  return members.value.reduce((total, member) => {
    // Estimating revenue based on plan names
    let price = 0
    if (member.plan === 'Basic') price = 29
    if (member.plan === 'Gold' || member.plan === 'Gold Plan') price = 49
    if (member.plan === 'Platinum') price = 89
    // If status is not active, maybe we shouldn't count it? 
    // For now, let's assume all members pay unless inactive
    if (member.status === 'Inactive') return total
    return total + price
  }, 0)
})

const recentMembers = computed(() => {
  return members.value.slice(0, 5)
})

// Utilities
const getInitials = (name) => {
  return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.view-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(255,255,255,0.05);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: rgba(255,255,255,0.1);
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.icon-wrapper.users { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
.icon-wrapper.revenue { background: linear-gradient(135deg, #10b981, #34d399); }
.icon-wrapper.gym { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.icon-wrapper.alerts { background: linear-gradient(135deg, #ef4444, #f87171); }

.stat-info h3 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.stat-change {
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.stat-change.positive { color: #10b981; }
.stat-change.negative { color: #ef4444; }
.stat-change.neutral { color: var(--text-secondary); }

.recent-activity {
  width: 100%;
}

.recent-activity h2 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.activity-list {
  list-style: none;
  padding: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.activity-item:first-child {
  border-top-left-radius: var(--radius-md);
  border-top-right-radius: var(--radius-md);
}

.activity-item:last-child {
  border-bottom: none;
  border-bottom-left-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.activity-avatar {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.activity-details {
  display: flex;
  flex-direction: column;
}

.activity-text {
  color: var(--text-primary);
  font-size: 0.95rem;
}

.activity-time {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
