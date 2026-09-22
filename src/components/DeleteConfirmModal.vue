<template>
  <AppModal
    :isOpen="isOpen"
    :title="title"
    maxSize="440px"
    @cancel="$emit('cancel')"
  >
    <div class="space-y-3">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
          <PhTrash :size="20" weight="bold" />
        </div>
        <div class="space-y-1">
          <p class="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            {{ message || 'This action cannot be undone.' }}
          </p>
          <p v-if="itemName" class="text-xs text-slate-500 dark:text-slate-400">
            You are about to permanently delete <strong class="text-slate-700 dark:text-slate-300">"{{ itemName }}"</strong>.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn btn-secondary btn-sm"
        :disabled="loading"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="$emit('confirm')"
        class="btn btn-danger btn-sm font-semibold flex items-center gap-1.5"
        :disabled="loading"
      >
        <span v-if="loading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <PhTrash v-else :size="14" weight="bold" />
        <span>{{ loading ? 'Deleting...' : (confirmText || 'Delete') }}</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { PhTrash } from '@phosphor-icons/vue';
import AppModal from '@/components/AppModal.vue';

defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: 'Confirm Deletion' },
  message: { type: String, default: 'This action cannot be undone.' },
  itemName: { type: String, default: '' },
  confirmText: { type: String, default: 'Delete' },
  loading: { type: Boolean, default: false },
});

defineEmits(['cancel', 'confirm']);
</script>

