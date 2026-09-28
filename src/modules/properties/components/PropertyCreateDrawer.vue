<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Add New Property Listing" 
    width="500px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Form Validation Error Banner -->
      <div v-if="submitError || Object.keys(errors).length > 0" class="p-3 rounded-lg text-caption font-medium border bg-red-50 text-red-700 border-red-200 space-y-1">
        <p v-if="submitError" class="font-bold">{{ submitError }}</p>
        <p v-if="Object.keys(errors).length > 0">Please fill out all required fields highlighted below.</p>
      </div>

      <!-- Title/Code -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Listing Title *</label>
        <input 
          v-model="title" 
          type="text" 
          placeholder="e.g. Skyway Tower - Unit 802"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.title ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.title" class="text-[9px] text-red-500 mt-1 block">{{ errors.title }}</span>
      </div>

      <!-- Project (Searchable Dropdown) -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Development Project *</label>
        <select 
          v-model="projectId" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.projectId ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Project</option>
          <option v-for="proj in projects" :key="proj._id || proj.id" :value="proj._id || proj.id">
            {{ proj.name }} ({{ proj.city }})
          </option>
        </select>
        <span v-if="errors.projectId" class="text-[9px] text-red-500 mt-1 block">{{ errors.projectId }}</span>
      </div>

      <!-- Tower & Unit Number -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tower / Block *</label>
          <input 
            v-model="towerBlock" 
            type="text" 
            placeholder="e.g. Tower A"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.towerBlock ? 'border-red-500' : 'border-default'"
            @blur="checkUniqueness"
          />
          <span v-if="errors.towerBlock" class="text-[9px] text-red-500 mt-1 block">{{ errors.towerBlock }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit Number *</label>
          <input 
            v-model="unitNumber" 
            type="text" 
            placeholder="e.g. 802"
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.unitNumber ? 'border-red-500' : 'border-default'"
            @blur="checkUniqueness"
          />
          <span v-if="errors.unitNumber" class="text-[9px] text-red-500 mt-1 block">{{ errors.unitNumber }}</span>
        </div>
      </div>
      <span v-if="uniquenessError" class="text-[9px] text-red-500 block font-bold">{{ uniquenessError }}</span>

      <!-- Floor Numbers -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Floor Level *</label>
          <input 
            v-model.number="floorNumber" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.floorNumber ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.floorNumber" class="text-[9px] text-red-500 mt-1 block">{{ errors.floorNumber }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Floors *</label>
          <input 
            v-model.number="totalFloors" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.totalFloors ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.totalFloors" class="text-[9px] text-red-500 mt-1 block">{{ errors.totalFloors }}</span>
        </div>
      </div>

      <!-- Config & Type -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Type *</label>
          <select 
            v-model="type" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
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
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">BHK Configuration *</label>
          <select 
            v-model.number="bhk" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          >
            <option :value="1">1 BHK</option>
            <option :value="2">2 BHK</option>
            <option :value="3">3 BHK</option>
            <option :value="4">4 BHK</option>
            <option :value="5">5 BHK</option>
          </select>
        </div>
      </div>

      <!-- Super vs Carpet Areas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Super Area (sqft) *</label>
          <input 
            v-model.number="superArea" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.superArea ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.superArea" class="text-[9px] text-red-500 mt-1 block">{{ errors.superArea }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Carpet Area (sqft) *</label>
          <input 
            v-model.number="carpetArea" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.carpetArea ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.carpetArea" class="text-[9px] text-red-500 mt-1 block">{{ errors.carpetArea }}</span>
        </div>
      </div>

      <!-- Pricing details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Base Price (INR) *</label>
          <input 
            v-model.number="basePrice" 
            type="number" 
            class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            :class="errors.basePrice ? 'border-red-500' : 'border-default'"
          />
          <span v-if="errors.basePrice" class="text-[9px] text-red-500 mt-1 block">{{ errors.basePrice }}</span>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Facing Parameter</label>
          <select 
            v-model="facing" 
            class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary"
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
      </div>

      <!-- Seller Link -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-[10px] font-bold text-slate-500 uppercase">Seller Entity Owner *</label>
          <button
            type="button"
            @click="quickSellerModalOpen = true"
            class="text-[9px] font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>+ Add Seller</span>
          </button>
        </div>
        <select 
          v-model="sellerId" 
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary text-xs"
          :class="errors.sellerId ? 'border-red-500' : 'border-default'"
        >
          <option value="">Select Seller</option>
          <option v-for="sel in sellers" :key="sel._id || sel.id" :value="sel._id || sel.id">
            {{ sel.name || `${sel.firstName || ''} ${sel.lastName || ''}`.trim() }} ({{ sel.mobile || sel.phone }})
          </option>
        </select>
        <span v-if="errors.sellerId" class="text-[9px] text-red-500 mt-1 block">{{ errors.sellerId }}</span>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Remarks & Details</label>
        <textarea 
          v-model="description" 
          rows="2"
          class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"
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
        :disabled="isPending || !!uniquenessError"
        class="btn-md btn-primary"
      >
        Save Property
      </button>
    </template>

    <SellerQuickCreateModal
      :open="quickSellerModalOpen"
      @close="quickSellerModalOpen = false"
      @created="handleSellerCreated"
    />
  </AppDrawer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import apiClient from '@/api/client';
import AppDrawer from '@/components/AppDrawer.vue';
import SellerQuickCreateModal from './SellerQuickCreateModal.vue';
import { useCreatePropertyMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const quickSellerModalOpen = ref(false);
const submitError = ref('');

const schema = toTypedSchema(
  zod.object({
    title: zod.string().optional().or(zod.literal('')),
    projectId: zod.string().optional().or(zod.literal('')),
    towerBlock: zod.string().optional().or(zod.literal('')),
    unitNumber: zod.string().optional().or(zod.literal('')),
    floorNumber: zod.number().min(0, 'Floor must be greater than or equal to 0'),
    totalFloors: zod.number().min(1, 'Total floors must be at least 1'),
    superArea: zod.number().min(1, 'Super area is required'),
    carpetArea: zod.number().min(1, 'Carpet area is required'),
    basePrice: zod.number().min(10000, 'Price must be realistic'),
    sellerId: zod.string().min(1, 'Seller reference is required')
  }).refine(data => (data.superArea || 0) >= (data.carpetArea || 0), {
    message: 'Super Built-Up Area must be greater than or equal to Carpet Area',
    path: ['superArea']
  })
);

const { errors, handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    projectId: '',
    towerBlock: '',
    unitNumber: '',
    floorNumber: 1,
    totalFloors: 1,
    superArea: 500,
    carpetArea: 450,
    basePrice: 4000000,
    sellerId: ''
  }
});

const { value: title } = useField('title');
const { value: projectId } = useField('projectId');
const { value: towerBlock } = useField('towerBlock');
const { value: unitNumber } = useField('unitNumber');
const { value: floorNumber } = useField('floorNumber');
const { value: totalFloors } = useField('totalFloors');
const { value: superArea } = useField('superArea');
const { value: carpetArea } = useField('carpetArea');
const { value: basePrice } = useField('basePrice');
const { value: sellerId } = useField('sellerId');

const facing = ref('east');
const type = ref('apartment');
const bhk = ref(2);
const description = ref('');

const projects = ref([]);
const sellers = ref([]);
const uniquenessError = ref('');

const loadContextData = async () => {
  try {
    const [projRes, selRes] = await Promise.all([
      apiClient.get('/projects/projects'),
      apiClient.get('/sellers')
    ]);
    projects.value = projRes.data?.data || [];
    sellers.value = selRes.data?.data || [];

    // Auto-create default Seller if list is empty
    if (sellers.value.length === 0) {
      try {
        const defaultSellerRes = await apiClient.post('/sellers', {
          firstName: 'TrackDeal Owner',
          lastName: 'Direct Seller',
          mobile: '9820098200',
          address: { city: 'Mumbai' }
        });
        if (defaultSellerRes.data?.data) {
          sellers.value = [defaultSellerRes.data.data];
          if (!sellerId.value) {
            sellerId.value = defaultSellerRes.data.data._id || defaultSellerRes.data.data.id;
          }
        }
      } catch (e) {
        console.error('Failed to auto-create default seller:', e);
      }
    } else if (!sellerId.value && sellers.value.length > 0) {
      sellerId.value = sellers.value[0]._id || sellers.value[0].id;
    }

    // Auto-create default Project if list is empty
    if (projects.value.length === 0) {
      try {
        let builderId = '';
        const buildersRes = await apiClient.get('/projects/builders');
        const buildersList = buildersRes.data?.data || [];
        if (buildersList.length > 0) {
          builderId = buildersList[0]._id || buildersList[0].id;
        } else {
          const defaultBuilderRes = await apiClient.post('/projects/builders', {
            name: 'TrackDeal Developer Group',
            code: 'TRACKDEAL_DEV',
            address: 'Main Office'
          });
          builderId = defaultBuilderRes.data?.data?._id;
        }

        if (builderId) {
          const defaultProjRes = await apiClient.post('/projects/projects', {
            name: 'TrackDeal Residency Project',
            code: 'TRACKDEAL_PROJ',
            builderId,
            city: 'Mumbai',
            status: 'upcoming'
          });
          if (defaultProjRes.data?.data) {
            projects.value = [defaultProjRes.data.data];
            if (!projectId.value) {
              projectId.value = defaultProjRes.data.data._id || defaultProjRes.data.data.id;
            }
          }
        }
      } catch (e) {
        console.error('Failed to auto-create default project:', e);
      }
    } else if (!projectId.value && projects.value.length > 0) {
      projectId.value = projects.value[0]._id || projects.value[0].id;
    }
  } catch (err) {
    console.error('Failed to load properties context details:', err);
  }
};

onMounted(loadContextData);

const handleSellerCreated = async (newSeller) => {
  await loadContextData();
  const idVal = newSeller._id || newSeller.id;
  if (idVal) {
    sellerId.value = idVal;
  }
};

const checkUniqueness = async () => {
  uniquenessError.value = '';
  if (!projectId.value || !towerBlock.value || !unitNumber.value) return;
  
  try {
    const unitsRes = await apiClient.get('/projects/units', {
      params: { 
        projectId: projectId.value, 
        unitNumber: unitNumber.value 
      }
    });
    const match = unitsRes.data?.data?.find(u => u.unitNumber === unitNumber.value);
    if (match) {
      uniquenessError.value = `Unit ${unitNumber.value} on ${towerBlock.value} already exists in this project.`;
    }
  } catch (error) {
    console.warn('Failed uniqueness validation check', error);
  }
};

const { mutateAsync: createProperty, isPending } = useCreatePropertyMutation();

const onSubmit = handleSubmit(async (values) => {
  submitError.value = '';
  if (uniquenessError.value) {
    submitError.value = uniquenessError.value;
    return;
  }

  const resolvedTower = values.towerBlock?.trim() || 'Tower A';
  const resolvedUnit = values.unitNumber?.trim() || '101';
  const resolvedTitle = values.title?.trim() || `${resolvedTower} - Unit ${resolvedUnit}`;
  const resolvedProjectId = values.projectId || projects.value[0]?._id || projects.value[0]?.id;
  const resolvedSellerId = values.sellerId || sellers.value[0]?._id || sellers.value[0]?.id;

  if (!resolvedSellerId) {
    submitError.value = 'Please select or add a Seller Entity Owner before saving.';
    return;
  }

  const payload = {
    title: resolvedTitle,
    description: description.value || undefined,
    type: type.value || 'apartment',
    seller: resolvedSellerId,
    project: resolvedProjectId || undefined,
    price: values.basePrice || 100000,
    location: {
      city: projects.value.find(p => (p._id || p.id) === resolvedProjectId)?.city || 'Mumbai'
    },
    area: {
      carpet: values.carpetArea || 100,
      superBuiltUp: values.superArea || 120,
      unit: 'sqft'
    },
    bhk: bhk.value || 2,
    floors: values.floorNumber || 1,
    totalFloors: values.totalFloors || 1,
    facing: facing.value || 'east',
    status: 'available'
  };

  try {
    await createProperty(payload);
    
    // Resolve or create Tower if project exists
    if (resolvedProjectId) {
      let towerIdResolved = '';
      try {
        const towersRes = await apiClient.get('/projects/towers', {
          params: { projectId: resolvedProjectId }
        });
        const existingTowers = towersRes.data?.data || [];
        const match = existingTowers.find(t => t.name.toLowerCase().trim() === resolvedTower.toLowerCase().trim());
        if (match) {
          towerIdResolved = match._id || match.id;
        } else {
          const towerCode = resolvedTower.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase().substring(0, 20) || 'TOWER';
          const newTowerRes = await apiClient.post('/projects/towers', {
            projectId: resolvedProjectId,
            name: resolvedTower,
            code: towerCode
          });
          const newTower = newTowerRes.data?.data || newTowerRes.data;
          towerIdResolved = newTower._id || newTower.id;
        }
      } catch (err) {
        console.warn('Failed to resolve or create tower, falling back', err);
      }

      if (towerIdResolved) {
        await apiClient.post('/projects/units', {
          projectId: resolvedProjectId,
          towerId: towerIdResolved,
          unitNumber: resolvedUnit,
          configuration: type.value === 'apartment' ? `${bhk.value}BHK` : type.value,
          carpetArea: values.carpetArea,
          builtUpArea: values.superArea,
          price: values.basePrice
        }).catch(err => console.warn('Sync unit creation skipped', err));
      }
    }

    store.dispatch('notifications/triggerToast', {
      message: 'Property listing created successfully.',
      type: 'success'
    });

    resetForm();
    description.value = '';
    submitError.value = '';
    
    emit('success');
    emit('close');
  } catch (error) {
    submitError.value = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to create property.';
    store.dispatch('notifications/triggerToast', {
      message: submitError.value,
      type: 'error'
    });
  }
});
</script>
