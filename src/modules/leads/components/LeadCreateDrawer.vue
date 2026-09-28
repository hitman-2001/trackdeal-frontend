<template>
  <AppDrawer 
    :isOpen="isOpen" 
    title="Create Real Estate Lead Profile" 
    width="640px"
    @close="$emit('close')"
  >
    <form @submit="onSubmit" class="space-y-4 text-xs">
      <!-- Live Duplicate Detection Warnings & Confirmation -->
      <DuplicateDetectionPanel 
        :firstName="firstName"
        :lastName="lastName"
        :mobile="mobile"
        :email="email"
        @confirm="handleCustomerConfirm"
        @viewProfile="handleViewCustomerProfile"
        @cancel="handleDuplicateCancel"
        @reset="handleDuplicateReset"
      />

      <!-- Section Tabs -->
      <div class="flex items-center gap-1 border-b border-default pb-1 overflow-x-auto">
        <button 
          v-for="(section, idx) in sections" 
          :key="idx"
          type="button"
          @click="activeSection = idx"
          class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap"
          :class="activeSection === idx ? 'bg-primary text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          {{ idx + 1 }}. {{ section }}
        </button>
      </div>

      <!-- SECTION 1: BASIC INFO & CONTACT -->
      <div v-if="activeSection === 0" class="space-y-3">
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
              placeholder="e.g. 9876543210"
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
              placeholder="name@example.com"
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
              <option value="">Select Lead Source</option>
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

        <div v-if="showAdminFields" class="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-default pt-2">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branch Office</label>
            <select v-model="branchId" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="">Select Branch</option>
              <option v-for="b in branchesList" :key="b.id || b._id" :value="b.id || b._id">{{ b.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To Agent</label>
            <select v-model="assignedTo" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="">Select Agent</option>
              <option v-for="u in agentsList" :key="u.id || u._id" :value="u.id || u._id">{{ u.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SECTION 2: BUYER REQUIREMENT & BUDGET -->
      <div v-if="activeSection === 1" class="space-y-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Property Type</label>
          <div class="flex flex-wrap gap-2 mt-1">
            <label v-for="t in ['apartment', 'flat', 'villa', 'row_house', 'plot', 'commercial', 'office', 'shop', 'other']" :key="t" class="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" :value="t" v-model="propertyTypes" class="rounded border-default text-primary focus:ring-primary" />
              <span class="capitalize text-[10px] font-medium">{{ t.replace('_', ' ') }}</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Location</label>
            <input v-model="preferredLocation" type="text" placeholder="e.g. South Mumbai" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Locality</label>
            <input v-model="locality" type="text" placeholder="e.g. Bandra West" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Project</label>
            <input v-model="preferredProject" type="text" placeholder="e.g. Imperial Heights" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Configuration (BHK)</label>
          <div class="flex flex-wrap gap-3 mt-1">
            <label v-for="b in ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK']" :key="b" class="flex items-center space-x-1 cursor-pointer">
              <input type="checkbox" :value="b" v-model="bhkTypes" class="rounded border-default text-primary focus:ring-primary" />
              <span class="text-[10px] font-medium">{{ b }}</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min Area (sqft)</label>
            <input v-model.number="minArea" type="number" placeholder="500" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Max Area (sqft)</label>
            <input v-model.number="maxArea" type="number" placeholder="1500" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Floor</label>
            <input v-model="preferredFloor" type="text" placeholder="Higher Floor" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Possession</label>
            <select v-model="possessionPreference" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="ready_to_move">Ready to Move</option>
              <option value="under_construction">Under Construction</option>
              <option value="either">Either</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min Budget (INR)</label>
            <input v-model.number="budgetMin" type="number" placeholder="5000000" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Max Budget (INR)</label>
            <input v-model.number="budgetMax" type="number" placeholder="15000000" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Budget Flexibility</label>
            <select v-model="budgetFlexibility" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="fixed">Fixed</option>
              <option value="negotiable">Negotiable</option>
              <option value="highly_flexible">Highly Flexible</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SECTION 3: FINANCIAL & LOAN REQUIREMENT -->
      <div v-if="activeSection === 2" class="space-y-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loan Required? *</label>
          <div class="flex items-center gap-4 py-1">
            <label class="flex items-center gap-1.5 cursor-pointer font-bold">
              <input type="radio" value="yes" v-model="loanRequired" /> Yes
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer font-bold">
              <input type="radio" value="no" v-model="loanRequired" /> No
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer font-bold">
              <input type="radio" value="not_decided" v-model="loanRequired" /> Not Decided
            </label>
          </div>
        </div>

        <div v-if="loanRequired === 'yes'" class="space-y-3 pt-1">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Expected Value (INR)</label>
              <input v-model.number="expectedPropertyValue" type="number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Own Contribution (OC)</label>
              <input v-model.number="ownContribution" type="number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loan Required Amount</label>
              <input v-model.number="loanRequiredAmount" type="number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loan Type</label>
              <select v-model="loanType" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
                <option value="home_loan">Home Loan</option>
                <option value="lap">LAP (Loan Against Property)</option>
                <option value="commercial_property_loan">Commercial Property Loan</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Bank</label>
              <input v-model="preferredBank" type="text" placeholder="e.g. HDFC Bank" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alternative Bank</label>
              <input v-model="alternativeBank" type="text" placeholder="e.g. ICICI Bank" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Employment Type</label>
              <select v-model="employmentType" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
                <option value="salaried">Salaried</option>
                <option value="self_employed">Self Employed</option>
                <option value="business_owner">Business Owner</option>
                <option value="professional">Professional</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Monthly Income (INR)</label>
              <input v-model.number="monthlyIncome" type="number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Annual Income (INR)</label>
              <input v-model.number="annualIncome" type="number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Loan Status</label>
              <select v-model="loanStatus" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
                <option value="not_applied">Not Applied</option>
                <option value="planning_to_apply">Planning to Apply</option>
                <option value="applied">Applied</option>
                <option value="under_processing">Under Processing</option>
                <option value="sanctioned">Sanctioned</option>
                <option value="rejected">Rejected</option>
                <option value="disbursed">Disbursed</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Is Sanction Letter Available?</label>
              <div class="flex items-center gap-4 py-1">
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="radio" :value="true" v-model="isSanctionLetterAvailable" /> Yes
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input type="radio" :value="false" v-model="isSanctionLetterAvailable" /> No
                </label>
              </div>
            </div>
          </div>

          <div v-if="isSanctionLetterAvailable" class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2 bg-surface border border-default rounded-lg">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sanctioned Amount</label>
              <input v-model.number="sanctionedAmount" type="number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sanction Date</label>
              <input v-model="sanctionDate" type="date" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sanction Bank</label>
              <input v-model="sanctionBank" type="text" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 4: BUYER PROFILE & QUALIFICATION -->
      <div v-if="activeSection === 3" class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Co-Applicant Name</label>
            <input v-model="coApplicantName" type="text" placeholder="Spouse / Partner Name" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Co-Applicant Phone</label>
            <input v-model="coApplicantPhone" type="text" placeholder="Phone Number" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Purchase Timeline</label>
            <select v-model="preferredPurchaseTimeline" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="immediate">Immediate</option>
              <option value="within_30_days">Within 30 Days</option>
              <option value="1_3_months">1–3 Months</option>
              <option value="3_6_months">3–6 Months</option>
              <option value="6_plus_months">6+ Months</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lead Temperature</label>
            <select v-model="leadTemperature" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Buying Intent</label>
            <select v-model="buyingIntent" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Source of Funds</label>
            <select v-model="sourceOfFunds" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="own_funds">Own Funds</option>
              <option value="loan">Home Loan</option>
              <option value="family_funds">Family Funds</option>
              <option value="sale_of_existing_property">Sale of Existing Property</option>
              <option value="combination">Combination</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Time Buyer?</label>
            <div class="flex items-center gap-3 py-1">
              <label class="flex items-center gap-1 cursor-pointer"><input type="radio" :value="true" v-model="isFirstTimeBuyer" /> Yes</label>
              <label class="flex items-center gap-1 cursor-pointer"><input type="radio" :value="false" v-model="isFirstTimeBuyer" /> No</label>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Decision Maker</label>
            <select v-model="decisionMaker" class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary">
              <option value="self">Self</option>
              <option value="spouse">Spouse</option>
              <option value="parents">Parents</option>
              <option value="family">Family</option>
              <option value="business_partner">Business Partner</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Requirements & Qualification Notes</label>
          <textarea v-model="reqNotes" rows="2" placeholder="Detail any specific customer requirements, objections, or notes..." class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary resize-none"></textarea>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <button 
          v-if="activeSection > 0"
          type="button"
          @click="activeSection--"
          class="px-3 py-1.5 border border-default rounded-lg text-xs font-semibold hover:bg-slate-50"
        >
          ← Previous
        </button>
        <div v-else></div>

        <div class="flex items-center gap-2">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 border border-default rounded-lg hover:bg-slate-50 font-semibold"
          >
            Cancel
          </button>
          
          <button 
            v-if="activeSection < sections.length - 1"
            type="button"
            @click="activeSection++"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 font-semibold"
          >
            Next →
          </button>

          <button 
            v-else
            @click="onSubmit"
            :disabled="isPending"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold min-w-[100px]"
          >
            <span v-if="isPending">Saving...</span>
            <span v-else>Save Lead Profile</span>
          </button>
        </div>
      </div>
    </template>
  </AppDrawer>

  <!-- Customer Profile History Modal -->
  <CustomerProfileModal
    :isOpen="isCustomerModalOpen"
    :customer="selectedCustomer"
    :existingLeads="selectedCustomerLeads"
    @close="isCustomerModalOpen = false"
    @confirm="handleCustomerConfirmFromModal"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import AppDrawer from '@/components/AppDrawer.vue';
import DuplicateDetectionPanel from './DuplicateDetectionPanel.vue';
import CustomerProfileModal from './CustomerProfileModal.vue';
import { useCreateLeadMutation } from '../queries';
import { useBranchesQuery, useUsersQuery } from '@/modules/settings/queries';

const sections = ['Basic Contact', 'Buyer Requirement', 'Loan Requirement', 'Buyer Qualification'];
const activeSection = ref(0);

const { data: branchesData } = useBranchesQuery();
const { data: usersData } = useUsersQuery();

const branchesList = computed(() => {
  const data = branchesData.value?.data || branchesData.value;
  return Array.isArray(data) ? data : [];
});

const agentsList = computed(() => {
  const data = usersData.value?.data || usersData.value;
  return Array.isArray(data) ? data.filter(u => u.active) : [];
});

defineProps({
  isOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'success', 'merge']);

const store = useStore();
const userRole = computed(() => store.getters['auth/userRole'] || 'agent');
const showAdminFields = computed(() => ['super_admin', 'org_admin', 'branch_manager'].includes(userRole.value));

// Customer Master Linking State
const linkedCustomerId = ref('');
const linkedCustomerName = ref('');
const isCustomerModalOpen = ref(false);
const selectedCustomer = ref(null);
const selectedCustomerLeads = ref([]);

const schema = toTypedSchema(
  zod.object({
    firstName: zod.string().min(2, 'First Name must contain at least 2 characters').max(50),
    mobile: zod.string().regex(/^[0-9+ -]{5,20}$/, 'Invalid mobile format'),
    email: zod.string().email('Invalid email address').optional().or(zod.literal('')),
    source: zod.string().min(1, 'Lead source is required')
  })
);

const { errors, handleSubmit, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    firstName: '',
    mobile: '',
    email: '',
    source: ''
  }
});

const { value: firstName } = useField('firstName');
const lastName = ref('');
const { value: mobile } = useField('mobile');
const { value: email } = useField('email');
const { value: source } = useField('source');
const alternativeMobile = ref('');

const propertyTypes = ref(['apartment']);
const bhkTypes = ref(['2 BHK']);
const preferredLocation = ref('');
const locality = ref('');
const preferredProject = ref('');
const minArea = ref(null);
const maxArea = ref(null);
const preferredFloor = ref('');
const possessionPreference = ref('ready_to_move');
const purpose = ref('self_use');

const budgetMin = ref(null);
const budgetMax = ref(null);
const budgetFlexibility = ref('negotiable');

const loanRequired = ref('not_decided');
const expectedPropertyValue = ref(null);
const ownContribution = ref(null);
const loanRequiredAmount = ref(null);
const loanType = ref('home_loan');
const preferredBank = ref('');
const alternativeBank = ref('');
const monthlyIncome = ref(null);
const annualIncome = ref(null);
const employmentType = ref('salaried');
const loanStatus = ref('not_applied');
const isSanctionLetterAvailable = ref(false);
const sanctionedAmount = ref(null);
const sanctionDate = ref('');
const sanctionBank = ref('');

const coApplicantName = ref('');
const coApplicantPhone = ref('');
const preferredPurchaseTimeline = ref('within_30_days');
const isFirstTimeBuyer = ref(true);
const sourceOfFunds = ref('loan');
const leadTemperature = ref('warm');
const buyingIntent = ref('medium');
const decisionMaker = ref('self');
const reqNotes = ref('');

const branchId = ref('');
const assignedTo = ref('');

const { mutateAsync: createLead, isPending } = useCreateLeadMutation();

// Existing Customer Linking Handlers
const handleCustomerConfirm = ({ customer, existingLeads }) => {
  if (!customer) return;
  linkedCustomerId.value = customer._id || customer.id || '';
  linkedCustomerName.value = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name || 'Existing Customer';

  // Pre-fill contact values if not already entered
  if (!firstName.value && customer.firstName) setFieldValue('firstName', customer.firstName);
  if (!lastName.value && customer.lastName) lastName.value = customer.lastName;
  if (!mobile.value && customer.mobile) setFieldValue('mobile', customer.mobile);
  if (!email.value && customer.email) setFieldValue('email', customer.email);
  if (!alternativeMobile.value && customer.alternativeMobile) alternativeMobile.value = customer.alternativeMobile;

  store.dispatch('notifications/triggerToast', {
    message: `Linked to existing customer: ${linkedCustomerName.value}. You can now configure the new property requirement.`,
    type: 'info'
  });
};

const handleCustomerConfirmFromModal = (customer) => {
  isCustomerModalOpen.value = false;
  handleCustomerConfirm({ customer, existingLeads: selectedCustomerLeads.value });
};

const handleViewCustomerProfile = ({ customer, existingLeads }) => {
  selectedCustomer.value = customer;
  selectedCustomerLeads.value = existingLeads || [];
  isCustomerModalOpen.value = true;
};

const handleDuplicateCancel = () => {
  // User opted to not link
};

const handleDuplicateReset = () => {
  linkedCustomerId.value = '';
  linkedCustomerName.value = '';
};

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    firstName: values.firstName,
    mobile: values.mobile,
    source: values.source,
    ...(linkedCustomerId.value ? { customerId: linkedCustomerId.value } : {}),
    ...(values.email?.trim() ? { email: values.email.trim() } : {}),
    ...(lastName.value?.trim() ? { lastName: lastName.value.trim() } : {}),
    ...(alternativeMobile.value?.trim() ? { alternativeMobile: alternativeMobile.value.trim() } : {}),
    ...(branchId.value ? { branchId: branchId.value } : {}),
    ...(assignedTo.value ? { assignedTo: assignedTo.value } : {}),
    buyerRequirement: {
      propertyType: propertyTypes.value,
      preferredLocation: preferredLocation.value,
      locality: locality.value,
      preferredProject: preferredProject.value,
      bhk: bhkTypes.value,
      minArea: minArea.value,
      maxArea: maxArea.value,
      preferredFloor: preferredFloor.value,
      possessionPreference: possessionPreference.value,
      purpose: purpose.value
    },
    budget: {
      minBudget: budgetMin.value || 0,
      maxBudget: budgetMax.value || 999999999,
      budgetFlexibility: budgetFlexibility.value
    },
    financialRequirement: {
      loanRequired: loanRequired.value,
      expectedPropertyValue: expectedPropertyValue.value,
      ownContribution: ownContribution.value,
      loanRequiredAmount: loanRequiredAmount.value,
      loanType: loanType.value,
      preferredBank: preferredBank.value,
      alternativeBank: alternativeBank.value,
      monthlyIncome: monthlyIncome.value,
      annualIncome: annualIncome.value,
      employmentType: employmentType.value,
      loanStatus: loanStatus.value,
      isSanctionLetterAvailable: isSanctionLetterAvailable.value,
      sanctionedAmount: sanctionedAmount.value,
      sanctionDate: sanctionDate.value || undefined,
      sanctionBank: sanctionBank.value
    },
    buyerProfile: {
      coApplicantName: coApplicantName.value,
      coApplicantPhone: coApplicantPhone.value,
      preferredPurchaseTimeline: preferredPurchaseTimeline.value,
      isFirstTimeBuyer: isFirstTimeBuyer.value,
      sourceOfFunds: sourceOfFunds.value
    },
    qualification: {
      leadTemperature: leadTemperature.value,
      buyingIntent: buyingIntent.value,
      decisionMaker: decisionMaker.value,
      notesRemarks: reqNotes.value
    }
  };

  try {
    await createLead(payload);
    const successMsg = linkedCustomerId.value
      ? 'New lead created and linked to existing customer profile.'
      : 'Real estate lead profile captured successfully.';
    store.dispatch('notifications/triggerToast', {
      message: successMsg,
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to create lead profile.',
      type: 'error'
    });
  }
});

const handleMerge = (duplicateLead) => {
  const mockLeadA = {
    firstName: firstName.value,
    lastName: lastName.value,
    mobile: mobile.value,
    email: email.value,
    source: source.value
  };
  emit('merge', { leadA: mockLeadA, leadB: duplicateLead });
};
</script>
