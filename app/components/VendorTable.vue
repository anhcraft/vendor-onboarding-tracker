<template>
  <div class="table-wrap">
    <table class="vendor-table">
      <thead>
        <tr>
          <th>Vendor</th>
          <th>Region</th>
          <th>Stage</th>
          <th>LastUpdate</th>
          <th>Coordinator</th>
          <th>Notes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="vendors.length === 0">
          <td colspan="7" class="empty">No vendors found</td>
        </tr>
        <tr
          v-for="vendor in vendors"
          :key="vendor.id"
          :class="{ 'vendor-row--stuck': vendor.isStuck }"
        >
          <td>{{ vendor.name }}</td>
          <td>{{ vendor.region }}</td>
          <td>
            <VendorStageSelect
              :model-value="vendor.stage"
              :disabled="pending"
              @update:model-value="onStageChange(vendor, $event)"
            />
          </td>
          <td>{{ formatDateTime(vendor.lastUpdate) }}</td>
          <td>{{ vendor.coordinator }}</td>
          <td>{{ vendor.notes }}</td>
          <td>
            <button
              class="button button--ghost"
              type="button"
              @click="openHistory(vendor)"
            >
              History
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <ConfirmDialog
      :open="Boolean(pendingChange)"
      title="Confirm stage change"
      :message="confirmMessage"
      @confirm="onConfirm"
      @cancel="onCancel"
    />

    <VendorProcessHistory
      :open="Boolean(historyVendor)"
      :vendor-id="historyVendor?.id || ''"
      :vendor-name="historyVendor?.name || ''"
      @close="historyVendor = null"
    />
  </div>
</template>

<script setup>
import { formatDateTime } from '#lib/format-date.js'

defineProps({
  vendors: {
    type: Array,
    default: () => [],
  },
  pending: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['stage-change'])
const pendingChange = ref(null)
const historyVendor = ref(null)

const confirmMessage = computed(() => {
  if (!pendingChange.value) {
    return ''
  }

  const { vendor, stage } = pendingChange.value
  return `Change ${vendor.name} from ${vendor.stage} to ${stage}?`
})

function onStageChange(vendor, stage) {
  if (stage === vendor.stage) {
    return
  }

  pendingChange.value = { vendor, stage }
}

function onConfirm() {
  const change = pendingChange.value
  pendingChange.value = null

  if (!change) {
    return
  }

  emit('stage-change', { id: change.vendor.id, stage: change.stage })
}

function onCancel() {
  pendingChange.value = null
}

function openHistory(vendor) {
  historyVendor.value = vendor
}
</script>
