<template>
  <AppDrawer 
    :isOpen="isOpen" 
    :title="builder ? 'Edit Builder Developer' : 'Add Builder Developer'" 
    width="500px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Name -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Builder Group Name *</label>
        <input 
          v-model="name" 
          type="text" 
          placeholder="e.g. Skyway Builders Group"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.name ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.name" class="text-[9px] text-red-500 mt-1 block">{{ errors.name }}</span>
      </div>

      <!-- Code & RERA -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Developer Short Code *</label>
          <input 
            v-model="code" 
            type="text" 
            placeholder="e.g. SKYWAY"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary uppercase"
            :class="errors.code ? 'border-red-500' : 'border-default'"
            :disabled="!!builder"
          />
          <span v-if="errors.code" class="text-[9px] text-red-500 mt-1 block">{{ errors.code }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Corporate RERA ID</label>
          <input 
            v-model="rera" 
            type="text" 
            placeholder="e.g. PRM/KA/RERA/125"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
      </div>

      <!-- Address -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Corporate Registered Address</label>
        <textarea 
          v-model="address" 
          rows="2"
          placeholder="Complete office address details..."
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
        ></textarea>
      </div>

      <!-- Contact Representative -->
      <div class="border-t border-dashed border-default pt-3 space-y-3">
        <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200">
          Primary Corporate Contact
        </h4>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address *</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="e.g. info@skyway.com"
              class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
              :class="errors.email ? 'border-red-500' : 'border-default'"
            />
            <span v-if="errors.email" class="text-[9px] text-red-500 mt-1 block">{{ errors.email }}</span>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Number *</label>
            <input 
              v-model="phone" 
              type="text" 
              placeholder="e.g. +91 98765 43210"
              class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
              :class="errors.phone ? 'border-red-500' : 'border-default'"
            />
            <span v-if="errors.phone" class="text-[9px] text-red-500 mt-1 block">{{ errors.phone }}</span>
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Website URL</label>
          <input 
            v-model="website" 
            type="text" 
            placeholder="e.g. https://www.skywaybuilders.com"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
      </div>

      <!-- Payment Escrow Registry details -->
      <div class="border-t border-dashed border-default pt-3 space-y-3">
        <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200">
          Escrow Bank Account (for commission splits)
        </h4>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bank Name</label>
            <input 
              v-model="bankName" 
              type="text" 
              placeholder="HDFC Bank"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">IFSC Code</label>
            <input 
              v-model="bankIfsc" 
              type="text" 
              placeholder="HDFC0000120"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Number</label>
            <input 
              v-model="bankAccount" 
              type="text" 
              placeholder="5020001234567"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Holder Name</label>
            <input 
              v-model="bankHolder" 
              type="text" 
              placeholder="Skyway Builders Group Escrow"
              class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
        </div>
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
        Save Builder
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@/utils/toTypedSchema';
import * as zod from 'zod';
import AppDrawer from '@/components/AppDrawer.vue';
import { useCreateBuilderMutation, useUpdateBuilderMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  builder: { type: Object, default: null }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const schema = toTypedSchema(
  zod.object({
    name: zod.string().min(2, 'Name must contain at least 2 characters').max(150),
    code: zod.string().min(2, 'Short code is required').max(10),
    email: zod.string().email('Invalid email address'),
    phone: zod.string().min(8, 'Phone number is required')
  })
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema
});

const { value: name } = useField('name');
const { value: code } = useField('code');
const { value: email } = useField('email');
const { value: phone } = useField('phone');

const rera = ref('');
const address = ref('');
const website = ref('');
const bankName = ref('');
const bankIfsc = ref('');
const bankAccount = ref('');
const bankHolder = ref('');

watch(() => props.builder, (newB) => {
  resetForm({
    values: {
      name: newB?.name || '',
      code: newB?.code || '',
      email: newB?.email || '',
      phone: newB?.phone || ''
    }
  });
  rera.value = newB?.rera || '';
  address.value = newB?.address || '';
  website.value = newB?.website || '';
  bankName.value = newB?.bankName || '';
  bankIfsc.value = newB?.bankIfsc || '';
  bankAccount.value = newB?.bankAccount || '';
  bankHolder.value = newB?.bankHolder || '';
}, { immediate: true });

const { mutateAsync: createBuilder, isPending: isCreating } = useCreateBuilderMutation();
const { mutateAsync: updateBuilder, isPending: isUpdating } = useUpdateBuilderMutation();

const isPending = computed(() => isCreating.value || isUpdating.value);

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    ...values,
    rera: rera.value || undefined,
    address: address.value || undefined,
    website: website.value || undefined,
    bankName: bankName.value || undefined,
    bankIfsc: bankIfsc.value || undefined,
    bankAccount: bankAccount.value || undefined,
    bankHolder: bankHolder.value || undefined
  };

  try {
    if (props.builder) {
      await updateBuilder({
        id: props.builder._id || props.builder.id,
        ...payload
      });
      store.dispatch('notifications/triggerToast', {
        message: 'Builder developer updated successfully.',
        type: 'success'
      });
    } else {
      await createBuilder(payload);
      store.dispatch('notifications/triggerToast', {
        message: 'Builder developer created successfully.',
        type: 'success'
      });
    }
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to save developer record.',
      type: 'error'
    });
  }
});
</script>
