<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1
          class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white"
        >
          Tenants
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Create tenants, suspend workspaces, and choose which modules each
          tenant can use.
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="btn btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 self-start"
      >
        <AppIcon name="add" :size="14" weight="bold" />
        <span>Create Tenant</span>
      </button>
    </div>

    <div
      v-if="error"
      class="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300"
    >
      {{ error }}
    </div>

    <div v-if="loading && tenants.length === 0" class="py-24 text-center">
      <div
        class="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"
      ></div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Loading tenants...
      </p>
    </div>

    <div
      v-else
      class="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead
            class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800"
          >
            <tr>
              <th class="py-3 px-4">Tenant</th>
              <th class="py-3 px-4">Slug</th>
              <th class="py-3 px-4">Vertical</th>
              <th class="py-3 px-4">Modules</th>
              <th class="py-3 px-4 text-center">Orgs</th>
              <th class="py-3 px-4 text-center">Users</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
            <tr
              v-for="tenant in tenants"
              :key="tenant._id || tenant.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >
              <td
                class="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100"
              >
                {{ tenant.name }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="font-mono text-xs text-primary dark:text-accent-400 bg-primary/5 dark:bg-primary/15 px-2 py-0.5 rounded border border-primary/20"
                  >{{ tenant.slug }}</span
                >
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {{
                    tenant.domain === "education" ? "Education" : "Real Estate"
                  }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                {{ (tenant.enabledModules || []).length }} enabled
              </td>
              <td
                class="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200"
              >
                {{ tenant.organizationsCount || 0 }}
              </td>
              <td
                class="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200"
              >
                {{ tenant.usersCount || 0 }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20':
                      tenant.status === 'active',
                    'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20':
                      tenant.status === 'suspended',
                    'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20':
                      tenant.status === 'inactive',
                  }"
                >
                  {{ tenant.status }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    title="Edit modules"
                    aria-label="Edit modules"
                    @click="openEditModal(tenant)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-accent-400 transition"
                  >
                    <AppIcon name="modules" :size="15" />
                  </button>
                  <button
                    v-if="tenant.status === 'suspended'"
                    type="button"
                    title="Activate tenant"
                    aria-label="Activate tenant"
                    @click="handleActivate(tenant)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40 transition"
                  >
                    <AppIcon name="play" :size="15" weight="bold" />
                  </button>
                  <button
                    v-else
                    type="button"
                    title="Suspend tenant"
                    aria-label="Suspend tenant"
                    @click="handleSuspend(tenant)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40 transition"
                  >
                    <AppIcon name="pause" :size="15" weight="bold" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="tenants.length === 0">
              <td colspan="8" class="py-12 text-center text-xs text-slate-500">
                No tenants yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        @click.self="showModal = false"
      >
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
        >
          <div
            class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3"
          >
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                {{ editingTenant ? "Edit Tenant Modules" : "Create Tenant" }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Super Admin chooses which product modules this tenant can
                access.
              </p>
            </div>
            <button
              @click="showModal = false"
              class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
              aria-label="Close"
            >
              <AppIcon name="close" :size="14" weight="bold" />
            </button>
          </div>

          <div
            v-if="modalError"
            class="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300"
          >
            {{ modalError }}
          </div>

          <form @submit.prevent="handleSave" class="space-y-4 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-600 dark:text-slate-300"
                >Tenant Name *</label
              >
              <input
                v-model="form.name"
                type="text"
                required
                :disabled="!!editingTenant"
                placeholder="e.g. Swarajya"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </div>
            <div v-if="!editingTenant" class="space-y-1">
              <label class="font-bold text-slate-600 dark:text-slate-300"
                >Slug (optional)</label
              >
              <input
                v-model="form.slug"
                type="text"
                placeholder="swarajya"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div v-if="!editingTenant" class="space-y-2">
              <label class="font-bold text-slate-600 dark:text-slate-300"
                >Vertical *</label
              >
              <div class="grid grid-cols-2 gap-2">
                <label
                  class="flex items-start gap-2 p-3 rounded-xl border cursor-pointer"
                  :class="
                    form.domain === 'realEstate'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70'
                  "
                >
                  <input
                    v-model="form.domain"
                    type="radio"
                    value="realEstate"
                    class="mt-0.5"
                  />
                  <span>
                    <span
                      class="block font-bold text-slate-800 dark:text-slate-200"
                      >Real Estate</span
                    >
                    <span class="block text-[11px] text-slate-500"
                      >Current CRM: properties, clients, deals.</span
                    >
                  </span>
                </label>
                <label
                  class="flex items-start gap-2 p-3 rounded-xl border cursor-pointer"
                  :class="
                    form.domain === 'education'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70'
                  "
                >
                  <input
                    v-model="form.domain"
                    type="radio"
                    value="education"
                    class="mt-0.5"
                  />
                  <span>
                    <span
                      class="block font-bold text-slate-800 dark:text-slate-200"
                      >Education</span
                    >
                    <span class="block text-[11px] text-slate-500"
                      >Classes, students, and student leads.</span
                    >
                  </span>
                </label>
              </div>
            </div>
            <div v-else class="space-y-1">
              <label class="font-bold text-slate-600 dark:text-slate-300"
                >Vertical</label
              >
              <p
                class="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                {{
                  form.domain === "education"
                    ? "Education (locked after create)"
                    : "Real Estate (locked after create)"
                }}
              </p>
            </div>
            <div class="space-y-2">
              <label class="font-bold text-slate-600 dark:text-slate-300"
                >Enabled Modules</label
              >
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="mod in modules"
                  :key="mod.key"
                  class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <input
                    v-model="form.enabledModules"
                    type="checkbox"
                    :value="mod.key"
                    class="rounded border-slate-400 text-primary focus:ring-primary"
                  />
                  <span class="text-slate-800 dark:text-slate-200">{{
                    mod.label
                  }}</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                @click="showModal = false"
                class="btn btn-secondary px-3 py-2 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold"
              >
                {{
                  saving
                    ? "Saving..."
                    : editingTenant
                      ? "Save Modules"
                      : "Create Tenant"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Swal from "sweetalert2";
import {
  activateTenant,
  createTenant,
  fetchTenantModules,
  fetchTenants,
  suspendTenant,
  updateTenant,
} from "../api/endpoints";

const tenants = ref([]);
const modules = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const modalError = ref("");
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
