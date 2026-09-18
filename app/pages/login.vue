<template>
  <main class="page page--login">
    <section class="card">
      <h1>Vendor Onboarding</h1>
      <p class="lede">Sign in with your coordinator account.</p>
      <AppAlert :message="errorMessage" />
      <LoginForm :pending="pending" @submit="onSubmit" />
    </section>
  </main>
</template>

<script setup>
definePageMeta({
  middleware: 'guest',
})

const { fetch: fetchSession } = useUserSession()
const errorMessage = ref('')
const pending = ref(false)

async function onSubmit({ username, password }) {
  errorMessage.value = ''
  pending.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    await fetchSession()
    await navigateTo('/')
  }
  catch (error) {
    errorMessage.value = error.data?.message || error.message || 'Unable to sign in'
  }
  finally {
    pending.value = false
  }
}
</script>
