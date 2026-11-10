<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Log Clearing collection Receipt" 
    width="480px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs font-medium">
      <!-- Invoice Selection -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target B2B Invoice *</label>
        <select 
          v-model="invoiceId" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary font-semibold"
          :class="errors.invoiceId ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Invoice</option>
          <option v-for="inv in invoices" :key="inv._id || inv.id" :value="inv._id || inv.id">
            {{ inv.invoiceNumber }} (Outstanding: {{ formatCurrency(inv.amount - (inv.collected || 0)) }})
          </option>
        </select>
        <span v-if="errors.invoiceId" class="text-[9px] text-red-500 mt-1 block">{{ errors.invoiceId }}</span>
      </div>

      <!-- Payment Reference -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">UTR / Bank Transaction Reference *</label>
        <input 
          v-model="transactionRef" 
          type="text" 
          placeholder="e.g. UTR-AXIS-88301"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.transactionRef ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.transactionRef" class="text-[9px] text-red-500 mt-1 block">{{ errors.transactionRef }}</span>
      </div>

      <!-- Amount Received -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gross Amount Received (INR) *</label>
          <input 
            v-model.number="amountReceived" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.amountReceived ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.amountReceived" class="text-[9px] text-red-500 mt-1 block">{{ errors.amountReceived }}</span>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">TDS Deducted by Builder (INR) *</label>
          <input 
            v-model.number="tdsDeducted" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.tdsDeducted ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.tdsDeducted" class="text-[9px] text-red-500 mt-1 block">{{ errors.tdsDeducted }}</span>
        </div>
      </div>

      <!-- Mode & Date -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clearing Mode *</label>
          <select 
            v-model="paymentMode" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary font-semibold"
            :class="errors.paymentMode ? 'border-red-500' : 'border-default'"
          >
            <option value="wire">Bank Wire / RTGS</option>
            <option value="cheque">Cheque deposit</option>
            <option value="upi">UPI Transfer</option>
          </select>
          <span v-if="errors.paymentMode" class="text-[9px] text-red-500 mt-1 block">{{ errors.paymentMode }}</span>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Received Date *</label>
          <input 
            v-model="receivedAt" 
            type="date" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.receivedAt ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.receivedAt" class="text-[9px] text-red-500 mt-1 block">{{ errors.receivedAt }}</span>
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
        Record Receipt
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@/utils/toTypedSchema';
import * as zod from 'zod';
import AppDrawer from '@/components/AppDrawer.vue';
import { useRecordCollectionMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  invoices: { type: Array, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const schema = toTypedSchema(
  zod.object({
    invoiceId: zod.string().min(1, 'Target invoice is required'),
    transactionRef: zod.string().min(2, 'UTR Reference is required'),
    amountReceived: zod.number().min(100, 'Received amount must be realistic'),
    tdsDeducted: zod.number().min(0, 'TDS must be greater than or equal to 0'),
    paymentMode: zod.string().min(1, 'Payment mode selection is required'),
    receivedAt: zod.string().min(1, 'Received date is required')
  })
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    invoiceId: '',
    transactionRef: '',
    amountReceived: 0,
    tdsDeducted: 0,
    paymentMode: 'wire',
    receivedAt: new Date().toISOString().split('T')[0]
  }
});

const { value: invoiceId } = useField('invoiceId');
const { value: transactionRef } = useField('transactionRef');
const { value: amountReceived } = useField('amountReceived');
const { value: tdsDeducted } = useField('tdsDeducted');
const { value: paymentMode } = useField('paymentMode');
const { value: receivedAt } = useField('receivedAt');

const { mutateAsync: recordCollection, isPending } = useRecordCollectionMutation();

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    invoiceId: values.invoiceId,
    transactionRef: values.transactionRef,
    amountReceived: values.amountReceived,
    tdsDeducted: values.tdsDeducted,
    paymentMode: values.paymentMode,
    receivedAt: values.receivedAt,
    status: 'pending' // pending clearing
  };

  try {
    await recordCollection(payload);

    store.dispatch('notifications/triggerToast', {
      message: 'Collection transaction receipt logged to ledger. Awaiting bank reconciliation.',
      type: 'success'
    });

    resetForm();
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to log collection receipt.',
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
