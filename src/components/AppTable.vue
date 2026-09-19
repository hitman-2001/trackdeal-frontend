<template>
  <div class="app-table-shell">
    <div class="app-table-scroll">
      <table class="app-data-table">
        <thead class="sticky top-0 z-10">
          <tr>
            <th v-if="selectable" class="app-data-table__select-cell">
              <input ref="selectAllCheckbox" type="checkbox" :checked="allSelected" class="app-checkbox" aria-label="Select all rows on this page" @change="toggleSelectAll" />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="select-none"
              :class="[col.sortable ? 'cursor-pointer' : '', col.align === 'right' ? 'text-right' : 'text-left']"
              :tabindex="col.sortable ? 0 : undefined"
              :role="col.sortable ? 'button' : undefined"
              :aria-sort="col.sortable ? ariaSort(col) : undefined"
              @click="col.sortable && handleHeaderClick(col)"
              @keydown.enter="col.sortable && handleHeaderClick(col)"
              @keydown.space.prevent="col.sortable && handleHeaderClick(col)"
            >
              <div class="flex items-center gap-1.5" :class="col.align === 'right' ? 'justify-end' : ''">
                <span>{{ col.label }}</span>
                <template v-if="col.sortable">
                  <PhArrowUp v-if="sorting?.field === col.key && sorting?.direction === 'asc'" :size="12" weight="bold" class="app-data-table__sort-active" />
                  <PhArrowDown v-else-if="sorting?.field === col.key && sorting?.direction === 'desc'" :size="12" weight="bold" class="app-data-table__sort-active" />
                  <PhArrowsDownUp v-else :size="12" class="app-data-table__sort" />
                </template>
              </div>
            </th>
            <th
              v-if="$slots.rowActions"
              class="app-data-table__actions-cell text-right select-none"
            >
              {{ rowActionsLabel }}
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-if="isLoading">
            <tr v-for="i in skeletonRows" :key="`sk-${i}`">
              <td v-if="selectable" class="app-data-table__select-cell"><div class="skeleton w-4 h-4 rounded mx-auto" /></td>
              <td v-for="col in columns" :key="col.key"><div class="skeleton h-3.5 rounded" :style="{ width: `${50 + (i * 13) % 40}%` }" /></td>
              <td v-if="$slots.rowActions" class="app-data-table__actions-cell"><div class="skeleton h-3.5 w-12 rounded ml-auto" /></td>
            </tr>
          </template>

          <template v-else-if="rows.length === 0">
            <tr>
              <td :colspan="tableColSpan" class="text-center py-16">
                <div class="flex flex-col items-center gap-3">
                  <span class="flex h-12 w-12 items-center justify-center rounded-xl" style="background: hsl(var(--neutral-50)); color: hsl(var(--neutral-300));"><PhEmpty :size="24" /></span>
                  <div>
                    <p class="text-body font-semibold" style="color: hsl(var(--neutral-700));">{{ emptyTitle }}</p>
                    <p v-if="emptySubtext" class="text-body-sm mt-1" style="color: hsl(var(--neutral-400));">{{ emptySubtext }}</p>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <template v-else>
            <tr
              v-for="(row, idx) in visibleRows"
              :key="getRowKey(row) || idx"
              class="group relative cursor-pointer"
              :class="{ 'is-selected': isSelected(row) }"
              tabindex="0"
              @click="$emit('rowClick', row)"
              @keydown.enter="$emit('rowClick', row)"
              @keydown.space.prevent="$emit('rowClick', row)"
            >
              <td v-if="selectable" class="app-data-table__select-cell" @click.stop>
                <input type="checkbox" :checked="isSelected(row)" class="app-checkbox" :aria-label="`Select ${getRowLabel(row)}`" @change="toggleSelectRow(row)" />
              </td>
              <td v-for="col in columns" :key="col.key" class="whitespace-nowrap text-body" :class="col.align === 'right' ? 'text-right' : 'text-left'">
                <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]">
                  <span v-if="row[col.key] !== null && row[col.key] !== undefined">{{ row[col.key] }}</span>
                  <span v-else style="color: hsl(var(--neutral-300));">—</span>
                </slot>
              </td>
              <td v-if="$slots.rowActions" class="app-data-table__actions-cell" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <slot name="rowActions" :row="row" />
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <AppPagination
      v-if="showPagination && paginationTotal > 0"
      :page="currentPage"
      :page-size="currentPageSize"
      :total="paginationTotal"
      :total-pages="paginationPages"
      :page-size-options="pageSizeOptions"
      :show-page-size="showPageSize"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, useSlots, watch } from 'vue';
import { PhArrowUp, PhArrowDown, PhArrowsDownUp, PhEmpty } from '@phosphor-icons/vue';
import AppPagination from './AppPagination.vue';

const props = defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  selectable: { type: Boolean, default: false },
  selectedRows: { type: Array, default: () => [] },
  sorting: { type: Object, default: () => ({ field: '', direction: '' }) },
  isLoading: { type: Boolean, default: false },
  skeletonRows: { type: Number, default: 6 },
  emptyTitle: { type: String, default: 'No results found' },
  emptySubtext: { type: String, default: '' },
  rowKey: { type: String, default: '_id' },
  pagination: { type: Object, default: null },
  paginate: { type: Boolean, default: true },
  pageSize: { type: Number, default: 20 },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50] },
  showPageSize: { type: Boolean, default: true },
  rowActionsLabel: { type: String, default: 'Actions' },
});

const emit = defineEmits(['sort', 'selectionChange', 'rowClick', 'pageChange', 'pageSizeChange']);
const slots = useSlots();
const hasRowActions = computed(() => Boolean(slots.rowActions));
const internalPage = ref(1);
const internalPageSize = ref(props.pageSize);
const selectAllCheckbox = ref(null);
const isServerPaginated = computed(() => Boolean(props.pagination));
const currentPage = computed(() => Number(props.pagination?.page || internalPage.value));
const currentPageSize = computed(() => Number(props.pagination?.limit || props.pagination?.pageSize || internalPageSize.value));
const paginationTotal = computed(() => Number(props.pagination?.total ?? props.rows.length));
const paginationPages = computed(() => Number(props.pagination?.totalPages || props.pagination?.pages || Math.max(Math.ceil(paginationTotal.value / currentPageSize.value), 1)));
const showPagination = computed(() => props.paginate && (paginationPages.value > 1 || paginationTotal.value > 0));
const tableColSpan = computed(
  () => props.columns.length + (props.selectable ? 1 : 0) + (hasRowActions.value ? 1 : 0),
);
const visibleRows = computed(() => {
  if (!props.paginate || isServerPaginated.value) return props.rows;
  const start = (internalPage.value - 1) * internalPageSize.value;
  return props.rows.slice(start, start + internalPageSize.value);
});

const getRowKey = row => row?.[props.rowKey] ?? row?._id ?? row?.id;
const getRowLabel = row => row?.name || [row?.firstName, row?.lastName].filter(Boolean).join(' ') || 'row';
const isSelected = row => props.selectedRows.some(selected => getRowKey(selected) === getRowKey(row));
const allSelected = computed(() => visibleRows.value.length > 0 && visibleRows.value.every(isSelected));
const someSelected = computed(() => visibleRows.value.some(isSelected) && !allSelected.value);

const toggleSelectRow = (row) => {
  const updated = isSelected(row) ? props.selectedRows.filter(selected => getRowKey(selected) !== getRowKey(row)) : [...props.selectedRows, row];
  emit('selectionChange', updated);
};
const toggleSelectAll = (event) => {
  const visibleKeys = new Set(visibleRows.value.map(getRowKey));
  const rowsOutsidePage = props.selectedRows.filter(row => !visibleKeys.has(getRowKey(row)));
  emit('selectionChange', event.target.checked ? [...rowsOutsidePage, ...visibleRows.value] : rowsOutsidePage);
};
const handleHeaderClick = (col) => {
  const direction = props.sorting.field === col.key && props.sorting.direction === 'asc' ? 'desc' : 'asc';
  emit('sort', { field: col.key, direction });
};
const ariaSort = col => props.sorting.field === col.key ? (props.sorting.direction === 'asc' ? 'ascending' : 'descending') : 'none';
const handlePageChange = (page) => {
  if (!isServerPaginated.value) internalPage.value = page;
  emit('pageChange', page);
};
const handlePageSizeChange = (pageSize) => {
  if (!isServerPaginated.value) {
    internalPageSize.value = pageSize;
    internalPage.value = 1;
  }
  emit('pageSizeChange', pageSize);
};

watch(someSelected, async (value) => {
  await nextTick();
  if (selectAllCheckbox.value) selectAllCheckbox.value.indeterminate = value;
}, { immediate: true });
watch(() => props.rows.length, () => {
  if (!isServerPaginated.value && internalPage.value > paginationPages.value) internalPage.value = paginationPages.value;
});
</script>
