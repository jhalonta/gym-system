<template>
  <div class="members-view">
    <header class="view-header">
      <div class="header-content">
        <h1>Members</h1>
        <p class="subtitle">Administra tus Members y suscripciones</p>
      </div>
      <button @click="openAddModal" class="add-btn">
        <span class="material-symbols-outlined">add</span>
        Agregar Member
      </button>
    </header>

    <div class="card table-container">
      <table class="members-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Estado</th>
            <th>Plan</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
             <td colspan="5" style="text-align:center; padding: 2rem;">Cargando Members...</td>
          </tr>
          <tr v-else-if="members.length === 0">
             <td colspan="5" style="text-align:center; padding: 2rem;">No se encontraron Members. ¡Agrega uno para empezar!</td>
          </tr>
          <tr v-for="member in members" :key="member.id">
            <td>
              <div class="member-info">
                <div class="avatar">{{ getInitials(member.name) }}</div>
                <div>
                  <div class="member-name">{{ member.name }}</div>
                  <div class="member-email">{{ member.email }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="member.status.toLowerCase()">
                {{ member.status }}
              </span>
            </td>
            <td>{{ member.plan }}</td>
            <td>{{ formatDate(member.joinedDate) }}</td>
            <td>
              <div class="actions">
                <button @click="openEditModal(member)" class="icon-btn"><span class="material-symbols-outlined">edit</span></button>
                <button @click="confirmDelete(member)" class="icon-btn delete"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <header class="modal-header">
          <h2>{{ isEditing ? 'Editar Member' : 'Agregar Nuevo Member' }}</h2>
          <button @click="closeModal" class="close-btn"><span class="material-symbols-outlined">close</span></button>
        </header>
        
        <form @submit.prevent="saveMember" class="modal-form">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="form.name" type="text" required placeholder="John Doe">
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" required placeholder="john@example.com">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Plan</label>
              <select v-model="form.plan" required>
                <option value="Basic">Basic</option>
                <option value="Silver Plan">Silver Plan</option>
                <option value="Gold Plan">Gold Plan</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Estado</label>
              <select v-model="form.status" required>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
           <div class="form-group">
            <label>Fecha de Registro</label>
            <input v-model="form.joinedDate" type="date" required>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-save" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar Member' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal delete-modal">
        <div class="modal-icon warning">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <div class="modal-content-center">
          <h2>¿Eliminar Member?</h2>
          <p>¿Estás seguro de que deseas eliminar al Member <strong>{{ memberToDelete?.name }}</strong>? Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-actions center">
          <button @click="closeDeleteModal" class="btn-cancel">Cancelar</button>
          <button @click="executeDelete" class="btn-delete" :disabled="saving">
            {{ saving ? 'Eliminando...' : 'Sí, Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '../firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()

const members = ref([])
const loading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false) // New state
const memberToDelete = ref(null)   // New state
const isEditing = ref(false)
const saving = ref(false)
const currentMemberId = ref(null)

const form = ref({
  name: '',
  email: '',
  plan: 'Basic',
  status: 'Active',
  joinedDate: new Date().toISOString().split('T')[0]
})

// Real-time listener
let unsubscribe = null

onMounted(() => {
  const q = query(collection(db, 'members'), orderBy('joinedDate', 'desc'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    members.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    loading.value = false
  }, (error) => {
    console.error("Error fetching members: ", error)
    loading.value = false
  })

  // Check for plan in query
  if (route.query.plan) {
    openAddModal()
    form.value.plan = route.query.plan
    // Clean URL
    router.replace({ path: '/members', query: {} })
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

// Utilities
const getInitials = (name) => {
  return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Modal Logic
const openAddModal = () => {
  isEditing.value = false
  currentMemberId.value = null
  form.value = {
    name: '',
    email: '',
    plan: 'Basic',
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0]
  }
  showModal.value = true
}

const openEditModal = (member) => {
  isEditing.value = true
  currentMemberId.value = member.id
  form.value = { ...member }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  memberToDelete.value = null
}

// CRUD Operations
const saveMember = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await updateDoc(doc(db, 'members', currentMemberId.value), form.value)
    } else {
      await addDoc(collection(db, 'members'), form.value)
    }
    closeModal()
  } catch (e) {
    console.error("Error saving member: ", e)
    alert("Error al guardar Member: " + e.message)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (member) => {
  memberToDelete.value = member
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!memberToDelete.value) return
  
  saving.value = true
  try {
    await deleteDoc(doc(db, 'members', memberToDelete.value.id))
    closeDeleteModal()
  } catch (e) {
    console.error("Error deleting member: ", e)
    alert("Error al eliminar Member: " + e.message)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.members-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-container {
  overflow-x: auto;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
}

.members-table th {
  text-align: left;
  padding: 1rem;
  color: var(--text-secondary);
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.members-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.members-table tr:last-child td {
  border-bottom: none;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
}

.member-name {
  font-weight: 500;
}

.member-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.status-badge.pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.status-badge.inactive { background: rgba(239, 68, 68, 0.2); color: #f87171; }

.actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: transparent;
  box-shadow: none;
  padding: 0.5rem;
  color: var(--text-secondary);
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  transform: none;
}

.icon-btn.delete:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  font-size: 1.5rem;
}

.close-btn {
  background: transparent;
  box-shadow: none;
  color: var(--text-secondary);
  padding: 0.5rem;
}

.close-btn:hover {
  color: var(--text-primary);
  background: rgba(255,255,255,0.05);
  transform: none;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

input, select {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-family: inherit;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Delete Modal Specifics */
.delete-modal {
  max-width: 400px;
  text-align: center;
  border-color: rgba(239, 68, 68, 0.2);
}

.modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-icon .material-symbols-outlined {
  font-size: 2rem;
}

.modal-content-center h2 {
  margin-bottom: 0.5rem;
}

.modal-content-center p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.modal-actions.center {
  justify-content: center;
}

.btn-delete {
  background: #ef4444;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  border: none;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);
}

.btn-delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
</style>
