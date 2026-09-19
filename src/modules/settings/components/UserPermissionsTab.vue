<template>
  <section class="bg-surface border border-default rounded-xl p-5 shadow-sm space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100">
          {{ isEducation ? 'Staff-Level Permissions' : 'User-Level Permissions' }}
        </h2>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          {{ isEducation
            ? "Fine-tune staff and counselor access for active modules. Changes apply as explicit grants or denials."
            : "Fine-tune team member access for active modules. Role permissions remain the baseline; changes here are explicit grants or denials." }}
        </p>
      </div>

      <!-- Quick Summary Stats -->
      <div v-if="manageableUsers.length > 0 && selectedUser" class="flex items-center gap-2 shrink-0">
        <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-default">
          {{ totalActiveCount }} / {{ totalAvailableCount }} Active
        </span>
        <span v-if="draft.added.length > 0" class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          +{{ draft.added.length }} Custom Grants
        </span>
        <span v-if="draft.removed.length > 0" class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          -{{ draft.removed.length }} Custom Denials
        </span>
      </div>
    </div>

    <div v-if="manageableUsers.length === 0" class="rounded-lg border border-default p-8 text-center text-xs text-slate-500">
      {{ isEducation ? 'No eligible staff members found to manage.' : 'There are no eligible users to manage.' }}
    </div>

    <template v-else>
      <!-- User Selection & Baseline Banner -->
      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end bg-slate-50/50 dark:bg-slate-850/40 p-4 rounded-xl border border-default">
        <label class="block">
          <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ isEducation ? 'Select Staff Member' : 'Select Team Member' }}
          </span>
          <select
            v-model="selectedUserId"
            class="w-full rounded-lg border border-default bg-surface px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-primary dark:text-slate-100 cursor-pointer shadow-sm"
          >
            <option v-for="user in manageableUsers" :key="getUserId(user)" :value="getUserId(user)">
              {{ user.name || user.fullName || user.email }} — {{ roleName(user) }}
            </option>
          </select>
        </label>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-sm btn-secondary h-9 text-xs font-semibold gap-1.5"
            :disabled="isSaving || (!hasChanges && draft.added.length === 0 && draft.removed.length === 0)"
            @click="resetToRole"
          >
            <PhArrowCounterClockwise :size="13" />
            <span>Reset to Role Defaults</span>
          </button>
        </div>
      </div>

      <!-- Selected User Context Badge -->
      <div v-if="selectedUser" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-default bg-slate-50 dark:bg-slate-800/40 px-3.5 py-2.5 text-[11px]">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-800 dark:text-slate-200">
            {{ selectedUser.name || selectedUser.fullName || selectedUser.email }}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary dark:bg-primary/20">
            {{ roleName(selectedUser) }}
          </span>
        </div>
        <p class="text-[10px] text-slate-500 dark:text-slate-400">
          Permissions apply immediately across all active modules in this workspace.
        </p>
      </div>

      <!-- Controls: Search & Accordion Toggle Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <PhMagnifyingGlass :size="14" />
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filter active permissions by name or code..."
            class="w-full pl-8 pr-8 py-2 text-xs bg-surface border border-default rounded-lg outline-none focus:border-primary dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <PhX :size="12" />
          </button>
        </div>

        <!-- Accordions Toggle -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="toggleAllAccordions"
            class="btn-sm btn-ghost text-xs font-semibold gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <component :is="isAllExpanded ? PhArrowsIn : PhArrowsOut" :size="14" />
            <span>{{ isAllExpanded ? 'Collapse All' : 'Expand All' }}</span>
          </button>
        </div>
      </div>

      <!-- Accordion List -->
      <div v-if="filteredCategories.length === 0" class="rounded-lg border border-default p-8 text-center text-xs text-slate-500">
        No active permissions match "{{ searchQuery }}".
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="cat in filteredCategories"
          :key="cat.id"
          class="border border-default rounded-xl overflow-hidden bg-surface transition-all shadow-sm"
        >
          <!-- Accordion Header -->
          <div
            @click="toggleCategory(cat.id)"
            class="flex items-center justify-between p-3.5 cursor-pointer select-none bg-slate-50/70 dark:bg-slate-850/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
          >
            <div class="flex items-center gap-2.5 min-w-0 pr-2">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 text-primary dark:bg-primary/20 shrink-0">
                <component :is="cat.icon" :size="16" weight="bold" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                    {{ cat.title }}
                  </h3>
                  <span class="text-[10px] text-slate-400 font-normal hidden sm:inline">
                    ({{ cat.permissions.length }})
                  </span>
                </div>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden md:block">
                  {{ cat.description }}
                </p>
              </div>
            </div>

            <!-- Right Controls: Status Badge, Quick Actions, Chevron -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- Active Count Badge -->
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors"
                :class="getCategoryBadgeClass(cat)"
              >
                {{ getCategoryBadgeText(cat) }}
              </span>

              <!-- Quick Grant / Revoke Buttons -->
              <div class="hidden sm:flex items-center gap-1 border-l border-default pl-2 ml-1" @click.stop>
                <button
                  type="button"
                  @click="grantAllInCategory(cat)"
                  :disabled="isSaving || isAllGranted(cat)"
                  class="px-2 py-1 rounded text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Grant all permissions in this module"
                >
                  Grant all
                </button>
                <button
                  type="button"
                  @click="revokeAllInCategory(cat)"
                  :disabled="isSaving || isNoneGranted(cat)"
                  class="px-2 py-1 rounded text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Revoke all permissions in this module"
                >
                  Revoke all
                </button>
              </div>

              <!-- Chevron -->
              <div class="w-5 flex justify-center">
                <PhCaretDown
                  :size="14"
                  class="text-slate-400 transition-transform duration-200"
                  :class="{ 'rotate-180': isExpanded(cat.id) }"
                />
              </div>
            </div>
          </div>

          <!-- Accordion Body -->
          <div v-show="isExpanded(cat.id)" class="border-t border-default bg-surface">
            <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:gap-x-px bg-default">
              <label
                v-for="permission in cat.permissions"
                :key="permission.key"
                class="flex cursor-pointer items-start gap-3 p-3.5 bg-surface hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="isAllowed(permission.key)"
                  :disabled="isSaving"
                  class="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary shrink-0"
                  @change="setPermission(permission.key, $event.target.checked)"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="block text-xs font-semibold text-slate-850 dark:text-slate-200">
                      {{ permission.label }}
                    </span>
                    <span
                      class="rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0"
                      :class="permissionSourceClass(permission.key)"
                    >
                      {{ permissionSource(permission.key) }}
                    </span>
                  </div>
                  <p class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {{ permission.description }}
                  </p>
                  <span class="mt-1 block font-mono text-[9px] text-slate-400 dark:text-slate-500">
                    {{ permission.key }}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Bar -->
      <div class="flex items-center justify-between border-t border-default pt-4">
        <div class="text-[11px] text-slate-500 dark:text-slate-400">
          <span v-if="hasChanges" class="text-amber-600 dark:text-amber-400 font-semibold">
            Unsaved permission adjustments detected.
          </span>
          <span v-else>
            No unsaved permission changes.
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-md btn-secondary"
            :disabled="isSaving || !hasChanges"
            @click="discardChanges"
          >
            Discard
          </button>
          <button
            type="button"
            class="btn-md btn-primary gap-1.5"
            :disabled="isSaving || !hasChanges"
            @click="savePermissions"
          >
            <span v-if="isSaving">Saving…</span>
            <span v-else>Save Permissions</span>
          </button>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import {
  PhCaretDown,
  PhMagnifyingGlass,
  PhX,
  PhArrowsOut,
  PhArrowsIn,
  PhArrowCounterClockwise,
  PhUsers,
  PhGraduationCap,
  PhBuildings,
  PhGear,
  PhChartBar,
  PhHouse,
  PhHandshake,
  PhCoins,
  PhBank,
  PhBriefcase,
  PhFileText
} from '@phosphor-icons/vue';
import { useUpdateUserPermissionsMutation } from '../queries';

const props = defineProps({
  users: { type: Array, default: () => [] },
  roles: { type: Array, default: () => [] },
});
const emit = defineEmits(['saved']);
const store = useStore();

const isEducation = computed(() => store.getters['organization/isEducationTenant']);
const selectedUserId = ref('');
const draft = ref({ added: [], removed: [] });

// UI state: Accordions & Search
const expandedCategories = ref(new Set());
const searchQuery = ref('');

const currentUserId = computed(() => store.state.auth?.currentUser?.id || store.state.auth?.currentUser?._id);

const manageableUsers = computed(() => props.users.filter((user) => {
  const roleCode = getRole(user)?.code;
  return getUserId(user) !== currentUserId.value && roleCode !== 'super_admin';
}));

const selectedUser = computed(() =>
  manageableUsers.value.find((user) => String(getUserId(user)) === String(selectedUserId.value)) || null
);

const basePermissions = computed(() => {
  const r = getRole(selectedUser.value);
  if (!r) return new Set();
  const perms = r.permissions || r.permissionKeys || [];
  if (Array.isArray(perms)) {
    return new Set(perms);
  }
  if (typeof perms === 'object' && perms !== null) {
    const keys = [];
    Object.entries(perms).forEach(([scope, actions]) => {
      if (typeof actions === 'object' && actions !== null) {
        Object.entries(actions).forEach(([action, allowed]) => {
          if (allowed) keys.push(`${scope}.${action}`);
        });
      }
    });
    return new Set(keys);
  }
  return new Set();
});

const { mutateAsync: updateUserPermissions, isPending: isSaving } = useUpdateUserPermissionsMutation();

function getUserId(user) {
  return user?._id || user?.id || '';
}

function getRole(user) {
  if (!user) return null;
  const roleRef = user.roleId || user.role;
  const roleId = typeof roleRef === 'object' ? roleRef?._id || roleRef?.id : roleRef;
  return props.roles.find((role) => String(role._id || role.id) === String(roleId)) || (typeof roleRef === 'object' ? roleRef : null);
}

/**
 * Vertical-aware role display naming
 */
function roleName(user) {
  const role = getRole(user);
  if (!role) return 'Unassigned';
  const code = String(role.code || role.name || '').toLowerCase().replace(/[^a-z_]/g, '');
  const rawName = role.name || role.code || 'Unassigned';

  if (isEducation.value) {
    if (code.includes('super_admin')) return 'Super Admin (Root)';
    if (code.includes('admin') || code.includes('org')) return 'Principal / Organization Admin';
    if (code.includes('manager') && !code.includes('branch')) return 'Admissions Head / Academic Lead';
    if (code.includes('branch')) return 'Campus Director / Branch Head';
    if (code.includes('agent')) return 'Counselor / Admissions Staff';
    if (code.includes('read_only') || code.includes('readonly')) return 'Faculty / Staff View';
    return rawName.replace(/agent/gi, 'Staff').replace(/_/g, ' ');
  } else {
    if (code.includes('super_admin')) return 'Super Admin (Root)';
    if (code.includes('admin') || code.includes('org')) return 'Organization Admin';
    if (code.includes('manager') && !code.includes('branch')) return 'Sales Manager / Team Lead';
    if (code.includes('branch')) return 'Branch Office Manager';
    if (code.includes('agent')) return 'Property Sales Consultant';
    if (code.includes('read_only') || code.includes('readonly')) return 'Auditor / Read-Only Access';
    return rawName.replace(/_/g, ' ');
  }
}

/**
 * STRICTLY ACTIVE PERMISSION CATEGORIES PER VERTICAL
 * Removes all unnecessary, redundant, or dead permissions not active in the system.
 */
const EDUCATION_ACTIVE_CATEGORIES = [
  {
    id: 'leads',
    title: 'Student Leads & Admissions',
    icon: PhGraduationCap,
    description: 'Student inquiries, enrollment, class batches, and counselor assignment',
    permissions: [
      { key: 'leads.read', label: 'View Student Leads & Classes', description: 'Browse student inquiries, batches, and class roster' },
      { key: 'leads.create', label: 'Create Student Inquiry', description: 'Register new admission inquiries and student leads' },
      { key: 'leads.update', label: 'Update Inquiries & Enroll', description: 'Edit inquiry details and enroll students into batches' },
      { key: 'leads.delete', label: 'Delete Student Inquiries', description: 'Remove inactive or cancelled student inquiry records' },
      { key: 'leads.assign', label: 'Assign Leads to Staff', description: 'Assign student inquiries to counselors and staff members' },
    ]
  },
  {
    id: 'users',
    title: 'Staff & Team Management',
    icon: PhUsers,
    description: 'Counselor profiles, staff onboarding, and access credentials',
    permissions: [
      { key: 'users.read', label: 'View Staff Directory', description: 'View staff members, counselors, and faculty directory' },
      { key: 'users.create', label: 'Onboard Staff Members', description: 'Add new staff members with login credentials and roles' },
      { key: 'users.update', label: 'Update Staff Profiles', description: 'Edit staff member details and campus assignments' },
      { key: 'users.delete', label: 'Deactivate / Remove Staff', description: 'Suspend, deactivate, or delete staff accounts' },
    ]
  },
  {
    id: 'branches',
    title: 'Campuses & Center Branches',
    icon: PhBuildings,
    description: 'Regional coaching centers, branches, and campus locations',
    permissions: [
      { key: 'branches.read', label: 'View Campus Centers', description: 'Browse active campus locations and center information' },
      { key: 'branches.create', label: 'Add Campus Branch', description: 'Register new physical centers or campus locations' },
      { key: 'branches.update', label: 'Update Campus Details', description: 'Modify campus address, details, and branch leads' },
    ]
  },
  {
    id: 'reports',
    title: 'Admission Reports & Analytics',
    icon: PhChartBar,
    description: 'Admission conversion trends, inquiry analytics, and student reports',
    permissions: [
      { key: 'reports.view', label: 'View Admission Reports', description: 'Analyze admission velocity and counselor performance' },
      { key: 'reports.export', label: 'Export Reports & Data', description: 'Download student inquiry and enrollment data to Excel / CSV' },
    ]
  },
  {
    id: 'settings',
    title: 'Institute & Workspace Settings',
    icon: PhGear,
    description: 'Institution identity, branding, and workspace configurations',
    permissions: [
      { key: 'settings.view', label: 'View Workspace Settings', description: 'Inspect institute configuration and preferences' },
      { key: 'settings.manage', label: 'Manage Settings & Policies', description: 'Update institute details and global preferences' },
    ]
  }
];

const REAL_ESTATE_ACTIVE_CATEGORIES = [
  {
    id: 'leads',
    title: 'Sales Leads Management',
    icon: PhUsers,
    description: 'Sales inquiries, prospect tracking, and agent lead assignments',
    permissions: [
      { key: 'leads.read', label: 'View Sales Leads', description: 'Browse incoming buyer inquiries and lead pipelines' },
      { key: 'leads.create', label: 'Create Sales Lead', description: 'Capture new property buyer and investor leads' },
      { key: 'leads.update', label: 'Update Lead Details', description: 'Edit requirements, budget, follow-up notes, and stages' },
      { key: 'leads.delete', label: 'Delete Sales Leads', description: 'Remove invalid or spam lead records' },
      { key: 'leads.assign', label: 'Assign Leads to Agents', description: 'Transfer or assign leads to sales agents and consultants' },
    ]
  },
  {
    id: 'deals',
    title: 'Property Deals Pipeline',
    icon: PhHandshake,
    description: 'Deal stages, closing milestones, negotiations, and transaction approvals',
    permissions: [
      { key: 'deals.read', label: 'View Property Deals', description: 'Access deal pipeline and transaction details' },
      { key: 'deals.create', label: 'Create Deal', description: 'Initiate a new property transaction deal' },
      { key: 'deals.update', label: 'Update Deal Progress', description: 'Update milestones, prices, payment schedules, and terms' },
      { key: 'deals.delete', label: 'Delete Deals', description: 'Remove aborted deal records from pipeline' },
      { key: 'deals.approve', label: 'Approve Deals', description: 'Authorize deal closures and financial milestones' },
      { key: 'deals.cancel', label: 'Cancel Deals', description: 'Execute deal cancellations and unit releases' },
    ]
  },
  {
    id: 'properties',
    title: 'Properties & Projects',
    icon: PhHouse,
    description: 'Property inventory, project listings, and builder configurations',
    permissions: [
      { key: 'properties.read', label: 'View Properties & Inventory', description: 'Browse property units, pricing, and project developments' },
      { key: 'properties.create', label: 'Add Property Listing', description: 'Create new property listings or project inventory units' },
      { key: 'properties.update', label: 'Update Property Details', description: 'Edit unit pricing, availability, and specifications' },
      { key: 'properties.delete', label: 'Delete Property Listings', description: 'Remove property listings from active inventory' },
    ]
  },
  {
    id: 'agreements',
    title: 'Agreements & Documentation',
    icon: PhFileText,
    description: 'Sale agreements, booking drafts, and document templates',
    permissions: [
      { key: 'agreements.view', label: 'View Agreements', description: 'Inspect generated agreements and legal contract drafts' },
      { key: 'agreements.create', label: 'Generate Agreements', description: 'Draft and issue new agreements using contract templates' },
    ]
  },
  {
    id: 'commissions',
    title: 'Commissions & Receivables',
    icon: PhCoins,
    description: 'Agent payouts, broker splits, invoicing, and receivables tracking',
    permissions: [
      { key: 'commissions.read', label: 'View Commission Ledgers', description: 'Access agent commission statements and receivables' },
      { key: 'commissions.create', label: 'Create Commission Structures', description: 'Configure commission plans and split agreements' },
      { key: 'commissions.update', label: 'Update Commission Rates', description: 'Adjust brokerage calculations and agent tier splits' },
      { key: 'commissions.approve', label: 'Approve Payouts', description: 'Approve commission disbursement requests' },
    ]
  },
  {
    id: 'loans',
    title: 'Home Loans & DSA',
    icon: PhBank,
    description: 'Buyer loan assistance, bank partners, and disbursement tracking',
    permissions: [
      { key: 'loans.read', label: 'View Loan Applications', description: 'Track buyer loan progress and bank submissions' },
      { key: 'loans.create', label: 'Create Loan File', description: 'Submit new home loan or mortgage applications' },
      { key: 'loans.update', label: 'Update Loan Status', description: 'Update approval stages, banker notes, and sanctions' },
      { key: 'loans.delete', label: 'Delete Loan Records', description: 'Remove cancelled loan applications' },
    ]
  },
  {
    id: 'agents',
    title: 'Channel Partners & External Agents',
    icon: PhBriefcase,
    description: 'Broker network, external agent accounts, and partner agreements',
    permissions: [
      { key: 'agents.read', label: 'View Partner Directory', description: 'Browse registered channel partners and brokers' },
      { key: 'agents.create', label: 'Register Channel Partner', description: 'Onboard external real estate agents and brokers' },
      { key: 'agents.update', label: 'Update Partner Details', description: 'Edit partner tiers, contacts, and commission terms' },
      { key: 'agents.delete', label: 'Delete Partner Record', description: 'Remove channel partner registrations' },
    ]
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: PhChartBar,
    description: 'Revenue forecasts, sales velocity, and business analytics',
    permissions: [
      { key: 'reports.view', label: 'View Sales & Revenue Reports', description: 'Access business intelligence charts and sales metrics' },
      { key: 'reports.export', label: 'Export Reports & Data', description: 'Download CSV / Excel reports for offline analysis' },
    ]
  },
  {
    id: 'users',
    title: 'Team & User Management',
    icon: PhUsers,
    description: 'Internal sales staff, agent logins, and team accounts',
    permissions: [
      { key: 'users.read', label: 'View Team Directory', description: 'Browse all company employees, managers, and agents' },
      { key: 'users.create', label: 'Onboard Team Members', description: 'Create internal user accounts with credentials' },
      { key: 'users.update', label: 'Update User Profiles', description: 'Edit user details, roles, and branch assignments' },
      { key: 'users.delete', label: 'Deactivate / Remove Users', description: 'Suspend or delete team member accounts' },
    ]
  },
  {
    id: 'branches',
    title: 'Branch Offices',
    icon: PhBuildings,
    description: 'Regional branch offices, office heads, and city territories',
    permissions: [
      { key: 'branches.read', label: 'View Branch Offices', description: 'Browse regional office locations and managers' },
      { key: 'branches.create', label: 'Create Branch Office', description: 'Register new regional offices and branches' },
      { key: 'branches.update', label: 'Update Branch Details', description: 'Modify office details and branch management' },
    ]
  },
  {
    id: 'settings',
    title: 'Workspace Settings',
    icon: PhGear,
    description: 'Agency profile, business rules, integrations, and preferences',
    permissions: [
      { key: 'settings.view', label: 'View Settings', description: 'Inspect agency configurations and system preferences' },
      { key: 'settings.manage', label: 'Manage Settings & Automations', description: 'Configure business rules and preferences' },
    ]
  }
];

const activeCategories = computed(() => {
  return isEducation.value ? EDUCATION_ACTIVE_CATEGORIES : REAL_ESTATE_ACTIVE_CATEGORIES;
});

/**
 * Filter categories based on search input
 */
const filteredCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return activeCategories.value;

  return activeCategories.value
    .map((cat) => {
      const catMatches = cat.title.toLowerCase().includes(query) || cat.description.toLowerCase().includes(query);
      const matchingPermissions = cat.permissions.filter(
        (p) =>
          catMatches ||
          p.label.toLowerCase().includes(query) ||
          p.key.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );

      if (matchingPermissions.length === 0) return null;
      return {
        ...cat,
        permissions: matchingPermissions
      };
    })
    .filter(Boolean);
});

// Auto-expand accordions when searching
watch(searchQuery, (q) => {
  if (q.trim()) {
    filteredCategories.value.forEach((c) => expandedCategories.value.add(c.id));
  }
});

// Accordion Helpers
function isExpanded(catId) {
  return expandedCategories.value.has(catId);
}

function toggleCategory(catId) {
  if (expandedCategories.value.has(catId)) {
    expandedCategories.value.delete(catId);
  } else {
    expandedCategories.value.add(catId);
  }
}

const isAllExpanded = computed(() => {
  return (
    filteredCategories.value.length > 0 &&
    filteredCategories.value.every((c) => expandedCategories.value.has(c.id))
  );
});

function toggleAllAccordions() {
  if (isAllExpanded.value) {
    expandedCategories.value.clear();
  } else {
    filteredCategories.value.forEach((c) => expandedCategories.value.add(c.id));
  }
}

// Category status calculation
function isAllowed(key) {
  return draft.value.added.includes(key) || (!draft.value.removed.includes(key) && basePermissions.value.has(key));
}

function getGrantedCount(category) {
  return category.permissions.filter((p) => isAllowed(p.key)).length;
}

function isAllGranted(category) {
  return category.permissions.length > 0 && getGrantedCount(category) === category.permissions.length;
}

function isNoneGranted(category) {
  return getGrantedCount(category) === 0;
}

function getCategoryBadgeText(category) {
  const count = getGrantedCount(category);
  const total = category.permissions.length;
  if (count === total && total > 0) return 'All Granted';
  if (count === 0) return 'None Active';
  return `${count} of ${total} granted`;
}

function getCategoryBadgeClass(category) {
  const count = getGrantedCount(category);
  const total = category.permissions.length;
  if (count === total && total > 0) {
    return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
  }
  if (count === 0) {
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  }
  return 'bg-primary/10 text-primary dark:bg-primary/20 border border-primary/20';
}

// Quick Category Batch Actions
function grantAllInCategory(category) {
  category.permissions.forEach((p) => {
    if (!isAllowed(p.key)) {
      setPermission(p.key, true);
    }
  });
}

function revokeAllInCategory(category) {
  category.permissions.forEach((p) => {
    if (isAllowed(p.key)) {
      setPermission(p.key, false);
    }
  });
}

// Stats
const totalAvailableCount = computed(() => {
  return activeCategories.value.reduce((acc, cat) => acc + cat.permissions.length, 0);
});

const totalActiveCount = computed(() => {
  let count = 0;
  activeCategories.value.forEach((cat) => {
    cat.permissions.forEach((p) => {
      if (isAllowed(p.key)) count++;
    });
  });
  return count;
});

// Draft State
function loadDraft() {
  const overrides = selectedUser.value?.permissionOverrides || {};
  draft.value = {
    added: [...new Set(overrides.added || [])],
    removed: [...new Set(overrides.removed || [])],
  };
}

function setPermission(key, isAllowedForUser) {
  const added = new Set(draft.value.added);
  const removed = new Set(draft.value.removed);
  const inherited = basePermissions.value.has(key);

  if (isAllowedForUser) {
    removed.delete(key);
    if (!inherited) added.add(key);
  } else {
    added.delete(key);
    if (inherited) removed.add(key);
  }
  draft.value = { added: [...added].sort(), removed: [...removed].sort() };
}

function permissionSource(key) {
  if (draft.value.added.includes(key)) return 'Custom grant';
  if (draft.value.removed.includes(key)) return 'Custom deny';
  return 'Role default';
}

function permissionSourceClass(key) {
  if (draft.value.added.includes(key)) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400';
  }
  if (draft.value.removed.includes(key)) {
    return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400';
  }
  return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
}

const hasChanges = computed(() => {
  const overrides = selectedUser.value?.permissionOverrides || {};
  const originalAdded = [...new Set(overrides.added || [])].sort();
  const originalRemoved = [...new Set(overrides.removed || [])].sort();
  return (
    JSON.stringify(draft.value.added) !== JSON.stringify(originalAdded) ||
    JSON.stringify(draft.value.removed) !== JSON.stringify(originalRemoved)
  );
});

function discardChanges() {
  loadDraft();
}

function resetToRole() {
  draft.value = { added: [], removed: [] };
}

async function savePermissions() {
  if (!selectedUser.value) return;
  try {
    await updateUserPermissions({
      id: getUserId(selectedUser.value),
      added: draft.value.added,
      removed: draft.value.removed,
    });
    store.dispatch('notifications/triggerToast', {
      message: `${isEducation.value ? 'Staff' : 'User'} permissions updated successfully.`,
      type: 'success',
    });
    emit('saved');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Unable to update permissions.',
      type: 'error',
    });
  }
}

watch(
  manageableUsers,
  (users) => {
    if (!users.some((user) => String(getUserId(user)) === String(selectedUserId.value))) {
      selectedUserId.value = getUserId(users[0]);
    }
  },
  { immediate: true }
);

watch(selectedUser, loadDraft, { immediate: true });
watch(() => props.roles, loadDraft, { deep: true });
</script>
