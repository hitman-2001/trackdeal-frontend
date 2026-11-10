<template>
  <AppDrawer 
    :isOpen="isOpen" 
    :title="`Reserve Property Hold — ${unitTitle}`" 
    width="500px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Unit Summary -->
      <div class="bg-slate-50/50 dark:bg-slate-900 border border-default rounded-xl p-3 space-y-1">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Property</span>
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">
          {{ unitTitle }}
        </h4>
        <div class="text-[10px] text-slate-550 flex justify-between pt-1">
          <span>Config: <b>{{ unitConfig }}</b></span>
          <span>Base Value: <b class="text-primary">{{ formatCurrency(unitPrice) }}</b></span>
        </div>
      </div>

      <!-- Select Lead -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Lead Client *</label>
        <select 
          v-model="leadId" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.leadId ? 'border-red-500' : 'border-default'"
        >
          <option value="">Search lead name or mobile...</option>
          <option v-for="lead in leads" :key="lead._id || lead.id" :value="lead._id || lead.id">
            {{ lead.firstName }} {{ lead.lastName || '' }} ({{ lead.mobile }})
          </option>
        </select>
        <span v-if="errors.leadId" class="text-[9px] text-red-500 mt-1 block">{{ errors.leadId }}</span>
      </div>

      <!-- Expiry Duration -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reservation Expiry Duration *</label>
        <div class="flex items-center gap-4 py-1.5 text-[11px]">
          <label class="flex items-center space-x-1.5 cursor-pointer">
            <input type="radio" value="48" v-model="durationMode" />
            <span>48 Hours</span>
          </label>
          <label class="flex items-center space-x-1.5 cursor-pointer">
            <input type="radio" value="72" v-model="durationMode" />
            <span>72 Hours</span>
          </label>
          <label class="flex items-center space-x-1.5 cursor-pointer">
            <input type="radio" value="custom" v-model="durationMode" />
            <span>Custom Date</span>
          </label>
        </div>

        <input 
          v-if="durationMode === 'custom'"
          v-model="customExpiry" 
          type="datetime-local" 
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 mt-2 outline-none focus:border-primary"
        />
        <span class="text-[9px] text-slate-400 block mt-1.5">
          Calculated Expiry: <b>{{ calculatedExpiryStr }}</b>
        </span>
      </div>

      <!-- Token Payment Received -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Token Payment Received (Min ₹50,000) *</label>
        <input 
          v-model.number="tokenPaid" 
          type="number" 
          placeholder="e.g. 100000"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.tokenPaid ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.tokenPaid" class="text-[9px] text-red-500 mt-1 block">{{ errors.tokenPaid }}</span>
      </div>

      <!-- Payment Method -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Method *</label>
        <select 
          v-model="paymentMethod" 
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
        >
          <option value="card">Credit Card / Debit Card</option>
          <option value="netbanking">Net Banking</option>
          <option value="upi">UPI Link</option>
          <option value="cheque">Cheque</option>
          <option value="cash">Cash deposit</option>
        </select>
      </div>

      <!-- Upload hold token receipt -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Hold Token Receipt</label>
        <input 
          type="file" 
          accept=".pdf,.jpg,.jpeg,.png"
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        <span class="text-[8px] text-slate-400 mt-1 block">Supports PDF, JPG, PNG up to 10MB</span>
      </div>

      <!-- Justification Note -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hold Justification Note *</label>
        <textarea 
          v-model="justification" 
          rows="2"
          placeholder="Reason for reservation lock..."
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
          :class="errors.justification ? 'border-red-500' : 'border-default'"
        ></textarea>
        <span v-if="errors.justification" class="text-[9px] text-red-500 mt-1 block">{{ errors.justification }}</span>
      </div>
    </form>

    <template #footer>
      <button 
        @click="$emit('close')" 
        class="btn-md btn-secondary"
      >
        Cancel
      </button>
      <button 
        @click="onSubmit"
        :disabled="isPending"
        class="btn-md btn-primary"
      >
        Approve Hold
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@/utils/toTypedSchema';
import * as zod from 'zod';
import apiClient from '@/api/client';
import AppDrawer from '@/components/AppDrawer.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  property: { type: Object, default: null } // independent property or unit
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const unitTitle = computed(() => props.property?.title || props.property?.unitNumber || 'Unit Item');
const unitConfig = computed(() => props.property?.configuration || props.property?.bhk ? `${props.property.bhk} BHK` : 'Apartment');
const unitPrice = computed(() => props.property?.price || 0);

const durationMode = ref('48');
const customExpiry = ref('');
const paymentMethod = ref('card');
const leads = ref([]);
const isPending = ref(false);

const schema = toTypedSchema(
  zod.object({
    leadId: zod.string().min(1, 'Lead client selection is required'),
    tokenPaid: zod.number().min(50000, 'Min ₹50,000 token is required for hold locks'),
    justification: zod.string().min(5, 'Hold justification is required to log locks')
  })
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    leadId: '',
    tokenPaid: 50000,
    justification: ''
  }
});

const { value: leadId } = useField('leadId');
const { value: tokenPaid } = useField('tokenPaid');
const { value: justification } = useField('justification');

const calculatedExpiryStr = computed(() => {
  let exp = new Date();
  if (durationMode.value === '48') {
    exp.setHours(exp.getHours() + 48);
  } else if (durationMode.value === '72') {
    exp.setHours(exp.getHours() + 72);
  } else if (durationMode.value === 'custom' && customExpiry.value) {
    exp = new Date(customExpiry.value);
  }
  return exp.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const loadLeads = async () => {
  try {
    const res = await apiClient.get('/leads');
    leads.value = res.data?.data || [];
  } catch (error) {
    console.error('Failed to load leads list for reservation:', error);
  }
};

onMounted(loadLeads);

const onSubmit = handleSubmit(async (values) => {
  isPending.value = true;
  
  let expiryDate = new Date();
  if (durationMode.value === '48') {
    expiryDate.setHours(expiryDate.getHours() + 48);
  } else if (durationMode.value === '72') {
    expiryDate.setHours(expiryDate.getHours() + 72);
  } else if (durationMode.value === 'custom' && customExpiry.value) {
    expiryDate = new Date(customExpiry.value);
  }

  const propId = props.property._id || props.property.id;
  const isUnit = !!props.property.unitNumber;

  try {
    if (isUnit) {
      // It's a developer unit
      await apiClient.post(`/projects/units/${propId}/reserve`, {
        leadId: values.leadId,
        tokenPaid: values.tokenPaid,
        paymentMethod: paymentMethod.value,
        holdDuration: parseInt(durationMode.value, 10) || 48
      });
    } else {
      // It's an independent property listing
      await apiClient.post(`/properties/${propId}/reserved`, {
        leadId: values.leadId,
        tokenPaid: values.tokenPaid,
        expiry: expiryDate.toISOString(),
        notes: values.justification
      });
    }

    store.dispatch('notifications/triggerToast', {
      message: 'Property hold successfully approved and locked.',
      type: 'success'
    });

    resetForm();
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to place reservation lock.',
      type: 'error'
    });
  } finally {
    isPending.value = false;
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
