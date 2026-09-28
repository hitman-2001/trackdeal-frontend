<template>
  <figure class="pipeline-chart" :aria-label="label">
    <div class="chart-scroll-wrap">
      <div class="chart-bars">
        <div
          v-for="(item, index) in items"
          :key="item.label"
          class="chart-column"
        >
          <div class="bar-track">
            <div
              class="chart-bar"
              :style="{
                height: `${(Math.max(0, item.value) / maximum) * 100}%`,
                opacity: 1 - index * 0.07,
              }"
            ></div>
          </div>
          <span class="chart-value">{{ item.value }}</span>
          <span class="chart-label" :title="item.label">{{ item.label }}</span>
        </div>
      </div>
    </div>
    <figcaption class="sr-only">
      {{ items.map((item) => `${item.label}: ${item.value}`).join(", ") }}
    </figcaption>
  </figure>
</template>

<script setup>
import { computed } from "vue";
// Bklit-inspired chart treatment, implemented natively in Vue with a zero baseline.
const props = defineProps({
  items: { type: Array, required: true },
  label: { type: String, default: "Pipeline distribution" },
});
const maximum = computed(() =>
  Math.max(1, ...props.items.map((item) => item.value)),
);
</script>

<style scoped>
.pipeline-chart {
  margin: 0;
  width: 100%;
}
.chart-scroll-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 2px;
}
.chart-scroll-wrap::-webkit-scrollbar {
  display: none;
}
.chart-bars {
  display: flex;
  gap: clamp(8px, 2vw, 22px);
  align-items: flex-end;
  min-width: 100%;
}
@media (max-width: 640px) {
  .chart-bars {
    min-width: 380px;
    gap: 8px;
  }
}
.chart-column {
  flex: 1 1 0;
  min-width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.bar-track {
  height: 108px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid currentColor;
  border-color: #80988e40;
}
.chart-bar {
  width: 100%;
  border-radius: 5px 5px 0 0;
  background: currentColor;
  transition: height 350ms ease;
}
.chart-value {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.chart-label {
  font-size: 10px;
  opacity: 0.85;
  text-align: center;
  white-space: nowrap;
  line-height: 1.2;
}
@media (prefers-reduced-motion: reduce) {
  .chart-bar {
    transition: none;
  }
}
</style>
