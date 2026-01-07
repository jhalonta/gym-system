<template>
  <div class="plans-view">
    <header class="view-header">
      <h1>Planes de Membresía</h1>
      <p class="subtitle">Elige el mejor plan para tu viaje fitness</p>
    </header>

    <div class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{ popular: plan.isPopular }"
      >
        <div v-if="plan.isPopular" class="popular-badge">Más Popular</div>

        <div class="plan-header">
          <h3>{{ plan.name }}</h3>
          <div class="price">
            <span class="currency">S/</span>
            <span class="amount">{{ plan.price }}</span>
            <span class="period">/mes</span>
          </div>
        </div>

        <ul class="features-list">
          <li v-for="(feature, index) in plan.features" :key="index">
            <span class="material-symbols-outlined check-icon">check_circle</span>
            {{ feature }}
          </li>
        </ul>

        <button
          @click="selectPlan(plan)"
          class="select-plan-btn"
          :class="{ outline: !plan.isPopular }"
        >
          Seleccionar Plan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const plans = [
  {
    id: 1,
    name: 'Basic',
    price: 29,
    isPopular: false,
    features: ['Acceso al Gimnasio', 'Acceso a Casilleros', 'Wi-Fi Gratis']
  },
  {
    id: 2,
    name: 'Gold Plan',
    price: 49,
    isPopular: true,
    features: [
      'Todo lo de Basic',
      'Clases Grupales',
      'Acceso a Sauna',
      '1 Sesión de Entrenador Personal'
    ]
  },
  {
    id: 3,
    name: 'Platinum',
    price: 89,
    isPopular: false,
    features: [
      'Todo lo de Gold',
      'Entrenamiento Ilimitado',
      'Consulta Nutricional',
      'Pase de Invitado'
    ]
  }
]

const selectPlan = (plan) => {
  router.push({ path: '/members', query: { plan: plan.name } })
}
</script>

<style scoped>
.plans-view {
  /* Break out of parent padding */
  margin: -2rem;
  width: calc(100% + 4rem);

  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
  overflow: hidden;
}

/* IMAGEN DE FONDO */
.plans-view::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('../assets/img/gym.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.35) contrast(1.1);
  z-index: 0;
}

/* CONTENIDO */
.plans-view > * {
  position: relative;
  z-index: 2;
}

.view-header {
  text-align: center;
}

.view-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
}

.plan-card {
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
}

.plan-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
}

.plan-card.popular {
  background: linear-gradient(145deg, var(--bg-secondary), #2d2b42);
  border: 1px solid var(--primary-color);
  transform: scale(1.05);
}

.plan-card.popular:hover {
  transform: scale(1.05) translateY(-10px);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gradient-primary);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
}

.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-header h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.price {
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.currency {
  font-size: 1.5rem;
}

.amount {
  font-size: 3.5rem;
  font-weight: 800;
}

.period {
  color: var(--text-secondary);
  margin-left: 0.25rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  flex-grow: 1;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.check-icon {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.select-plan-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

.select-plan-btn.outline {
  background: transparent;
  border: 1px solid var(--text-secondary);
  color: var(--text-primary);
}
</style>
