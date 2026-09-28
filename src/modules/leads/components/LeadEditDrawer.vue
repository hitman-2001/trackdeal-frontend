<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Edit Lead Details" 
    width="520px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Live Duplicate Detection Warnings (only if details are modified) -->
      <DuplicateDetectionPanel 
        v-if="hasModifiedDetails"
        :firstName="firstName"
        :lastName="lastName"
        :mobile="mobile"
        :email="email"
        @viewProfile="handleViewCustomerProfile"
      />

      <!-- Basic Profile Fields -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Name *</label>
          <input 
            v-model="firstName" 
            type="text" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.firstName ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.firstName" class="text-[9px] text-red-500 mt-1 block">{{ errors.firstName }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Last Name</label>
          <input 
            v-model="lastName" 
            type="text" 
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile *</label>
          <input 
            v-model="mobile" 
            type="text" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.mobile ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.mobile" class="text-[9px] text-red-500 mt-1 block">{{ errors.mobile }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.email ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.email" class="text-[9px] text-red-500 mt-1 block">{{ errors.email }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Source *</label>
          <select 
            v-model="source" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.source ? 'border-red-500' : 'border-default'"
          >
            <option value="website">Website Portal</option>
            <option value="magicbricks">MagicBricks</option>
            <option value="99acres">99acres</option>
            <option value="housing">Housing.com</option>
            <option value="whatsapp">WhatsApp Outreach</option>
            <option value="referral">Referral Code</option>
            <option value="walk_in">Walk-in Inquiry</option>
            <option value="manual_entry">Manual Entry</option>
          </select>
          <span v-if="errors.source" class="text-[9px] text-red-500 mt-1 block">{{ errors.source }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alternative Mobile</label>
          <input 
            v-model="alternativeMobile" 
            type="text" 
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
      </div>

      <!-- Requirements Section header -->
      <h4 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-default pt-2 pb-1">
        Lead Requirements
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Types</label>
          <div class="flex flex-wrap gap-2 mt-1">
            <label v-for="t in ['apartment', 'villa', 'plot', 'commercial', 'office']" :key="t" class="flex items-center space-x-1.5">
              <input type="checkbox" :value="t" v-model="propertyTypes" class="rounded border-default text-primary focus:ring-primary" />
              <span class="capitalize text-[10px]">{{ t }}</span>
            </label>
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">BHK Requirement</label>
          <div class="flex flex-wrap gap-2.5 mt-1">
            <label v-for="b in [1, 2, 3, 4, 5]" :key="b" class="flex items-center space-x-1">
              <input type="checkbox" :value="b" v-model="bhkTypes" class="rounded border-default text-primary focus:ring-primary" />
              <span class="text-[10px]">{{ b }} BHK</span>
            </label>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min Budget (INR)</label>
          <input 
            v-model.number="budgetMin" 
            type="number" 
            placeholder="Min Budget"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Max Budget (INR)</label>
          <input 
            v-model.number="budgetMax" 
            type="number" 
            placeholder="Max Budget"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Locations (Comma Separated)</label>
        <input 
          v-model="locations" 
          type="text" 
          placeholder="e.g. Bandra, Andheri"
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
        />
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Requirements Notes</label>
        <textarea 
          v-model="reqNotes" 
          rows="2"
          placeholder="Additional detail parameters..."
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
        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:bg-slate-300 font-semibold flex items-center justify-center min-w-[70px]"
      >
        <span v-if="isPending">Saving...</span>
        <span v-else>Save Changes</span>
      </button>
    </template>
  </AppDrawer>

  <!-- Customer Profile History Modal -->
  <CustomerProfileModal
    :isOpen="isCustomerModalOpen"
    :customer="selectedCustomer"
    :existingLeads="selectedCustomerLeads"
    @close="isCustomerModalOpen = false"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import AppDrawer from '@/components/AppDrawer.vue';
import DuplicateDetectionPanel from './DuplicateDetectionPanel.vue';
import CustomerProfileModal from './CustomerProfileModal.vue';
import { useUpdateLeadMutation } from '../queries';

const isCustomerModalOpen = ref(false);
const selectedCustomer = ref(null);
const selectedCustomerLeads = ref([]);

const handleViewCustomerProfile = ({ customer, existingLeads }) => {
  selectedCustomer.value = customer;
  selectedCustomerLeads.value = existingLeads || [];
  isCustomerModalOpen.value = true;
};

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  lead: { type: Object, required: true }
});

const emit = defineEmits(['close', 'success', 'merge']);

const store = useStore();

// Validation Schema
const schema = toTypedSchema(
  zod.object({
    firstName: zod.string().min(2, 'First Name must contain at least 2 characters').max(50),
    mobile: zod.string().regex(/^[0-9+ -]{5,20}$/, 'Invalid mobile format'),
    email: zod.string().email('Invalid email address').optional().or(zod.literal('')),
    source: zod.string().min(1, 'Lead source is required')
  })
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema
});

const { value: firstName } = useField('firstName');
const lastName = ref('');
const { value: mobile } = useField('mobile');
const { value: email } = useField('email');
const { value: source } = useField('source');
const alternativeMobile = ref('');
const propertyTypes = ref([]);
const bhkTypes = ref([]);
const budgetMin = ref(null);
const budgetMax = ref(null);
const locations = ref('');
const reqNotes = ref('');

const hasModifiedDetails = computed(() => {
  return mobile.value !== props.lead.mobile || email.value !== props.lead.email;
});

const populateForm = () => {
  if (props.lead) {
    resetForm({
      values: {
        firstName: props.lead.firstName || '',
        mobile: props.lead.mobile || '',
        email: props.lead.email || '',
        source: props.lead.source || ''
      }
    });

    lastName.value = props.lead.lastName || '';
    alternativeMobile.value = props.lead.alternativeMobile || '';
    
    const reqs = props.lead.requirements || {};
    propertyTypes.value = reqs.propertyType || [];
    bhkTypes.value = reqs.bhk || [];
    budgetMin.value = reqs.budget?.min || null;
    budgetMax.value = reqs.budget?.max || null;
    locations.value = reqs.locations ? reqs.locations.join(', ') : '';
    reqNotes.value = reqs.notes || '';
  }
};

onMounted(populateForm);
watch(() => props.lead, populateForm);

const { mutateAsync: updateLead, isPending } = useUpdateLeadMutation();

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    id: props.lead._id || props.lead.id,
    firstName: values.firstName,
    mobile: values.mobile,
    source: values.source,
    ...(values.email?.trim() ? { email: values.email.trim() } : {}),
    ...(lastName.value?.trim() ? { lastName: lastName.value.trim() } : {}),
    ...(alternativeMobile.value?.trim() ? { alternativeMobile: alternativeMobile.value.trim() } : {}),
    requirements: {
      propertyType: propertyTypes.value,
      bhk: bhkTypes.value,
      budget: (budgetMin.value || budgetMax.value) ? {
        min: budgetMin.value || 0,
        max: budgetMax.value || 999999999,
        currency: 'INR'
      } : undefined,
      locations: locations.value ? locations.value.split(',').map(l => l.trim()).filter(Boolean) : [],
      notes: reqNotes.value
    }
  };

  try {
    await updateLead(payload);
    store.dispatch('notifications/triggerToast', {
      message: 'Lead profile updated successfully.',
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to update lead profile.',
      type: 'error'
    });
  }
});

const handleMerge = (duplicateLead) => {
  emit('merge', { leadA: props.lead, leadB: duplicateLead });
};
</script>
