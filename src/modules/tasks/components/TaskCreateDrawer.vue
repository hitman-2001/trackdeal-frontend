<template>
  <AppDrawer
    :isOpen="isOpen"
    title="Schedule New Task Action"
    width="500px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Title -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1"
          >Task Title *</label
        >
        <input
          v-model="title"
          type="text"
          placeholder="e.g. Call client for booking token confirmation"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.title ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.title" class="text-[9px] text-red-500 mt-1 block">{{
          errors.title
        }}</span>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1"
          >Task Description Notes</label
        >
        <textarea
          v-model="description"
          rows="3"
          placeholder="Detailed parameters or instructions for the agent..."
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
        ></textarea>
      </div>

      <!-- Type & Priority -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            class="block text-[10px] font-bold text-slate-500 uppercase mb-1"
            >Action Type *</label
          >
          <select
            v-model="type"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.type ? 'border-red-500' : 'border-default'"
          >
            <option value="call">Phone Call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email Outreach</option>
            <option value="site_visit">Site Visit</option>
            <option value="meeting">Meeting</option>
            <option value="document">Document Review</option>
            <option value="payment">Payout/Payment</option>
            <option value="general">General Task</option>
          </select>
          <span v-if="errors.type" class="text-[9px] text-red-500 mt-1 block">{{
            errors.type
          }}</span>
        </div>
        <div>
          <label
            class="block text-[10px] font-bold text-slate-500 uppercase mb-1"
            >Priority Level *</label
          >
          <select
            v-model="priority"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.priority ? 'border-red-500' : 'border-default'"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <span
            v-if="errors.priority"
            class="text-[9px] text-red-500 mt-1 block"
            >{{ errors.priority }}</span
          >
        </div>
      </div>

      <!-- Due Date & Assigned Agent -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            class="block text-[10px] font-bold text-slate-500 uppercase mb-1"
            >Due Date & Time *</label
          >
          <input
            v-model="dueDate"
            type="datetime-local"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.dueDate ? 'border-red-500' : 'border-default'"
          />
          <span
            v-if="errors.dueDate"
            class="text-[9px] text-red-500 mt-1 block"
            >{{ errors.dueDate }}</span
          >
        </div>
        <div>
          <label
            class="block text-[10px] font-bold text-slate-500 uppercase mb-1"
            >Assign To Agent *</label
          >
          <select
            v-model="assignedTo"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.assignedTo ? 'border-red-500' : 'border-default'"
          >
            <option value="">Select Staff</option>
            <option
              v-for="agent in agents"
              :key="agent._id || agent.id"
              :value="agent._id || agent.id"
            >
              {{ agent.firstName }} {{ agent.lastName || "" }}
            </option>
          </select>
          <span
            v-if="errors.assignedTo"
            class="text-[9px] text-red-500 mt-1 block"
            >{{ errors.assignedTo }}</span
          >
        </div>
      </div>

      <!-- Associated Context Relationships -->
      <div class="border-t border-default pt-3 space-y-3">
        <h4
          class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-default pb-1"
        >
          Link to CRM Records
        </h4>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label
              class="block text-[10px] font-bold text-slate-500 uppercase mb-1"
              >Lead Client</label
            >
            <select
              v-model="leadId"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            >
              <option value="">None</option>
              <option
                v-for="lead in leads"
                :key="lead._id || lead.id"
                :value="lead._id || lead.id"
              >
                {{ lead.firstName }} {{ lead.lastName || "" }} ({{
                  lead.mobile
                }})
              </option>
            </select>
          </div>
          <div>
            <label
              class="block text-[10px] font-bold text-slate-500 uppercase mb-1"
              >Deal opportunity</label
            >
            <select
              v-model="dealId"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            >
              <option value="">None</option>
              <option
                v-for="deal in deals"
                :key="deal._id || deal.id"
                :value="deal._id || deal.id"
              >
                {{ deal.title }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button @click="$emit('close')" class="btn-md btn-secondary">
        Cancel
      </button>
      <button
        @click="onSubmit"
        :disabled="isPending"
        class="btn-md btn-primary min-w-[90px]"
      >
        <span v-if="isPending">Saving...</span>
        <span v-else>Save Task</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import apiClient from "@/api/client";
import AppDrawer from "@/components/AppDrawer.vue";
import { useCreateTaskMutation } from "../queries";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
});

const emit = defineEmits(["close", "success"]);

const store = useStore();
const currentUser = computed(() => store.state.auth.user || {});

const schema = toTypedSchema(
  zod.object({
    title: zod
      .string()
      .min(2, "Title must contain at least 2 characters")
      .max(150),
    type: zod.string().min(1, "Task type is required"),
    priority: zod.string().min(1, "Priority is required"),
    dueDate: zod.string().min(1, "Due date is required"),
    assignedTo: zod
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid agent selection"),
  }),
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    title: "",
    type: "call",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
  },
});

const { value: title } = useField("title");
const { value: type } = useField("type");
const { value: priority } = useField("priority");
const { value: dueDate } = useField("dueDate");
const { value: assignedTo } = useField("assignedTo");
const description = ref("");
const leadId = ref("");
const dealId = ref("");

const agents = ref([]);
const leads = ref([]);
const deals = ref([]);

const loadContextData = async () => {
  try {
    const hasUsersPerm =
      store.getters["permissions/hasCapability"]("users:read") ||
      store.getters["permissions/hasCapability"]("users.read");
    const usersPromise = hasUsersPerm
      ? apiClient.get("/users")
      : Promise.resolve({ data: { data: [currentUser.value] } });

    const [usersRes, leadsRes, dealsRes] = await Promise.all([
      usersPromise,
      apiClient.get("/leads"),
      apiClient.get("/deals").catch(() => ({ data: { data: [] } })),
    ]);
    agents.value = usersRes.data?.data || [];
    leads.value = leadsRes.data?.data || [];
    deals.value = dealsRes.data?.data || [];
  } catch (error) {
    console.error("Failed to load tasks context lists:", error);
  }
};

onMounted(loadContextData);

const { mutateAsync: createTask, isPending } = useCreateTaskMutation();

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    ...values,
    description: description.value || undefined,
    leadId: leadId.value || undefined,
    dealId: dealId.value || undefined,
    // Convert local time to ISO string
    dueDate: new Date(values.dueDate).toISOString(),
  };

  try {
    await createTask(payload);
    store.dispatch("notifications/triggerToast", {
      message: "Task scheduled successfully.",
      type: "success",
    });
    // Clear/Reset form
    resetForm();
    description.value = "";
    leadId.value = "";
    dealId.value = "";

    emit("success");
    emit("close");
  } catch (error) {
    store.dispatch("notifications/triggerToast", {
      message: error.response?.data?.message || "Failed to schedule task.",
      type: "error",
    });
  }
});
</script>
