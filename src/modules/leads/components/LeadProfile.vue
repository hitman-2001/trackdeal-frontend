<template>
  <section class="lead-profile section-panel" aria-label="Lead profile">
    <div class="profile-section">
      <header>
        <AppIcon :name="lead.isTransferred ? 'lock' : 'user'" :size="17" />
        <h2>
          {{ lead.isTransferred ? "Transfer details" : "Contact details" }}
        </h2>
        <button
          v-if="canEditLead"
          type="button"
          class="btn-sm btn-ghost ml-auto"
          @click="$emit('edit')"
        >
          <AppIcon name="note" :size="14" />Edit lead
        </button>
      </header>
      <template v-if="lead.isTransferred"
        ><dl>
          <div>
            <dt>Received from</dt>
            <dd>
              {{ lead.receivedFrom?.organizationName || "Partner broker" }}
            </dd>
          </div>
          <div v-if="lead.receivedFrom?.transferredByName">
            <dt>Transferred by</dt>
            <dd>{{ lead.receivedFrom.transferredByName }}</dd>
          </div>
          <div v-if="lead.receivedFrom?.transferredAt">
            <dt>Received on</dt>
            <dd>
              {{
                new Date(lead.receivedFrom.transferredAt).toLocaleDateString()
              }}
            </dd>
          </div>
          <div v-if="lead.receivedFrom?.remarks">
            <dt>Remarks</dt>
            <dd>{{ lead.receivedFrom.remarks }}</dd>
          </div>
        </dl>
        <p class="profile-hint">
          Contact information is managed by the original broker.
        </p></template
      >
      <dl v-else>
        <div>
          <dt>Phone</dt>
          <dd>
            <a v-if="lead.mobile" :href="`tel:${lead.mobile}`">{{
              lead.mobile
            }}</a
            ><span v-else>Not provided</span>
          </dd>
        </div>
        <div v-if="lead.alternativeMobile">
          <dt>Alternate phone</dt>
          <dd>{{ lead.alternativeMobile }}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a v-if="lead.email" :href="`mailto:${lead.email}`">{{
              lead.email
            }}</a
            ><span v-else>Not provided</span>
          </dd>
        </div>
      </dl>
    </div>
    <div class="profile-section">
      <header>
        <AppIcon name="house" :size="17" />
        <h2>Buyer preferences</h2>
      </header>
      <dl>
        <div>
          <dt>Property type</dt>
          <dd>{{ humanize(join(requirement.propertyType)) }}</dd>
        </div>
        <div>
          <dt>Configuration</dt>
          <dd>{{ join(requirement.bhk) || "Not specified" }}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>
            {{
              requirement.preferredLocation ||
              requirement.locality ||
              join(requirement.locations) ||
              "Not specified"
            }}
          </dd>
        </div>
        <div>
          <dt>Possession</dt>
          <dd>{{ humanize(requirement.possessionPreference) }}</dd>
        </div>
        <div>
          <dt>Purpose</dt>
          <dd>{{ humanize(requirement.purpose) }}</dd>
        </div>
      </dl>
    </div>
    <div class="profile-section">
      <header>
        <AppIcon name="bank" :size="17" />
        <h2>Financial profile</h2>
      </header>
      <dl>
        <div>
          <dt>Loan required</dt>
          <dd>{{ humanize(lead.financialRequirement?.loanRequired) }}</dd>
        </div>
        <template v-if="lead.financialRequirement?.loanRequired === 'yes'"
          ><div>
            <dt>Preferred bank</dt>
            <dd>
              {{ lead.financialRequirement?.preferredBank || "Not specified" }}
            </dd>
          </div>
          <div>
            <dt>Loan status</dt>
            <dd>{{ humanize(lead.financialRequirement?.loanStatus) }}</dd>
          </div></template
        >
      </dl>
      <router-link
        v-if="lead.financialRequirement?.loanRequired === 'yes'"
        to="/app/loans"
        class="profile-loan-link"
        >View loan cases <AppIcon name="arrowRight" :size="14"
      /></router-link>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
const props = defineProps({ lead: { type: Object, required: true } });
defineEmits(["edit"]);
const store = useStore();
const canEditLead = computed(() => Boolean(store.getters['permissions/hasCapability']?.('leads.update')));
const requirement = computed(
  () => props.lead.buyerRequirement || props.lead.requirements || {},
);
const join = (value) => (Array.isArray(value) ? value.join(", ") : value);
const humanize = (value) =>
  value
    ? String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Not specified";
</script>

<style scoped>
.lead-profile {
  padding: 0;
}
.profile-section {
  padding: 22px 24px;
  border-bottom: 1px solid hsl(var(--neutral-100));
}
.profile-section:last-child {
  border: 0;
}
header {
  display: flex;
  gap: 9px;
  align-items: center;
  color: hsl(var(--neutral-400));
  margin-bottom: 18px;
}
h2 {
  color: hsl(var(--neutral-900));
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.015em;
}
dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 30px;
}
dt {
  font-size: 11px;
  color: hsl(var(--neutral-500));
  margin-bottom: 5px;
}
dd {
  font-size: 13px;
  color: hsl(var(--neutral-900));
  font-weight: 500;
  overflow-wrap: anywhere;
}
dd a {
  color: hsl(var(--neutral-900));
}
dd a:hover {
  text-decoration: underline;
  color: hsl(var(--accent-600));
}
.profile-hint {
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--neutral-500));
  margin-top: 16px;
}
.profile-loan-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: hsl(var(--accent-600));
  font-size: 12px;
  min-height: 40px;
  margin-top: 12px;
}
@media (max-width: 640px) {
  .profile-section {
    padding: 20px;
  }
  dl {
    gap: 18px;
  }
}
@media (max-width: 380px) {
  dl {
    grid-template-columns: 1fr;
  }
}
</style>
