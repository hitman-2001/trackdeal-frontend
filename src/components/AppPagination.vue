<template>
  <nav v-if="total > 0" class="app-pagination" aria-label="Table pagination">
    <div class="app-pagination__summary">
      <span class="hidden sm:inline">Showing</span>
      <strong>{{ rangeStart }}–{{ rangeEnd }}</strong>
      <span>of</span>
      <strong>{{ total }}</strong>
      <span class="hidden sm:inline">records</span>
    </div>

    <div class="app-pagination__controls">
      <label v-if="showPageSize" class="app-pagination__size">
        <span class="hidden md:inline">Rows</span>
        <select :value="pageSize" aria-label="Rows per page" @change="$emit('pageSizeChange', $event.target.value === 'all' ? 'all' : Number($event.target.value))">
          <option v-for="option in pageSizeOptions" :key="option" :value="option">{{ option === 'all' ? 'All' : option }}</option>
        </select>
      </label>
      <button type="button" class="app-pagination__button" :disabled="page <= 1" aria-label="Previous page" @click="$emit('pageChange', page - 1)">
        <PhCaretLeft :size="16" weight="bold" />
      </button>
      <div class="app-pagination__pages" aria-label="Choose page">
        <template v-for="item in visiblePages" :key="item.key">
          <span v-if="item.ellipsis" class="app-pagination__ellipsis">…</span>
          <button v-else type="button" class="app-pagination__button" :class="{ 'is-active': item.value === page }" :aria-current="item.value === page ? 'page' : undefined" :aria-label="`Page ${item.value}`" @click="$emit('pageChange', item.value)">
            {{ item.value }}
          </button>
        </template>
      </div>
      <button type="button" class="app-pagination__button" :disabled="page >= totalPages" aria-label="Next page" @click="$emit('pageChange', page + 1)">
        <PhCaretRight :size="16" weight="bold" />
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { PhCaretLeft, PhCaretRight } from '@phosphor-icons/vue';

const props = defineProps({
  page: { type: Number, default: 1 },
  pageSize: { type: [Number, String], default: 20 },
  total: { type: Number, default: 0 },
  totalPages: { type: Number, default: 1 },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50] },
  showPageSize: { type: Boolean, default: true },
});
defineEmits(['pageChange', 'pageSizeChange']);

const effectivePageSize = computed(() => props.pageSize === 'all' ? props.total : Number(props.pageSize));
const rangeStart = computed(() => Math.min((props.page - 1) * effectivePageSize.value + 1, props.total));
const rangeEnd = computed(() => Math.min(props.page * effectivePageSize.value, props.total));
const visiblePages = computed(() => {
  const last = Math.max(props.totalPages, 1);
  const pages = [...new Set([1, last, props.page - 1, props.page, props.page + 1])]
    .filter(value => value >= 1 && value <= last)
    .sort((a, b) => a - b);
  const result = [];
  pages.forEach((value, index) => {
    if (index > 0 && value - pages[index - 1] > 1) result.push({ key: `ellipsis-${value}`, ellipsis: true });
    result.push({ key: `page-${value}`, value });
  });
  return result;
});
</script>
