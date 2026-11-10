<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Raise Milestone B2B Invoice" 
    width="480px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs font-medium">
      <!-- Invoice Number -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Invoice Reference Number *</label>
        <input 
          v-model="invoiceNumber" 
          type="text" 
          placeholder="e.g. INV-SK-88301"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.invoiceNumber ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.invoiceNumber" class="text-[9px] text-red-500 mt-1 block">{{ errors.invoiceNumber }}</span>
      </div>

      <!-- Milestone stage details -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Billing Milestone Stage *</label>
        <select 
          v-model="milestone" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary font-semibold"
          :class="errors.milestone ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Milestone</option>
          <option value="token_cleared">Token Money Cleared</option>
          <option value="booking_confirmed">Booking Allotment Signed</option>
          <option value="agreement_signed">Sale Agreement Executed</option>
          <option value="registration_done">Government Registration Completed</option>
          <option value="payout_eligible">Final Closure Clear</option>
        </select>
        <span v-if="errors.milestone" class="text-[9px] text-red-500 mt-1 block">{{ errors.milestone }}</span>
      </div>

      <!-- Base Amount -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Invoice Base Amount (INR) *</label>
        <input 
          v-model.number="amount" 
          type="number" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.amount ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.amount" class="text-[9px] text-red-500 mt-1 block">{{ errors.amount }}</span>
      </div>

      <!-- Tax breakdown calculator -->
      <div class="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 p-3 rounded-lg space-y-1.5 text-[10px] font-bold">
        <span class="text-indigo-650 block text-[9px] uppercase tracking-wider">Calculated Billing Splits</span>
        <div class="flex justify-between">
          <span class="text-slate-500">Base Commission Payout:</span>
          <span class="text-slate-800 dark:text-slate-200">{{ formatCurrency(amount || 0) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Add GST (18% standard):</span>
          <span class="text-emerald-600">+ {{ formatCurrency(calculatedGst) }}</span>
        </div>
        <div class="border-t border-dashed border-default pt-1.5 flex justify-between text-indigo-700 dark:text-indigo-400">
          <span>Net Total Billing Amount:</span>
          <span>{{ formatCurrency(netBilling) }}</span>
        </div>
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
        Raise Invoice
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@/utils/toTypedSchema';
import * as zod from 'zod';
import AppDrawer from '@/components/AppDrawer.vue';
import { useCreateInvoiceMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  commissionId: { type: String, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const schema = toTypedSchema(
  zod.object({
    invoiceNumber: zod.string().min(2, 'Invoice number must be specified').max(50),
    milestone: zod.string().min(1, 'Milestone selection is required'),
    amount: zod.number().min(1000, 'Invoice base amount must be at least ₹1,000')
  })
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    invoiceNumber: '',
    milestone: '',
    amount: 0
  }
});

const { value: invoiceNumber } = useField('invoiceNumber');
const { value: milestone } = useField('milestone');
const { value: amount } = useField('amount');

const calculatedGst = computed(() => {
  return (amount.value || 0) * 0.18;
});

const netBilling = computed(() => {
  return (amount.value || 0) + calculatedGst.value;
});

const { mutateAsync: createInvoice, isPending } = useCreateInvoiceMutation();

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    id: props.commissionId,
    invoiceNumber: values.invoiceNumber,
    milestone: values.milestone,
    amount: values.amount,
    gstAmount: calculatedGst.value,
    status: 'raised'
  };

  try {
    await createInvoice(payload);

    store.dispatch('notifications/triggerToast', {
      message: 'B2B Invoice raised and registered successfully.',
      type: 'success'
    });

    resetForm();
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to raise invoice.',
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
