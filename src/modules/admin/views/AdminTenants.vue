<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent-400">
          Cluster Management
        </p>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
          Tenants
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Create cluster tenants, toggle suspensions, and configure accessible product modules.
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="btn btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
      >
        <PhPlus :size="14" weight="bold" />
        <span>Create Tenant</span>
      </button>
    </div>

    <div
      v-if="error"
      class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300"
    >
      {{ error }}
    </div>

    <!-- Tenants AppTable -->
    <div class="rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
      <AppTable
        :rows="tenants"
        :columns="columns"
        :isLoading="loading"
        row-actions-label="Actions"
        empty-title="No tenants found"
        empty-subtext="No cluster tenants have been created yet."
      >
        <!-- Cell: Tenant Name -->
        <template #cell(name)="{ row }">
          <div class="font-bold text-slate-900 dark:text-slate-100 text-xs py-0.5">
            {{ row.name }}
          </div>
        </template>

        <!-- Cell: Tenant Slug -->
        <template #cell(slug)="{ row }">
          <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-primary dark:text-accent-400 border border-slate-200/80 dark:border-slate-700/80">
            {{ row.slug }}
          </span>
        </template>

        <!-- Cell: Vertical -->
        <template #cell(domain)="{ row }">
          <span
            class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
            :class="row.domain === 'education' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'"
          >
            {{ row.domain === "education" ? "Education" : "Real Estate" }}
          </span>
        </template>

        <!-- Cell: Modules -->
        <template #cell(modules)="{ row }">
          <span class="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {{ (row.enabledModules || []).length }} enabled
          </span>
        </template>

        <!-- Cell: Organizations Count -->
        <template #cell(organizationsCount)="{ row }">
          <span class="font-tabular font-bold text-slate-800 dark:text-slate-200 text-xs">
            {{ row.organizationsCount || 0 }}
          </span>
        </template>

        <!-- Cell: Users Count -->
        <template #cell(usersCount)="{ row }">
          <span class="font-tabular font-bold text-slate-800 dark:text-slate-200 text-xs">
            {{ row.usersCount || 0 }}
          </span>
        </template>

        <!-- Cell: Status -->
        <template #cell(status)="{ row }">
          <span
            class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
            :class="{
              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800': row.status === 'active',
              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800': row.status === 'inactive',
              'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800': row.status === 'suspended',
            }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="{
                'bg-emerald-500': row.status === 'active',
                'bg-amber-500': row.status === 'inactive',
                'bg-rose-500': row.status === 'suspended',
              }"
            ></span>
            {{ row.status }}
          </span>
        </template>

        <!-- Row Actions -->
        <template #rowActions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <button
              type="button"
              title="Edit modules"
              aria-label="Edit modules"
              @click="openEditModal(row)"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            >
              <PhSlidersHorizontal :size="15" />
            </button>
            <button
              v-if="row.status === 'suspended'"
              type="button"
              title="Activate tenant"
              aria-label="Activate tenant"
              @click="handleActivate(row)"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <PhPlay :size="14" weight="bold" />
            </button>
            <button
              v-else
              type="button"
              title="Suspend tenant"
              aria-label="Suspend tenant"
              @click="handleSuspend(row)"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <PhPause :size="14" weight="bold" />
            </button>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- Tenant Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        @click.self="showModal = false"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                {{ editingTenant ? "Edit Tenant Modules" : "Create Tenant" }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure module entitlements and vertical domain bindings.
              </p>
            </div>
            <button
              @click="showModal = false"
              class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close"
            >
              <PhX :size="16" weight="bold" />
            </button>
          </div>

          <div
            v-if="modalError"
            class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300"
          >
            {{ modalError }}
          </div>

          <form @submit.prevent="handleSave" class="space-y-4 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Tenant Name *</label>
              <input
                v-model="form.name"
                :disabled="Boolean(editingTenant)"
                required
                placeholder="e.g. Acme Realty Network"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Tenant Slug (Subdomain / Identifier)</label>
              <input
                v-model="form.slug"
                :disabled="Boolean(editingTenant)"
                placeholder="e.g. acme"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 lowercase disabled:opacity-50"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Vertical Domain</label>
              <select
                v-model="form.domain"
                :disabled="Boolean(editingTenant)"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                <option value="realEstate">Real Estate</option>
                <option value="education">Education</option>
              </select>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-bold text-slate-700 dark:text-slate-300">Enabled Feature Modules</label>
                <button
                  type="button"
                  @click="selectAllModules"
                  class="text-[11px] font-semibold text-primary dark:text-accent-400 hover:underline"
                >
                  Select All
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label
                  v-for="mod in modules"
                  :key="mod.key"
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-750 cursor-pointer text-slate-700 dark:text-slate-300 text-xs"
                >
                  <input
                    type="checkbox"
                    :value="mod.key"
                    v-model="form.enabledModules"
                    class="rounded text-primary focus:ring-primary"
                  />
                  <span>{{ mod.name }}</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                @click="showModal = false"
                class="btn btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn btn-primary px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
              >
                <span
                  v-if="saving"
                  class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                <span>{{ editingTenant ? "Save Changes" : "Create Tenant" }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import {
  PhPlus,
  PhSlidersHorizontal,
  PhPlay,
  PhPause,
  PhX,
} from "@phosphor-icons/vue";
import Swal from "sweetalert2";
import AppTable from "@/components/AppTable.vue";
import {
  fetchTenants,
  createTenant,
  updateTenant,
  suspendTenant,
  activateTenant,
  fetchTenantModules,
} from "../api/endpoints";

const loading = ref(false);
const saving = ref(false);
const error = ref("");
const modalError = ref("");
const tenants = ref([]);
const modules = ref([]);

const columns = [
  { key: "name", label: "Tenant Name" },
  { key: "slug", label: "Slug" },
  { key: "domain", label: "Vertical" },
  { key: "modules", label: "Modules" },
  { key: "organizationsCount", label: "Orgs", align: "center" },
  { key: "usersCount", label: "Users", align: "center" },
  { key: "status", label: "Status" },
];

const showModal = ref(false);
const editingTenant = ref(null);
const form = ref({
  name: "",
  slug: "",
  domain: "realEstate",
  enabledModules: [],
});

async function loadTenants() {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetchTenants({ limit: 100 });
    tenants.value = res.data || res || [];
  } catch (err) {
    error.value = err.data?.message || "Unable to load tenants.";
  } finally {
    loading.value = false;
  }
}

async function loadModules(vertical = form.value.domain) {
  try {
    const res = await fetchTenantModules(vertical);
    modules.value = res.data || [];
    form.value.enabledModules = modules.value.map((m) => m.key);
  } catch {
    modules.value = [];
  }
}

function selectAllModules() {
  form.value.enabledModules = modules.value.map((m) => m.key);
}

async function openCreateModal() {
  editingTenant.value = null;
  modalError.value = "";
  form.value = {
    name: "",
    slug: "",
    domain: "realEstate",
    enabledModules: modules.value.map((m) => m.key),
  };
  showModal.value = true;
  await loadModules("realEstate");
}

async function openEditModal(tenant) {
  editingTenant.value = tenant;
  modalError.value = "";
  form.value = {
    name: tenant.name,
    slug: tenant.slug,
    domain: tenant.domain || "realEstate",
    enabledModules: [...(tenant.enabledModules || [])],
  };
  showModal.value = true;
  await loadModules(tenant.domain || "realEstate");
  form.value.enabledModules = [
    ...(tenant.enabledModules || modules.value.map((m) => m.key)),
  ];
}

async function handleSave() {
  saving.value = true;
  modalError.value = "";
  try {
    if (editingTenant.value) {
      await updateTenant(editingTenant.value._id || editingTenant.value.id, {
        enabledModules: form.value.enabledModules,
      });
    } else {
      await createTenant({
        name: form.value.name.trim(),
        slug: form.value.slug.trim() || undefined,
        domain: form.value.domain,
        enabledModules: form.value.enabledModules,
      });
    }
    showModal.value = false;
    await loadTenants();
  } catch (err) {
    modalError.value = err.data?.message || "Unable to save tenant.";
  } finally {
    saving.value = false;
  }
}

async function handleSuspend(tenant) {
  const result = await Swal.fire({
    title: "Confirm",
    text: `Suspend tenant "${tenant.name}"? Users in this tenant will not be able to sign in.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
  });
  if (!result.isConfirmed) return;
  try {
    await suspendTenant(tenant._id || tenant.id);
    await loadTenants();
  } catch (err) {
    error.value = err.data?.message || "Unable to suspend tenant.";
  }
}

async function handleActivate(tenant) {
  try {
    await activateTenant(tenant._id || tenant.id);
    await loadTenants();
  } catch (err) {
    error.value = err.data?.message || "Unable to activate tenant.";
  }
}

watch(
  () => form.value.domain,
  async (vertical, previous) => {
    if (
      !showModal.value ||
      editingTenant.value ||
      !vertical ||
      vertical === previous
    )
      return;
    await loadModules(vertical);
  },
);

onMounted(async () => {
  await Promise.all([loadModules(), loadTenants()]);
});
</script>
