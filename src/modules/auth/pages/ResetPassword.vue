<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="font-heading text-lg font-semibold text-slate-800">
        Choose New Password
      </h3>
      <p class="text-[10px] text-slate-500 mt-1">
        Please configure a strong password containing capital letters, numbers, and symbols.
      </p>
    </div>

    <!-- Missing Token Warning Banner -->
    <div 
      v-if="!token" 
      class="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs text-center space-y-2"
    >
      <p class="font-semibold">Invalid Recovery Token</p>
      <p class="text-[10px] text-slate-500">
        This link is invalid or expired. Please request a new recovery dispatch.
      </p>
      <router-link to="/forgot-password" class="text-xs font-semibold text-primary block mt-4 hover:underline">
        Request New Link
      </router-link>
    </div>

    <template v-else>
      <!-- Exception Banner -->
      <div 
        v-if="errorMessage" 
        class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold"
      >
        {{ errorMessage }}
      </div>

      <!-- Reset Form -->
      <form @submit="onSubmit" class="space-y-4">
        <!-- New Password Input -->
        <div class="space-y-1">
          <label for="password" class="label-text" :class="{ 'label-required': true }">
            New Password
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
            Confirm New Password
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

        <!-- Submit Button -->
        <button 
          type="submit" 
          class="w-full btn btn-primary h-10 text-xs font-semibold"
          :disabled="isPending"
        >
          <PhSpinner v-if="isPending" class="animate-spin w-4 h-4 mr-2" />
          <span>{{ isPending ? 'Saving password...' : 'Update Password' }}</span>
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
import { PhSpinner } from '@phosphor-icons/vue';
import { resetPasswordSchema } from '../schemas/validation';
import { useResetPasswordMutation } from '../queries';
import { getErrorMessage } from '@/utils/errorHandler';

const route = useRoute();
const token = ref('');
const errorMessage = ref('');

const { errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
  initialValues: {
    password: '',
    confirmPassword: ''
  }
});

const { value: password } = useField('password');
const { value: confirmPassword } = useField('confirmPassword');

const { mutate, isPending } = useResetPasswordMutation();

onMounted(() => {
  // Capture recovery token from query parameters
  if (route.query.token) {
    token.value = String(route.query.token);
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
          'Failed to update password. The link may have expired or is invalid.'
        );
      }
    }
  );
});
</script>
