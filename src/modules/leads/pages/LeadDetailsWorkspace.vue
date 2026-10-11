<template>
  <div v-if="checking" class="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
    <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    <span>Loading lead workspace...</span>
  </div>
  <EducationLeadDetails v-else-if="isEducation || isEducationLead" />
  <LeadDetails v-else />
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import LeadDetails from './LeadDetails.vue';
import EducationLeadDetails from '@/modules/education/pages/EducationLeadDetails.vue';
import apiClient from '@/api/client';

const store = useStore();
const route = useRoute();

const isEducation = computed(() => store.getters['organization/isEducationTenant']);
const isEducationLead = ref(false);
const checking = ref(false);

onMounted(async () => {
  if (isEducation.value) return;
  const leadId = route.params.id;
  if (!leadId) return;
  try {
    checking.value = true;
    const res = await apiClient.get(`/leads/${leadId}`);
    const doc = res.data?.data || res.data;
    if (doc && (doc.tenantVertical === 'education' || doc.classInterestId || doc.studentId || doc.parentName)) {
      isEducationLead.value = true;
    }
  } catch (e) {
    // fallback
  } finally {
    checking.value = false;
  }
});
</script>
