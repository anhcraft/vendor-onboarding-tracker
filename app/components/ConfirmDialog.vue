<template>
  <dialog
    ref="dialogEl"
    class="confirm-dialog"
    @cancel.prevent="onCancel"
  >
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <div class="confirm-dialog__actions">
      <button class="button button--ghost" type="button" @click="onCancel">
        Cancel
      </button>
      <button class="button" type="button" @click="onConfirm">
        Confirm
      </button>
    </div>
  </dialog>
</template>

<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm',
  },
  message: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['confirm', 'cancel'])
const dialogEl = ref(null)

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

watch(() => props.open, syncDialog)

onMounted(() => {
  syncDialog(props.open)
})

function onCancel() {
  emit('cancel')
}

function onConfirm() {
  emit('confirm')
}
</script>
