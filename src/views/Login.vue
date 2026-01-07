<template>
  <div class="login-container">
    <!-- Branding Outside Card -->
    <div class="brand-container">
      <svg width="600" height="250" viewBox="0 0 600 250" class="arched-brand">
        <path id="curve" d="M 50 180 Q 300 60 550 180" fill="transparent"/>
        <text width="600">
          <textPath href="#curve" startOffset="50%" text-anchor="middle" class="brand-text">
            Royal Fit Gym
          </textPath>
        </text>
      </svg>
    </div>

    <div class="login-card">
      <div class="brand">
        <span class="material-symbols-outlined logo-icon">fitness_center</span>
        <h1>GymTouch</h1>
      </div>
      <p class="subtitle">Sign in to manage your empire</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="errorMsg" class="error-alert">
          <span class="material-symbols-outlined">error</span>
          {{ errorMsg }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="admin@gymtouch.com" required :disabled="isLoading">
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" placeholder="••••••••" required :disabled="isLoading">
        </div>
        
        <div class="form-footer">
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>
        
        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="loader"></span>
          <span v-else>Sign In</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  errorMsg.value = ''
  isLoading.value = true
  
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/')
  } catch (error) {
    console.error(error)
    switch (error.code) {
      case 'auth/invalid-email':
        errorMsg.value = 'Invalid email address.'
        break
      case 'auth/user-disabled':
        errorMsg.value = 'User account is disabled.'
        break
      case 'auth/user-not-found':
        errorMsg.value = 'User not found.'
        break
      case 'auth/wrong-password':
        errorMsg.value = 'Incorrect password.'
        break
      default:
        errorMsg.value = 'Email or password was incorrect.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column; /* Stack items vertically */
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* Fixed path to use relative URL */
  background-image: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('../assets/img/login_bg.png');
  background-size: cover;
  background-position: center;
  padding: 1rem;
  gap: 2rem; /* Space between branded text and card */
}

.brand-container {
  display: flex;
  justify-content: center;
  margin-bottom: -2rem; /* Pull closer to card slightly if needed */
  z-index: 10;
}

.brand-text {
  font-family: 'Pirata One', cursive;
  font-size: 5.5rem; /* Even larger */
  font-weight: 900;
  fill: #39FF14; 
  stroke: #39FF14; /* Add stroke to make it thicker */
  stroke-width: 1.5px;
  letter-spacing: 4px;
  filter: drop-shadow(0px 0px 15px rgba(57, 255, 20, 0.8)); /* Stronger Glow */
  text-transform: uppercase;
}

.login-card {
  background: var(--bg-secondary);
  padding: 3rem;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative; 
}

/* Restore internal logo for the card itself if needed, or remove. 
   Keeping it as part of the form header layout */
.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 2.5rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
}

input {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
}

.forgot-password {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.login-btn {
  margin-top: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #39FF14; /* Neon Green */
  color: black; /* High contrast */
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  text-transform: uppercase;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(57, 255, 20, 0.3);
}

.login-btn:hover {
  background: #32d613;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(57, 255, 20, 0.5);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
