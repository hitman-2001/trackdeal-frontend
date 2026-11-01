<template>
  <div class="min-w-0 space-y-2">
    <AppMultiSelect :id="id" label="School / College" :model-value="modelValue" :options="options" :loading="loading" searchable placeholder="All schools / colleges" @update:model-value="$emit('update:modelValue', $event)" />
    <button v-if="error" type="button" class="text-xs text-primary hover:underline" @click="$emit('retry')">Unable to load schools. Retry</button>
    <p v-else-if="!loading && !options.length" class="text-xs text-slate-500">No school names found in saved records yet.</p>
  </div>
</template>

<script setup>
import AppMultiSelect from '@/components/AppMultiSelect.vue';
defineProps({
  id: { type: String, required: true },
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
});
defineEmits(['update:modelValue', 'retry']);
</script>
