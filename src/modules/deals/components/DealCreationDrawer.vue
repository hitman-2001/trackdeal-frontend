<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Create Manual Deal File" 
    width="500px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Title -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deal Title *</label>
        <input 
          v-model="title" 
          type="text" 
          placeholder="e.g. John Doe - Skyway 802 Purchase"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.title ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.title" class="text-[9px] text-red-500 mt-1 block">{{ errors.title }}</span>
      </div>

      <!-- Lead Selector -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Buyer Lead *</label>
        <select 
          v-model="leadId" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.leadId ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Lead</option>
          <option v-for="lead in leads" :key="lead._id" :value="lead._id">
            {{ lead.firstName }} {{ lead.lastName || '' }} ({{ lead.mobile }})
          </option>
        </select>
        <span v-if="errors.leadId" class="text-[9px] text-red-500 mt-1 block">{{ errors.leadId }}</span>
      </div>

      <!-- Property Selector -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Unit Listing *</label>
        <select 
          v-model="propertyId" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.propertyId ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Available Property</option>
          <option v-for="prop in availableProperties" :key="prop._id" :value="prop._id">
            {{ prop.title }} ({{ formatCurrency(prop.price) }})
          </option>
        </select>
        <span v-if="errors.propertyId" class="text-[9px] text-red-500 mt-1 block">{{ errors.propertyId }}</span>
      </div>

      <!-- Price details -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contract Base Price *</label>
          <input 
            v-model.number="basePrice" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.basePrice ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.basePrice" class="text-[9px] text-red-500 mt-1 block">{{ errors.basePrice }}</span>
        </div>
        
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Commission (%) *</label>
          <input 
            v-model.number="commissionPercent" 
            type="number" 
            step="0.1"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.commissionPercent ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.commissionPercent" class="text-[9px] text-red-500 mt-1 block">{{ errors.commissionPercent }}</span>
        </div>
      </div>

      <!-- Close Date & Assignee -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Est. Close Date *</label>
          <input 
            v-model="closeDate" 
            type="date" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.closeDate ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.closeDate" class="text-[9px] text-red-500 mt-1 block">{{ errors.closeDate }}</span>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Agent *</label>
          <select 
            v-model="agentId" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.agentId ? 'border-red-500' : 'border-default'"
          >
            <option value="">Select Staff</option>
            <option v-for="agent in agents" :key="agent._id" :value="agent._id">
              {{ agent.firstName }} {{ agent.lastName || '' }}
            </option>
          </select>
          <span v-if="errors.agentId" class="text-[9px] text-red-500 mt-1 block">{{ errors.agentId }}</span>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Initial Transaction Notes</label>
        <textarea 
          v-model="notes" 
          rows="3"
          placeholder="Brief summary of transaction goals..."
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
        ></textarea>
      </div>
    </form>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="px-4 py-2 border border-default rounded-lg hover:bg-slate-50 font-semibold"
      >
        Cancel
      </button>
      <button 
        @click="onSubmit"
        :disabled="isPending"
        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-95 font-semibold"
      >
        Create Deal
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@/utils/toTypedSchema';
import * as zod from 'zod';
import apiClient from '@/api/client';
import AppDrawer from '@/components/AppDrawer.vue';
import { useCreateDealMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const schema = toTypedSchema(
  zod.object({
    title: zod.string().min(2, 'Deal Title must contain at least 2 characters').max(150),
    leadId: zod.string().min(1, 'Lead selection is required'),
    propertyId: zod.string().min(1, 'Property selection is required'),
    basePrice: zod.number().min(10000, 'Price must be realistic'),
    commissionPercent: zod.number().min(0.1, 'Commission percentage must be at least 0.1%').max(10),
    closeDate: zod.string().min(1, 'Estimated close date is required'),
    agentId: zod.string().min(1, 'Agent allocation is required')
  })
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    leadId: '',
    propertyId: '',
    basePrice: 0,
    commissionPercent: 2.0,
    closeDate: '',
    agentId: ''
  }
});

const { value: title } = useField('title');
const { value: leadId } = useField('leadId');
const { value: propertyId } = useField('propertyId');
const { value: basePrice } = useField('basePrice');
const { value: commissionPercent } = useField('commissionPercent');
const { value: closeDate } = useField('closeDate');
const { value: agentId } = useField('agentId');

const notes = ref('');
const leads = ref([]);
const availableProperties = ref([]);
const agents = ref([]);

const loadContextData = async () => {
  try {
    const [leadsRes, propsRes, usersRes] = await Promise.all([
      apiClient.get('/leads'),
      apiClient.get('/properties'),
      apiClient.get('/users')
    ]);
    leads.value = leadsRes.data?.data || [];
    availableProperties.value = propsRes.data?.data?.filter(p => p.status === 'available') || [];
    agents.value = usersRes.data?.data || [];
  } catch (error) {
    console.error('Failed to load manual deal context data:', error);
  }
};

onMounted(loadContextData);

const { mutateAsync: createDeal, isPending } = useCreateDealMutation();

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    customer: values.leadId,
    assignedTo: values.agentId,
    sourcingAgent: values.agentId,
    broker: values.agentId,
    property: values.propertyId,
    askingPrice: values.basePrice,
    dealValue: values.basePrice,
    commissionPercentage: values.commissionPercent,
    commissionAmount: values.basePrice * (values.commissionPercent / 100),
    status: 'draft',
    notes: notes.value || undefined
  };

  try {
    await createDeal(payload);
    
    // Also lock property status to reserved via API sync
    await apiClient.post(`/properties/${values.propertyId}/reserved`, {
      leadId: values.leadId,
      tokenPaid: 0,
      notes: 'Manually created Deal file'
    }).catch(err => console.warn('Properties status sync skipped', err));

    store.dispatch('notifications/triggerToast', {
      message: 'Deal file created and registered successfully.',
      type: 'success'
    });

    resetForm();
    notes.value = '';
    
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to create deal file.',
      type: 'error'
    });
  }
});

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
