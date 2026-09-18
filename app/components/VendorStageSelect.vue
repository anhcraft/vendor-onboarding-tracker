<template>
  <select
    class="stage-select"
    :value="modelValue"
    :disabled="disabled"
    @change="onChange"
  >
    <option
      v-for="stage in PROCESS_STAGES"
      :key="stage"
      :value="stage"
      :disabled="!isStageOptionEnabled(modelValue, stage)"
    >
      {{ stage }}
    </option>
  </select>
</template>

<script setup>
import { PROCESS_STAGES } from '#lib/constants.js'
import { isStageOptionEnabled } from '#lib/process-stage.js'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

function onChange(event) {
  const nextStage = event.target.value
  event.target.value = props.modelValue

  if (nextStage !== props.modelValue) {
    emit('update:modelValue', nextStage)
  }
}
</script>
