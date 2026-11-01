<template>
  <div class="min-w-0 space-y-2">
    <div class="flex items-center justify-between gap-2">
      <span :id="`${id}-label`" class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ label }}</span>
      <button v-if="modelValue.length" type="button" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline" :aria-label="`Clear ${label}`" @click="$emit('update:modelValue', [])">Clear</button>
    </div>
    <details ref="dropdown" class="group rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900" @keydown.esc.stop.prevent="close(true)">
      <summary class="flex min-h-11 items-center justify-between gap-2 px-3 py-2.5 text-xs cursor-pointer list-none rounded-xl focus-visible:outline-blue-500 [&::-webkit-details-marker]:hidden" :aria-labelledby="`${id}-label ${id}-summary`">
        <span :id="`${id}-summary`" class="min-w-0 truncate text-slate-800 dark:text-slate-100" :title="selectedLabels.join(', ')" aria-live="polite">
          {{ modelValue.length > 1 ? `${modelValue.length} selected` : (selectedLabels[0] || placeholder) }}
        </span>
        <PhCaretDown :size="14" class="shrink-0 text-slate-400 group-open:rotate-180" />
      </summary>
      <div class="border-t border-slate-100 dark:border-neutral-800 p-2 space-y-2" role="group" :aria-labelledby="`${id}-label`">
        <input v-if="searchable" v-model="search" type="search" :aria-label="`Search ${label}`" placeholder="Search options…" class="w-full min-w-0 rounded-lg border border-slate-200 dark:border-neutral-700 bg-transparent px-2.5 py-2 text-xs outline-none focus:border-blue-500" />
        <div class="max-h-48 overflow-y-auto overscroll-contain space-y-1">
          <p v-if="loading" class="p-2 text-xs text-slate-500" role="status">Loading options…</p>
          <template v-else>
            <label v-for="option in filteredOptions" :key="option.value" class="flex items-start gap-2.5 rounded-lg px-2 py-2 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800" :class="modelValue.includes(option.value) ? 'bg-blue-50 dark:bg-blue-950/30' : ''">
              <input type="checkbox" :value="option.value" :checked="modelValue.includes(option.value)" class="mt-0.5 shrink-0 rounded text-blue-600 focus:ring-blue-500" @change="toggle(option.value, $event.target.checked)" />
              <span class="min-w-0 whitespace-normal [overflow-wrap:anywhere] text-slate-800 dark:text-slate-100">{{ option.label }}</span>
            </label>
            <p v-if="!filteredOptions.length" class="p-2 text-xs text-slate-500">No matching options.</p>
          </template>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { PhCaretDown } from '@phosphor-icons/vue';

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'All options' },
  searchable: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);
const dropdown = ref(null);
const search = ref('');
const normalizedOptions = computed(() => props.options.map(option => typeof option === 'object'
  ? { value: String(option.value), label: String(option.label ?? option.value) }
  : { value: String(option), label: String(option) }));
const selectedLabels = computed(() => props.modelValue.map(value => normalizedOptions.value.find(option => option.value === value)?.label || value));
const filteredOptions = computed(() => normalizedOptions.value.filter(option => option.label.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())));
function toggle(value, checked) {
  emit('update:modelValue', checked ? [...new Set([...props.modelValue, value])] : props.modelValue.filter(item => item !== value));
}
function close(returnFocus = false) {
  if (dropdown.value) {
    dropdown.value.open = false;
    if (returnFocus) dropdown.value.querySelector('summary')?.focus();
  }
}
function onOutsideClick(event) {
  if (!dropdown.value?.contains(event.target)) close();
}
onMounted(() => document.addEventListener('click', onOutsideClick));
onUnmounted(() => document.removeEventListener('click', onOutsideClick));
</script>
