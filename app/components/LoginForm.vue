<template>
  <form class="login-form" @submit.prevent="onSubmit">
    <label class="field">
      <span>Username</span>
      <input
        v-model="username"
        type="text"
        name="username"
        autocomplete="username"
        required
      >
    </label>

    <label class="field">
      <span>Password</span>
      <input
        v-model="password"
        type="password"
        name="password"
        autocomplete="current-password"
        required
      >
    </label>

    <button class="button" type="submit" :disabled="pending">
      {{ pending ? 'Signing in…' : 'Sign in' }}
    </button>
  </form>
</template>

<script setup>
const emit = defineEmits(['submit'])

defineProps({
  pending: {
    type: Boolean,
    default: false,
  },
})

const username = ref('')
const password = ref('')

function onSubmit() {
  emit('submit', {
    username: username.value.trim(),
    password: password.value,
  })
}
</script>
