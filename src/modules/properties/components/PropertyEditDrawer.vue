<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Edit Property Listing" 
    width="500px"
    @close="$emit('close')"
  >
    <div v-if="isSold" class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 p-3 rounded-lg text-[10px] font-bold mb-4">
      <AppIcon name="warning" :size="15" class="inline mr-1" /> This property is already sold. Details cannot be edited.
    </div>

    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Title -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Listing Title *</label>
        <input 
          v-model="title" 
          type="text" 
          :disabled="isSold"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary disabled:opacity-60"
          :class="errors.title ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.title" class="text-[9px] text-red-500 mt-1 block">{{ errors.title }}</span>
      </div>

      <!-- Price -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Base Price (INR) *</label>
        <input 
          v-model.number="basePrice" 
          type="number" 
          :disabled="isSold || !canRevisePrice"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary disabled:opacity-60"
          :class="errors.basePrice ? 'border-red-500' : 'border-default'"
        />
        <span v-if="!canRevisePrice && !isSold" class="text-[9px] text-slate-400 block mt-1">
          <AppIcon name="lock" :size="14" class="inline mr-1" /> You do not have permission to modify prices.
        </span>
        <span v-if="errors.basePrice" class="text-[9px] text-red-500 mt-1 block">{{ errors.basePrice }}</span>
      </div>

      <!-- Price Revision Reason (Shows when price is modified from original) -->
      <div v-if="isPriceModified" class="bg-yellow-50 dark:bg-yellow-950/25 border border-yellow-200 p-2.5 rounded-lg space-y-1.5">
        <label class="block text-[9px] font-bold text-yellow-750 uppercase">Price Revision Reason *</label>
        <input 
          v-model="revisionReason" 
          type="text" 
          placeholder="Justify this price revision..."
          class="w-full bg-surface border border-yellow-300 rounded px-2.5 py-1 outline-none text-[11px]"
        />
      </div>

      <!-- Config & Type -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Type</label>
          <select 
            v-model="type" 
            :disabled="isSold"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary disabled:opacity-60"
          >
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
            <option value="office">Office</option>
            <option value="shop">Shop</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">BHK Configuration</label>
          <select 
            v-model.number="bhk" 
            :disabled="isSold"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary disabled:opacity-60"
          >
            <option :value="1">1 BHK</option>
            <option :value="2">2 BHK</option>
            <option :value="3">3 BHK</option>
            <option :value="4">4 BHK</option>
            <option :value="5">5 BHK</option>
          </select>
        </div>
      </div>

      <!-- Floor Details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Floor Level</label>
          <input 
            v-model.number="floorNumber" 
            type="number" 
            :disabled="isSold"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary disabled:opacity-60"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Floors</label>
          <input 
            v-model.number="totalFloors" 
            type="number" 
            :disabled="isSold"
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary disabled:opacity-60"
          />
        </div>
      </div>

      <!-- Facing -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Facing Parameter</label>
        <select 
          v-model="facing" 
          :disabled="isSold"
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary disabled:opacity-60"
        >
          <option value="east">East</option>
          <option value="west">West</option>
          <option value="north">North</option>
          <option value="south">South</option>
          <option value="north-east">North-East</option>
          <option value="north-west">North-West</option>
          <option value="south-east">South-East</option>
          <option value="south-west">South-West</option>
        </select>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Remarks & Details</label>
        <textarea 
          v-model="description" 
          rows="3"
          :disabled="isSold"
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none disabled:opacity-60"
        ></textarea>
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
        :disabled="isPending || isSold || (isPriceModified && !revisionReason)"
        class="btn-md btn-primary"
      >
        Save Changes
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import AppDrawer from '@/components/AppDrawer.vue';
import { useUpdatePropertyMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  property: { type: Object, default: null }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const isSold = computed(() => props.property?.status === 'sold');

const canRevisePrice = computed(() => {
  return store.getters['permissions/hasCapability']('properties:revise_price') || 
         store.getters['auth/userRole'] === 'super_admin';
});

const schema = toTypedSchema(
  zod.object({
    title: zod.string().min(2, 'Title must contain at least 2 characters').max(150),
    basePrice: zod.number().min(10000, 'Price must be realistic')
  })
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema
});

const { value: title } = useField('title');
const { value: basePrice } = useField('basePrice');

const bhk = ref(2);
const type = ref('apartment');
const floorNumber = ref(0);
const totalFloors = ref(1);
const facing = ref('east');
const description = ref('');
const revisionReason = ref('');

const isPriceModified = computed(() => {
  if (!props.property) return false;
  return basePrice.value !== props.property.price;
});

watch(() => props.property, (newProp) => {
  if (!newProp) return;
  resetForm({
    values: {
      title: newProp.title,
      basePrice: newProp.price
    }
  });
  bhk.value = newProp.bhk || 2;
  type.value = newProp.type || 'apartment';
  floorNumber.value = newProp.floors || 0;
  totalFloors.value = newProp.totalFloors || 1;
  facing.value = newProp.facing || 'east';
  description.value = newProp.description || '';
  revisionReason.value = '';
}, { immediate: true });

const { mutateAsync: updateProperty, isPending } = useUpdatePropertyMutation();

const onSubmit = handleSubmit(async (values) => {
  if (isSold.value) return;

  const payload = {
    id: props.property._id || props.property.id,
    title: values.title,
    description: description.value || undefined,
    type: type.value,
    price: values.basePrice,
    bhk: bhk.value,
    floors: floorNumber.value,
    totalFloors: totalFloors.value,
    facing: facing.value,
    // Add pricing revision entry if changed
    priceHistory: isPriceModified.value ? [
      ...(props.property.priceHistory || []),
      {
        price: values.basePrice,
        reason: revisionReason.value,
        changedAt: new Date().toISOString()
      }
    ] : undefined
  };

  try {
    await updateProperty(payload);
    
    store.dispatch('notifications/triggerToast', {
      message: 'Property listing updated successfully.',
      type: 'success'
    });

    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to update property.',
      type: 'error'
    });
  }
});
</script>
