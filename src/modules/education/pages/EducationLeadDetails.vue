<template>
  <div class="space-y-4 max-w-4xl mx-auto pb-12">
    <div class="flex items-center justify-between">
      <router-link
        to="/app/leads"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
      >
        <span>← Back to Student Leads</span>
      </router-link>
    </div>

    <div v-if="loading" class="py-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Loading student lead details...</span>
    </div>

    <div v-else-if="lead" class="space-y-4">
      <EducationLeadActivityCenter
        :leadId="lead._id"
        :lead="lead"
        @openEdit="isEditOpen = true"
        @openReminder="isReminderOpen = true"
        @openEnroll="openEnrollModal"
        @leadUpdated="loadLead"
      />
    </div>

    <div v-else class="p-8 text-center bg-surface rounded-xl border border-default text-xs text-slate-500">
      Student lead not found or access denied.
    </div>

    <!-- Edit Student Lead Drawer -->
    <EducationLeadEditDrawer
      :isOpen="isEditOpen"
      :leadId="lead?._id"
      @close="isEditOpen = false"
      @success="handleEditSuccess"
    />

    <!-- Set Follow-up Reminder Modal -->
    <EducationLeadReminderModal
      :isOpen="isReminderOpen"
      :lead="lead"
      @close="isReminderOpen = false"
      @success="handleReminderSuccess"
    />

    <!-- Enroll Drawer / Modal -->
    <AppDrawer
      :isOpen="showEnroll"
      :title="lead ? `Enroll ${lead.firstName} ${lead.lastName || ''}` : 'Enroll Student'"
      subtitle="Select the batch or class to complete enrollment"
      width="440px"
      @close="showEnroll = false"
    >
      <form id="enroll-page-form" class="space-y-4 text-xs" @submit.prevent="confirmEnroll">
        <p
          v-if="enrollError"
          class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200"
        >
          {{ enrollError }}
        </p>
        <label class="space-y-1 text-xs block font-medium text-slate-700 dark:text-slate-300">
          <span>Class *</span>
          <select
            v-model="enrollClassId"
            required
            class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
          >
            <option value="" disabled>Select class to enroll into</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">
              {{ c.name }} ({{ c.code }})
            </option>
          </select>
        </label>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="showEnroll = false"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="enroll-page-form"
          class="btn btn-primary btn-sm"
          :disabled="enrolling"
        >
          {{ enrolling ? "Enrolling..." : "Confirm Enrollment" }}
        </button>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppDrawer from '@/components/AppDrawer.vue';
import EducationLeadActivityCenter from '../components/EducationLeadActivityCenter.vue';
import EducationLeadEditDrawer from '../components/EducationLeadEditDrawer.vue';
import EducationLeadReminderModal from '../components/EducationLeadReminderModal.vue';
import {
  enrollEducationLead,
  fetchEducationLead,
  fetchEducationClasses,
} from '../api/endpoints';

const route = useRoute();
const router = useRouter();

const lead = ref(null);
const loading = ref(true);
const classes = ref([]);

const isEditOpen = ref(false);
const isReminderOpen = ref(false);
const showEnroll = ref(false);
const enrollClassId = ref('');
const enrolling = ref(false);
const enrollError = ref('');

async function loadLead() {
  try {
    const res = await fetchEducationLead(route.params.id);
    lead.value = res.data || res || null;
  } catch (err) {
    console.error('Failed to load lead:', err);
  } finally {
    loading.value = false;
  }
}

async function loadClasses() {
  try {
    const res = await fetchEducationClasses({ limit: 100 });
    classes.value = res.data || [];
  } catch {
    classes.value = [];
  }
}

onMounted(async () => {
  await Promise.all([loadLead(), loadClasses()]);
});

function handleEditSuccess() {
  isEditOpen.value = false;
  loadLead();
}

function handleReminderSuccess() {
  isReminderOpen.value = false;
  loadLead();
}

function openEnrollModal() {
  enrollClassId.value = lead.value?.classInterestId?._id || lead.value?.classInterestId || '';
  enrollError.value = '';
  showEnroll.value = true;
}

async function confirmEnroll() {
  if (!lead.value || !enrollClassId.value) return;
  enrolling.value = true;
  enrollError.value = '';
  try {
    await enrollEducationLead(lead.value._id, {
      classId: enrollClassId.value,
    });
    showEnroll.value = false;
    router.push('/app/students');
  } catch (err) {
    enrollError.value = err.data?.message || err.message || 'Unable to enroll.';
  } finally {
    enrolling.value = false;
  }
}
</script>
