<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="font-heading text-lg font-semibold text-slate-800">
        Accept Your Invitation
      </h3>
      <p class="text-[10px] text-slate-500 mt-1">
        Setup your credentials to join your organization's CRM workspace.
      </p>
    </div>

    <!-- 1. Token Validation Loading State -->
    <div v-if="isValidating" class="py-8 flex flex-col items-center justify-center space-y-3">
      <PhSpinner class="animate-spin text-2xl text-accent-600" />
      <p class="text-xs text-neutral-500">Verifying invitation token...</p>
    </div>

    <!-- 2. Invalid Token State -->
    <div 
      v-else-if="tokenError || !token" 
      class="p-4 bg-danger-bg border border-danger-border text-danger-text rounded-lg text-xs text-center space-y-2"
    >
      <div class="flex justify-center mb-1">
        <PhWarning class="w-8 h-8 text-danger-text" />
      </div>
      <p class="font-semibold text-neutral-900 dark:text-neutral-50 text-sm">Invalid or Expired Invitation</p>
      <p class="text-caption text-neutral-550 leading-relaxed">
        This invitation link has expired or has already been used. Please request a new invitation from your administrator.
      </p>
      <router-link to="/login" class="text-xs font-semibold text-accent-600 block mt-4 hover:underline">
        Back to Login
      </router-link>
    </div>

    <!-- 3. Form Setup State -->
    <template v-else>
      <!-- Invited context banner -->
      <div class="p-3 bg-neutral-25 dark:bg-neutral-900 border border-subtle rounded-lg text-xs space-y-1">
        <p class="text-neutral-500">You have been invited by:</p>
        <p class="font-semibold text-neutral-900 dark:text-neutral-50">{{ inviteDetails.orgName || 'Organization Tenant' }}</p>
        <p class="text-[10px] text-neutral-400">Role: {{ inviteDetails.role || 'Sales Agent' }} | Branch: {{ inviteDetails.branch || 'Head Office' }}</p>
      </div>

      <!-- Exception Banner -->
      <div 
        v-if="errorMessage" 
        class="p-3 bg-danger-bg border border-danger-border text-danger-text rounded-lg text-xs font-semibold"
      >
        {{ errorMessage }}
      </div>

      <!-- Set Credentials Form -->
      <form @submit="onSubmit" class="space-y-4">
        <!-- Password Input -->
        <div class="space-y-1">
          <label for="password" class="label-text" :class="{ 'label-required': true }">
            Set Password
          </label>
          <input 
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="input-field text-caption text-neutral-900"
            :class="{ 'input-field-error': errors.password }"
            :disabled="isPending"
          />
          <span v-if="errors.password" class="text-[10px] text-danger-text block mt-1">
            {{ errors.password }}
          </span>
        </div>

        <!-- Confirm Password Input -->
        <div class="space-y-1">
          <label for="confirmPassword" class="label-text" :class="{ 'label-required': true }">
            Confirm Password
          </label>
          <input 
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="input-field text-caption text-neutral-900"
            :class="{ 'input-field-error': errors.confirmPassword }"
            :disabled="isPending"
          />
          <span v-if="errors.confirmPassword" class="text-[10px] text-danger-text block mt-1">
            {{ errors.confirmPassword }}
          </span>
        </div>

        <!-- Submit button -->
        <button 
          type="submit" 
          class="w-full btn btn-primary h-10 text-xs font-semibold"
          :disabled="isPending"
        >
          <PhSpinner v-if="isPending" class="animate-spin w-4 h-4 mr-2" />
          <span>{{ isPending ? 'Joining Workspace...' : 'Accept & Join' }}</span>
        </button>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { PhSpinner, PhWarning } from '@phosphor-icons/vue';
import { acceptInvitationSchema } from '../schemas/validation';
import { useAcceptInvitationMutation } from '../queries';
import { getErrorMessage } from '@/utils/errorHandler';
import authApi from '../api/endpoints';

const route = useRoute();
const token = ref('');
const isValidating = ref(true);
const tokenError = ref(false);
const errorMessage = ref('');

const inviteDetails = ref({
  orgName: '',
  role: '',
  branch: ''
});

const { errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(acceptInvitationSchema),
  initialValues: {
    password: '',
    confirmPassword: ''
  }
});

const { value: password } = useField('password');
const { value: confirmPassword } = useField('confirmPassword');

const { mutate, isPending } = useAcceptInvitationMutation();

onMounted(async () => {
  if (route.query.token) {
    token.value = String(route.query.token);
    try {
      // API call to validate invitation token validity
      const response = await authApi.validateInvitationToken(token.value);
      const inviteData = response.data || {};
      inviteDetails.value = {
        orgName: inviteData.orgName,
        role: inviteData.role,
        branch: inviteData.branch
      };
      isValidating.value = false;
    } catch (err) {
      tokenError.value = true;
      isValidating.value = false;
    }
  } else {
    isValidating.value = false;
    tokenError.value = true;
  }
});

const onSubmit = handleSubmit((values) => {
  errorMessage.value = '';

  mutate(
    { token: token.value, password: values.password },
    {
      onError: (err) => {
        errorMessage.value = getErrorMessage(
          err,
          'Failed to complete registration. Token may have expired or is invalid.'
        );
      }
    }
  );
});
</script>
