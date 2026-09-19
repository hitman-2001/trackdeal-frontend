<template>
  <AppModal
    :isOpen="isOpen"
    title="Bulk Reassign Tasks"
    maxSize="480px"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-4 text-xs">
      <div
        class="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 text-indigo-800 dark:text-indigo-400"
      >
        <p class="text-[10px] leading-relaxed">
          Select the agent you wish to allocate the
          <b>{{ taskIds.length }} selected tasks</b> to. This will update the
          assigned agent across all selected items.
        </p>
      </div>

      <!-- Agent Selector -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1"
          >Target CRM Agent *</label
        >
        <select
          v-model="assignedTo"
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.8 outline-none focus:border-primary text-slate-800"
        >
          <option value="">Select Agent</option>
          <option
            v-for="agent in agents"
            :key="agent._id || agent.id"
            :value="agent._id || agent.id"
          >
            {{ agent.firstName }} {{ agent.lastName || "" }} ({{ agent.email }})
          </option>
        </select>
      </div>
    </div>

    <template #footer>
      <button @click="$emit('close')" class="btn-md btn-secondary">
        Cancel
      </button>
      <button
        @click="handleConfirm"
        :disabled="isPending || !assignedTo"
        class="btn-md btn-primary min-w-[90px]"
      >
        <span v-if="isPending">Reassigning...</span>
        <span v-else>Assign Tasks</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import apiClient from "@/api/client";
import AppModal from "@/components/AppModal.vue";
import { useBulkAssignTasksMutation } from "../queries";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  taskIds: { type: Array, required: true },
});

const emit = defineEmits(["close", "success"]);

const store = useStore();
const currentUser = computed(() => store.state.auth.user || {});
const assignedTo = ref("");
const agents = ref([]);

const fetchAgents = async () => {
  const hasUsersPerm =
    store.getters["permissions/hasCapability"]("users:read") ||
    store.getters["permissions/hasCapability"]("users.read");
  if (!hasUsersPerm) {
    agents.value = [currentUser.value];
    return;
  }
  try {
    const response = await apiClient.get("/users");
    agents.value = response.data?.data || [];
  } catch (error) {
    console.error("Failed to load agents list:", error);
  }
};

onMounted(fetchAgents);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      assignedTo.value = "";
    }
  },
);

const { mutateAsync: bulkAssign, isPending } = useBulkAssignTasksMutation();

const handleConfirm = async () => {
  if (props.taskIds.length === 0 || !assignedTo.value) return;

  try {
    await bulkAssign({
      taskIds: props.taskIds,
      assignedTo: assignedTo.value,
    });

    store.dispatch("notifications/triggerToast", {
      message: `${props.taskIds.length} tasks successfully reassigned.`,
      type: "success",
    });

    emit("success");
    emit("close");
  } catch (error) {
    store.dispatch("notifications/triggerToast", {
      message: error.response?.data?.message || "Failed to bulk-assign tasks.",
      type: "error",
    });
  }
};
</script>
