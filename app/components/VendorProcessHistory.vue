<template>
  <dialog
    ref="dialogEl"
    class="confirm-dialog history-dialog"
    @cancel.prevent="onClose"
  >
    <h2>Stage history</h2>
    <p class="lede">{{ vendorName }}</p>

    <template v-if="pending">
      <p class="muted">Loading history…</p>
    </template>
    <template v-else-if="errorMessage">
      <AppAlert :message="errorMessage" />
    </template>
    <template v-else>
      <div class="history-table-wrap">
        <table class="history-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Previous</th>
              <th>New stage</th>
              <th>Coordinator</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="history.length === 0">
              <td colspan="4" class="empty">No process history</td>
            </tr>
            <tr v-for="entry in history" :key="entry.id">
              <td>{{ formatDateTime(entry.createdAt) }}</td>
              <td>{{ entry.prevStage }}</td>
              <td>{{ entry.newStage }}</td>
              <td>{{ entry.coordinator }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div class="confirm-dialog__actions">
      <button class="button" type="button" @click="onClose">
        Close
      </button>
    </div>
  </dialog>
</template>

<script setup>
import { formatDateTime } from '#lib/format-date.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  vendorId: {
    type: String,
    default: '',
  },
  vendorName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])
const dialogEl = ref(null)
const history = ref([])
const pending = ref(false)
const errorMessage = ref('')

function syncDialog(isOpen) {
  const dialog = dialogEl.value
  if (!dialog) {
    return
  }

  if (isOpen && !dialog.open) {
    dialog.showModal()
  }
  else if (!isOpen && dialog.open) {
    dialog.close()
  }
}

async function loadHistory() {
  if (!props.open || !props.vendorId) {
    history.value = []
    errorMessage.value = ''
    return
  }

  pending.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch(`/api/vendors/${props.vendorId}/history`)
    history.value = response.history || []
  }
  catch (error) {
    history.value = []
    errorMessage.value = error.data?.message || error.message || 'Failed to load history'
  }
  finally {
    pending.value = false
  }
}

watch(() => props.open, (isOpen) => {
  syncDialog(isOpen)
  if (isOpen) {
    loadHistory()
  }
})

watch(() => props.vendorId, () => {
  if (props.open) {
    loadHistory()
  }
})

onMounted(() => {
  syncDialog(props.open)
})

function onClose() {
  emit('close')
}
</script>
