<template>
  <main class="page">
    <header class="page-header">
      <div>
        <h1>Vendors</h1>
        <p class="lede">Onboarding status for all vendors.</p>
      </div>
      <div class="session">
        <span>{{ user?.name }}</span>
        <button class="button button--ghost" type="button" @click="logout">
          Sign out
        </button>
      </div>
    </header>

    <AppAlert :message="errorMessage" />

    <p v-if="pending" class="muted">Loading vendors…</p>
    <VendorTable
      v-else
      :vendors="vendors"
      :pending="updating"
      @stage-change="onStageChange"
    />
  </main>
</template>

<script setup>
definePageMeta({
  middleware: 'auth',
})

const { user, clear } = useUserSession()
const errorMessage = ref('')
const updating = ref(false)

const { data, status, refresh, error } = await useFetch('/api/vendors')

const vendors = computed(() => data.value || [])
const pending = computed(() => status.value === 'pending')

watch(error, (value) => {
  if (value) {
    errorMessage.value = value.data?.message || 'Failed to load vendors'
  }
}, { immediate: true })

async function onStageChange({ id, stage }) {
  errorMessage.value = ''
  updating.value = true

  try {
    await $fetch(`/api/vendors/${id}/stage`, {
      method: 'PATCH',
      body: { stage },
    })
    await refresh()
  }
  catch (err) {
    errorMessage.value = err.data?.message || 'Failed to update stage'
    await refresh()
  }
  finally {
    updating.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>
