<template>
  <div class="workspace-page education-list pb-16">
    <!-- Page Header (Section 6 Standard) -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl sm:text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Student Leads
          </h1>
          <p class="text-xs sm:text-[13px] text-slate-500 mt-0.5 hidden sm:block">
            Admission inquiries. Convert a lead into an enrolled student.
          </p>
        </div>
        <!-- Compact Add Button for Mobile Screen Header -->
        <button
          v-if="canCreateLead"
          class="sm:hidden btn btn-primary btn-sm rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          @click="openCreate"
        >
          <PhPlus :size="14" weight="bold" />
          <span>Add Lead</span>
        </button>
      </div>

      <!-- Desktop Action Buttons (sm and above) -->
      <div class="hidden sm:flex items-center gap-2.5 flex-wrap">
        <button
          v-if="canAssignLeads && selectedRows.length > 0"
          @click="openBulkAssign"
          class="btn btn-secondary btn-sm flex items-center gap-1.5"
          title="Assign selected leads to staff"
        >
          <PhUserPlus :size="15" weight="bold" />
          <span>Assign staff ({{ selectedRows.length }})</span>
        </button>

        <button
          v-if="canBulkUpload"
          @click="showBulkUpload = true"
          class="btn btn-secondary btn-sm flex items-center gap-1.5"
          title="Bulk Upload Student Leads from Excel (.xlsx, .csv)"
        >
          <PhFileArrowUp :size="15" weight="bold" />
          <span>Import Excel</span>
        </button>
        <button
          v-if="canCreateLead"
          class="btn btn-primary btn-sm flex items-center gap-1.5"
          @click="openCreate"
        >
          <PhPlus :size="15" weight="bold" />
          <span>Add Student Lead</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar (Equal Heights & Clean Responsive Grid) -->
    <div
      class="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 sm:bg-surface border border-slate-100 dark:border-slate-800 sm:border-default grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 shadow-xs"
      :class="canFilterAllStaff ? 'lg:grid-cols-3' : 'lg:grid-cols-2'"
    >
      <div class="relative w-full">
        <PhMagnifyingGlass :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
        <input
          v-model="search"
          type="text"
          placeholder="Search student lead..."
          class="filter-control !pl-10 w-full"
          @input="handleSearch"
        />
      </div>
      <select
        v-model="statusFilter"
        class="filter-control w-full"
        @change="onFilterChange"
      >
        <option value="">All statuses</option>
        <option value="interested">Interested</option>
        <option value="call_back">Call Back</option>
        <option value="future_prospect">Future Prospect</option>
        <option value="enrolled">Enrolled</option>
        <option value="not_interested">Not Interested</option>
      </select>
      <select
        v-if="canFilterAllStaff"
        v-model="staffFilter"
        class="filter-control w-full"
        @change="onFilterChange"
      >
        <option value="">All staff</option>
        <option v-for="s in staffList" :key="s._id || s.id" :value="s._id || s.id">
          {{ s.firstName }} {{ s.lastName || '' }}
        </option>
      </select>
    </div>

    <!-- Desktop Data Table Card (sm and above) -->
    <div class="hidden sm:block rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
      <AppTable
        :rows="rows"
        :columns="columns"
        :isLoading="loading"
        :pagination="pagination"
        selectable
        :selectedRows="selectedRows"
        row-actions-label="Actions"
        empty-title="No student leads yet"
        empty-subtext="Add an inquiry or import from Excel to get started."
        @selectionChange="handleSelectionChange"
        @rowClick="openDetails"
        @pageChange="handlePageChange"
        @pageSizeChange="handlePageSizeChange"
      >
        <template #cell(student)="{ row }">
          <div class="font-bold text-slate-800 dark:text-slate-200">
            {{ row.firstName }} {{ row.lastName }}
          </div>
          <div class="text-slate-500 text-[11px] font-mono">{{ row.mobile }}</div>
        </template>

        <template #cell(parent)="{ row }">
          <div class="text-slate-700 dark:text-slate-300 text-xs">
            {{ row.parentName || "—" }}
          </div>
        </template>

        <template #cell(class)="{ row }">
          <span
            class="inline-flex max-w-[10rem] truncate px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50"
            :title="row.classInterestId?.name || ''"
          >
            {{ row.classInterestId?.name || "—" }}
          </span>
        </template>

        <template #cell(staff)="{ row }">
          <div v-if="row.assignedTo" class="flex items-center gap-1.5 min-w-0">
            <span
              class="shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase"
            >
              {{ (row.assignedTo.firstName || "?").charAt(0) }}
            </span>
            <span class="truncate text-slate-700 dark:text-slate-300 text-xs">
              {{ row.assignedTo.firstName }} {{ row.assignedTo.lastName || "" }}
            </span>
          </div>
          <span v-else class="text-[11px] text-slate-400 italic">Unassigned</span>
        </template>

        <template #cell(status)="{ row }">
          <button
            type="button"
            @click.stop="openStatusModal(row)"
            class="group inline-flex items-center gap-1.5 transition-transform hover:scale-[1.02] text-left cursor-pointer"
            title="Click to update status & sub-status"
          >
            <StatusBadge :status="row.status" :subStatus="row.subStatus" />
            <PhPencilSimple
              :size="12"
              class="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>
        </template>

        <template #rowActions="{ row }">
          <!-- Single 3-Dots Action Menu Trigger -->
          <button
            type="button"
            @click.stop="toggleActionMenu(row, $event)"
            title="Actions"
            class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            :class="{ 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200': activeMenuRowId === (row._id || row.id) }"
          >
            <PhDotsThreeVertical :size="18" weight="bold" />
          </button>
        </template>
      </AppTable>
    </div>

    <!-- Mobile Card View (< 640px) -->
    <div class="block sm:hidden space-y-3">
      <!-- Loading Skeleton for Mobile -->
      <div v-if="loading" class="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="font-medium">Loading leads...</span>
      </div>

      <!-- Empty State for Mobile -->
      <div v-else-if="rows.length === 0" class="py-16 text-center space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-400 flex items-center justify-center mx-auto">
          <PhUserPlus :size="28" />
        </div>
        <div>
          <p class="font-bold text-slate-800 text-base">No student leads yet</p>
          <p class="text-sm text-slate-400 mt-1">Tap the + button to add your first lead.</p>
        </div>
      </div>

      <!-- Lead Cards Feed -->
      <div
        v-else
        v-for="row in rows"
        :key="row._id || row.id"
        @click="openDetails(row)"
        class="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 space-y-3 active:scale-[0.99] transition-all cursor-pointer"
      >
        <!-- Header: Student Name + Status Badge (No initials box, ample width) -->
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <h3 class="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
              {{ row.firstName }} {{ row.lastName || '' }}
            </h3>
            <!-- Phone & Class/Batch tags directly below name -->
            <div class="flex items-center flex-wrap gap-2 mt-1.5">
              <a
                v-if="row.mobile"
                :href="'tel:' + row.mobile"
                @click.stop
                class="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <PhPhone :size="12" weight="bold" />
                <span>{{ row.mobile }}</span>
              </a>
              <span
                v-if="row.classInterestId?.name"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40"
              >
                <PhBookOpen :size="11" weight="bold" />
                <span>{{ row.classInterestId.name }}</span>
              </span>
            </div>
          </div>

          <!-- Capsule Status Badge (Tap to update) -->
          <button
            type="button"
            @click.stop="openStatusModal(row)"
            class="shrink-0 active:scale-95 transition-transform"
            title="Tap to update status"
          >
            <StatusBadge :status="row.status" :subStatus="row.subStatus" />
          </button>
        </div>

        <!-- Metadata Grid: Parent & Assigned Staff (No cramped chips) -->
        <div class="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-neutral-800 text-xs">
          <div class="min-w-0">
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Parent</span>
            <span class="font-semibold text-slate-700 dark:text-slate-200 truncate block text-[12px] mt-0.5">
              {{ row.parentName || '—' }}
            </span>
          </div>
          <div class="min-w-0">
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Assigned Staff</span>
            <span class="font-semibold text-slate-700 dark:text-slate-200 truncate block text-[12px] mt-0.5">
              {{ row.assignedTo ? `${row.assignedTo.firstName || ''} ${row.assignedTo.lastName || ''}`.trim() : 'Unassigned' }}
            </span>
          </div>
        </div>

        <!-- Touch Action Row (Matching Platform Blue Standard) -->
        <div class="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-neutral-800" @click.stop>
          <a
            v-if="row.mobile"
            :href="'tel:' + row.mobile"
            class="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <PhPhoneCall :size="14" weight="bold" class="text-slate-500 dark:text-slate-400" />
            <span>Call</span>
          </a>
          <a
            v-if="row.mobile"
            :href="getWhatsAppUrl(row.mobile)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <PhWhatsappLogo :size="15" weight="fill" class="text-slate-500 dark:text-slate-400" />
            <span>WhatsApp</span>
          </a>
          <button
            type="button"
            @click="openStatusModal(row)"
            class="flex-1 h-9 rounded-xl btn-primary flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
          >
            <PhArrowsClockwise :size="14" weight="bold" />
            <span>Status</span>
          </button>
          <button
            type="button"
            @click="toggleActionMenu(row, $event)"
            class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center transition-all active:scale-[0.98]"
            title="More actions"
          >
            <PhDotsThreeVertical :size="16" weight="bold" />
          </button>
        </div>
      </div>

      <!-- Mobile Pagination Controls -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-xs font-semibold">
        <button
          type="button"
          :disabled="pagination.page <= 1"
          @click="handlePageChange(pagination.page - 1)"
          class="h-9 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
        >
          Previous
        </button>
        <span class="text-slate-400 font-medium">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button
          type="button"
          :disabled="pagination.page >= pagination.totalPages"
          @click="handlePageChange(pagination.page + 1)"
          class="h-9 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Floating 3-Dots Action Dropdown Menu -->
    <Teleport to="body">
      <div
        v-if="activeMenuRowId"
        class="fixed inset-0 z-[1000]"
        @click="closeActionMenu"
      >
        <div
          class="fixed w-52 rounded-xl bg-surface border border-default shadow-xl p-1.5 z-[1001] text-xs space-y-0.5"
          :style="{
            top: menuPosition.top,
            bottom: menuPosition.bottom,
            right: menuPosition.right,
          }"
          @click.stop
        >
          <!-- 1. View Details -->
          <button
            type="button"
            @click="handleView(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhEye :size="15" weight="bold" class="text-indigo-600" />
            <span>View Details</span>
          </button>

          <!-- 2. Update Status (Maglo selector) -->
          <button
            type="button"
            @click="handleUpdateStatus(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhArrowsClockwise :size="15" weight="bold" class="text-blue-600" />
            <span>Update Status</span>
          </button>

          <!-- 3. Log Interaction -->
          <button
            type="button"
            @click="handleLog(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhNotePencil :size="15" weight="bold" class="text-emerald-600" />
            <span>Log Interaction</span>
          </button>

          <!-- 4. Edit Lead -->
          <button
            v-if="canEditLead"
            type="button"
            @click="handleEdit(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhPencilSimple :size="15" weight="bold" class="text-blue-600" />
            <span>Edit Lead</span>
          </button>

          <!-- 4. Assign Staff -->
          <button
            v-if="canAssignLeads"
            type="button"
            @click="handleAssign(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhUserPlus :size="15" weight="bold" class="text-purple-600" />
            <span>Assign Staff</span>
          </button>

          <!-- 5. Convert to Student -->
          <button
            v-if="activeMenuRow?.status !== 'enrolled' && activeMenuRow?.status !== 'converted'"
            type="button"
            @click="handleEnroll(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhCheckCircle :size="15" weight="bold" class="text-teal-600" />
            <span>Convert to Student</span>
          </button>

          <!-- 6. Delete Lead (Destructive) -->
          <template v-if="canDeleteLeads">
            <div class="my-1 border-t border-slate-100 dark:border-slate-800"></div>
            <button
              type="button"
              @click="handleDelete(activeMenuRow)"
              class="w-full px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 transition-colors font-medium rounded-lg"
            >
              <PhTrash :size="15" weight="bold" />
              <span>Delete</span>
            </button>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- Student Details & Conversation History Drawer (Read-Only View) -->
    <EducationLeadDrawer
      :isOpen="isDetailsOpen"
      :leadId="activeLeadId"
      @close="isDetailsOpen = false"
      @log-interaction="handleLogFromDrawer"
      @updated="load"
    />

    <!-- Edit Student Lead Drawer (Strictly Editing) -->
    <EducationLeadEditDrawer
      :isOpen="isEditOpen"
      :leadId="activeEditLeadId"
      @close="isEditOpen = false"
      @success="handleEditSuccess"
    />

    <!-- Log Update / Conversation Drawer (Strictly Logging Updates) -->
    <EducationLeadLogDrawer
      :isOpen="isLogOpen"
      :leadId="activeLogLeadId"
      :lead="activeLogLead"
      @close="isLogOpen = false"
      @success="handleLogSuccess"
    />

    <!-- Set Follow-up Reminder Modal (Strictly Setting Reminder) -->
    <EducationLeadReminderModal
      :isOpen="isReminderOpen"
      :lead="activeReminderLead"
      @close="isReminderOpen = false"
      @success="handleReminderSuccess"
    />

    <!-- Assign Modal -->
    <LeadAssignModal
      :isOpen="isAssignOpen"
      :leadIds="targetAssignIds"
      staff-mode
      @close="isAssignOpen = false"
      @success="handleAssignSuccess"
    />

    <!-- Right-Side Modal Drawer: Add Student Lead -->
    <AppDrawer
      :isOpen="showModal"
      title="Add Student Lead"
      subtitle="Capture inquiry details and associate interested course or class"
      width="520px"
      @close="showModal = false"
    >
      <form id="lead-form" class="space-y-4 text-xs" @submit.prevent="save">
        <p
          v-if="error"
          class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900"
        >
          {{ error }}
        </p>
        <div class="modal-form-grid">
          <div class="modal-form-group">
            <label class="modal-form-label">First name <span class="required-star">*</span></label>
            <input
              v-model="form.firstName"
              required
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Last name</label>
            <input
              v-model="form.lastName"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Mobile <span class="required-star">*</span></label>
            <input
              v-model="form.mobile"
              required
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Source</label>
            <select
              v-model="form.source"
              class="modal-form-select"
            >
              <option value="walk_in">Walk-in</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="campus">Campus</option>
              <option value="manual_entry">Manual</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Parent name</label>
            <input
              v-model="form.parentName"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Parent mobile</label>
            <input
              v-model="form.parentMobile"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group col-span-full">
            <label class="modal-form-label">Interested class</label>
            <select
              v-model="form.classInterestId"
              class="modal-form-select"
            >
              <option value="">Select class</option>
              <option v-for="c in classes" :key="c._id" :value="c._id">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="showModal = false"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="lead-form"
          class="btn btn-primary btn-sm"
          :disabled="saving"
        >
          {{ saving ? "Saving..." : "Save Student Lead" }}
        </button>
      </template>
    </AppDrawer>

    <!-- Right-Side Modal Drawer: Enroll Student -->
    <AppDrawer
      :isOpen="!!enrollLead"
      :title="
        enrollLead
          ? `Enroll ${enrollLead.firstName} ${enrollLead.lastName || ''}`
          : 'Enroll Student'
      "
      subtitle="Select the batch or class to complete enrollment"
      width="440px"
      @close="enrollLead = null"
    >
      <form id="enroll-form" class="space-y-4 text-xs" @submit.prevent="enroll">
        <p
          v-if="error"
          class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900"
        >
          {{ error }}
        </p>
        <div class="modal-form-group">
          <label class="modal-form-label">Class <span class="required-star">*</span></label>
          <select
            v-model="enrollClassId"
            required
            class="modal-form-select"
          >
            <option value="" disabled>Select class to enroll into</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">
              {{ c.name }} ({{ c.code }})
            </option>
          </select>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="enrollLead = null"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="enroll-form"
          class="btn btn-primary btn-sm"
          :disabled="saving"
        >
          {{ saving ? "Enrolling..." : "Confirm Enrollment" }}
        </button>
      </template>
    </AppDrawer>

    <!-- Lead Bulk Upload Modal (Opens from right side) -->
    <LeadBulkUploadModal
      :isOpen="showBulkUpload"
      :availableClasses="classes"
      @close="showBulkUpload = false"
      @success="load"
    />

    <!-- Delete Confirmation Modal (Section 19) -->
    <DeleteConfirmModal
      :isOpen="isDeleteOpen"
      title="Delete Student Lead?"
      message="This action cannot be undone."
      :itemName="leadToDeleteName"
      :loading="isDeleting"
      @cancel="isDeleteOpen = false"
      @confirm="confirmDeleteLead"
    />

    <!-- Maglo Status & Sub-Status Modal -->
    <EducationLeadStatusModal
      :isOpen="isStatusModalOpen"
      :lead="activeStatusLead"
      @close="isStatusModalOpen = false"
      @saved="handleStatusModalSaved"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import {
  PhFileArrowUp,
  PhCheckCircle,
  PhUserPlus,
  PhEye,
  PhPencilSimple,
  PhBell,
  PhDotsThreeVertical,
  PhNotePencil,
  PhPlus,
  PhTrash,
  PhMagnifyingGlass,
  PhArrowsClockwise,
  PhPhone,
  PhPhoneCall,
  PhWhatsappLogo,
  PhUser,
  PhBookOpen,
  PhUsersThree,
} from "@phosphor-icons/vue";
import AppTable from "@/components/AppTable.vue";
import AppDrawer from "@/components/AppDrawer.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import EducationLeadDrawer from "../components/EducationLeadDrawer.vue";
import EducationLeadEditDrawer from "../components/EducationLeadEditDrawer.vue";
import EducationLeadLogDrawer from "../components/EducationLeadLogDrawer.vue";
import EducationLeadReminderModal from "../components/EducationLeadReminderModal.vue";
import EducationLeadStatusModal from "../components/EducationLeadStatusModal.vue";
import LeadAssignModal from "@/modules/leads/components/LeadAssignModal.vue";
import LeadBulkUploadModal from "@/modules/leads/components/LeadBulkUploadModal.vue";
import apiClient from "@/api/client";
import {
  createEducationLead,
  deleteEducationLead,
  enrollEducationLead,
  fetchEducationClasses,
  fetchEducationLeads,
} from "../api/endpoints";

const store = useStore();
const isOrgAdmin = computed(() =>
  ["super_admin", "system_admin", "org_admin", "organization_admin"].includes(
    String(store.getters["auth/userRole"] || "").toLowerCase(),
  ),
);
const canCreateLead = computed(() => {
  return isOrgAdmin.value || Boolean(store.getters["permissions/hasCapability"]?.("leads.create"));
});
const canEditLead = computed(() => {
  return isOrgAdmin.value || Boolean(store.getters["permissions/hasCapability"]?.("leads.update"));
});
const canDeleteLeads = computed(() => {
  return isOrgAdmin.value || Boolean(store.getters["permissions/hasCapability"]?.("leads.delete"));
});
const canAssignLeads = computed(() => {
  return isOrgAdmin.value || Boolean(store.getters["permissions/hasCapability"]?.("leads.assign"));
});
const canBulkUpload = computed(() => {
  const role = String(store.getters["auth/userRole"] || "").toLowerCase();
  const isPrivilegedRole = [
    "super_admin",
    "system_admin",
    "org_admin",
    "organization_admin",
    "manager",
    "branch_manager",
  ].includes(role);
  return isPrivilegedRole || Boolean(store.getters["permissions/hasCapability"]?.("leads.bulk_upload"));
});
// "All staff" filter dropdown should ONLY be visible to elevated roles (admin/manager) who can manage assignments
// Regular staff should NEVER see the "All staff" dropdown!
const canFilterAllStaff = computed(() => {
  const role = String(store.getters["auth/userRole"] || "").toLowerCase();
  const isElevated = [
    "super_admin",
    "system_admin",
    "org_admin",
    "organization_admin",
    "manager",
    "branch_manager",
  ].includes(role);
  return isElevated && canAssignLeads.value;
});

const columns = computed(() => {
  const cols = [
    { key: "student", label: "Student" },
    { key: "parent", label: "Parent" },
    { key: "class", label: "Interested class" },
  ];
  // Only show "Assigned staff" to admins/managers overseeing staff allocation
  if (canFilterAllStaff.value) {
    cols.push({ key: "staff", label: "Assigned staff" });
  }
  cols.push({ key: "status", label: "Status" });
  return cols;
});

const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 });

function formatStatus(status) {
  return String(status || "new").replace(/_/g, " ");
}

function statusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "enrolled" || value === "converted") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40";
  }
  if (value === "new" || value === "assigned") {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40";
  }
  if (value === "contacted") {
    return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40";
  }
  if (value === "follow_up") {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40";
  }
  if (value === "meeting_scheduled" || value === "counseling_scheduled") {
    return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40";
  }
  if (value === "qualified") {
    return "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40";
  }
  if (value === "application_trial") {
    return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40";
  }
  if (value === "lost") {
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
}

const selectedRows = ref([]);
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const showBulkUpload = ref(false);

const rows = ref([]);
const classes = ref([]);
const loading = ref(false);
const search = ref("");
const statusFilter = ref("");
const staffFilter = ref("");
const sourceFilter = ref("");
const staffList = ref([]);
const showModal = ref(false);
const saving = ref(false);
const error = ref("");
const form = ref({});
const enrollLead = ref(null);
let timer = null;

function getWhatsAppUrl(mobile) {
  if (!mobile) return "#";
  const cleanPhone = String(mobile).replace(/\D/g, "");
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${phone}`;
}

// Delete confirmation state (Section 19)
const isDeleteOpen = ref(false);
const leadToDelete = ref(null);
const isDeleting = ref(false);
const leadToDeleteName = computed(() => {
  if (!leadToDelete.value) return "";
  return `${leadToDelete.value.firstName} ${leadToDelete.value.lastName || ""}`.trim();
});

const handleDelete = (row) => {
  closeActionMenu();
  leadToDelete.value = row;
  isDeleteOpen.value = true;
};

const confirmDeleteLead = async () => {
  if (!leadToDelete.value) return;
  isDeleting.value = true;
  try {
    const targetId = leadToDelete.value._id || leadToDelete.value.id;
    await deleteEducationLead(targetId);
    isDeleteOpen.value = false;
    leadToDelete.value = null;
    store.dispatch("notifications/triggerToast", {
      message: "Student lead deleted successfully.",
      type: "success",
    });
    await load();
  } catch (err) {
    store.dispatch("notifications/triggerToast", {
      message: err.data?.message || err.message || "Failed to delete student lead.",
      type: "error",
    });
  } finally {
    isDeleting.value = false;
  }
};

// Assignment
const isAssignOpen = ref(false);
const targetAssignIds = ref([]);
const openAssign = (row) => {
  targetAssignIds.value = [row._id || row.id];
  isAssignOpen.value = true;
};
const openBulkAssign = () => {
  targetAssignIds.value = selectedRows.value.map((r) => r._id || r.id);
  isAssignOpen.value = true;
};
const handleAssignSuccess = () => {
  selectedRows.value = [];
  load();
};

// Details Drawer (Read-only View)
const isDetailsOpen = ref(false);
const activeLeadId = ref("");
const openDetails = (row) => {
  activeLeadId.value = row._id || row.id;
  isDetailsOpen.value = true;
};
const handleDetailsSuccess = () => {
  load();
};

// 3-Dots Action Dropdown Menu
const activeMenuRowId = ref("");
const activeMenuRow = ref(null);
const menuPosition = ref({ top: "auto", bottom: "auto", right: "0px" });

const toggleActionMenu = (row, event) => {
  const rowId = row._id || row.id;
  if (activeMenuRowId.value === rowId) {
    closeActionMenu();
    return;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const estimatedMenuHeight = 250;
  const bottomNavHeight = 72;
  const spaceBelow = window.innerHeight - rect.bottom - bottomNavHeight;

  if (spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight) {
    menuPosition.value = {
      top: "auto",
      bottom: `${window.innerHeight - rect.top + 4}px`,
      right: `${Math.max(8, window.innerWidth - rect.right)}px`,
    };
  } else {
    menuPosition.value = {
      top: `${rect.bottom + 4}px`,
      bottom: "auto",
      right: `${Math.max(8, window.innerWidth - rect.right)}px`,
    };
  }
  activeMenuRow.value = row;
  activeMenuRowId.value = rowId;
};

const closeActionMenu = () => {
  activeMenuRowId.value = "";
  activeMenuRow.value = null;
};

// Menu Action Handlers
const isStatusModalOpen = ref(false);
const activeStatusLead = ref(null);

const openStatusModal = (row) => {
  activeStatusLead.value = row;
  isStatusModalOpen.value = true;
};

const handleUpdateStatus = (row) => {
  closeActionMenu();
  openStatusModal(row);
};

const handleStatusModalSaved = () => {
  load();
};

const handleView = (row) => {
  closeActionMenu();
  openDetails(row);
};

const handleEdit = (row) => {
  closeActionMenu();
  openEdit(row);
};

const handleReminder = (row) => {
  closeActionMenu();
  openReminder(row);
};

const handleEnroll = (row) => {
  closeActionMenu();
  openEnroll(row);
};

const handleAssign = (row) => {
  closeActionMenu();
  openAssign(row);
};

// Log Updates Drawer (Strictly Logging Updates)
const isLogOpen = ref(false);
const activeLogLeadId = ref("");
const activeLogLead = ref(null);

const handleLog = (row) => {
  closeActionMenu();
  activeLogLead.value = row;
  activeLogLeadId.value = row._id || row.id;
  isLogOpen.value = true;
};

const handleLogFromDrawer = (lead) => {
  isDetailsOpen.value = false;
  if (lead) {
    handleLog(lead);
  }
};

const handleLogSuccess = () => {
  load();
};

// Edit Drawer
const isEditOpen = ref(false);
const activeEditLeadId = ref("");
const openEdit = (row) => {
  activeEditLeadId.value = row._id || row.id;
  isEditOpen.value = true;
};
const handleEditSuccess = () => {
  load();
};

// Reminder Modal
const isReminderOpen = ref(false);
const activeReminderLead = ref(null);
const openReminder = (row) => {
  activeReminderLead.value = row;
  isReminderOpen.value = true;
};
const handleReminderSuccess = () => {
  load();
};

async function load() {
  loading.value = true;
  try {
    const res = await fetchEducationLeads({
      search: search.value.trim() || undefined,
      status: statusFilter.value || undefined,
      assignedTo: staffFilter.value || undefined,
      source: sourceFilter.value || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
    });
    rows.value = res.data || [];
    const p = res.pagination || {};
    pagination.value = {
      page: Number(p.page) || pagination.value.page,
      limit: Number(p.limit) || pagination.value.limit,
      total: Number(p.total) || rows.value.length,
      totalPages: Number(p.pages || p.totalPages) || 1,
    };
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page) {
  pagination.value.page = page;
  load();
}

function handlePageSizeChange(limit) {
  pagination.value.limit = limit;
  pagination.value.page = 1;
  load();
}

function onFilterChange() {
  pagination.value.page = 1;
  load();
}

function handleSearch() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    pagination.value.page = 1;
    load();
  }, 300);
}

function openCreate() {
  form.value = {
    firstName: "",
    lastName: "",
    mobile: "",
    source: "walk_in",
    parentName: "",
    parentMobile: "",
    classInterestId: "",
  };
  error.value = "";
  showModal.value = true;
}

function openEnroll(row) {
  enrollLead.value = row;
  enrollClassId.value = row.classInterestId?._id || row.classInterestId || "";
  error.value = "";
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    await createEducationLead({
      ...form.value,
      classInterestId: form.value.classInterestId || undefined,
    });
    showModal.value = false;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || "Unable to save lead.";
  } finally {
    saving.value = false;
  }
}

async function enroll() {
  if (!enrollLead.value || !enrollClassId.value) return;
  saving.value = true;
  error.value = "";
  try {
    await enrollEducationLead(enrollLead.value._id, {
      classId: enrollClassId.value,
    });
    enrollLead.value = null;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || "Unable to enroll lead.";
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const fetchStaff = canFilterAllStaff.value
      ? apiClient.get('/users', { params: { limit: 200, status: 'active' }, silent: true, skipErrorToast: true }).catch(() => ({ data: { data: [] } }))
      : Promise.resolve({ data: { data: [] } });

    const [classesRes, staffRes] = await Promise.all([
      fetchEducationClasses({ limit: 100 }).catch(() => ({ data: [] })),
      fetchStaff,
    ]);
    classes.value = classesRes.data || [];
    staffList.value = staffRes.data?.data || [];
  } catch (e) {
    // fallback gracefully
  }
  await load();
});
</script>
