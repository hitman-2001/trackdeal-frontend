<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="font-heading text-lg font-semibold text-slate-800">
        Reset Your Password
      </h3>
      <p class="text-[10px] text-slate-500 mt-1">
        Enter your official email address and we'll dispatch a link to reset your password.
      </p>
    </div>

    <!-- Success Feedback Panel -->
    <div 
      v-if="isSuccess" 
      class="p-4 bg-success-bg border border-success-border text-success-text rounded-lg text-xs space-y-2 text-center"
    >
      <div class="flex justify-center mb-1">
        <PhEnvelope class="w-8 h-8 text-success-text" />
      </div>
      <p class="font-semibold text-neutral-900 dark:text-neutral-50 text-sm">Reset email sent!</p>
      <p class="text-caption text-neutral-500">
        We have dispatched a temporary link to <strong class="text-neutral-900 dark:text-neutral-50">{{ email }}</strong>. Please check your inbox.
      </p>
      <router-link to="/login" class="text-xs font-semibold text-accent-600 block mt-4 hover:underline">
        Back to Login
      </router-link>
    </div>

    <template v-else>
      <!-- Exception Alerts -->
      <div 
        v-if="errorMessage" 
        class="p-3 bg-danger-bg border border-danger-border text-danger-text rounded-lg text-xs font-semibold"
      >
        {{ errorMessage }}
      </div>

      <!-- Recovery Form -->
      <form @submit="onSubmit" class="space-y-4">
        <!-- Email Input -->
        <div class="space-y-1">
          <label for="email" class="label-text" :class="{ 'label-required': true }">
            Email Address
          </label>
          <input 
            id="email"
            v-model="email"
            type="email"
            placeholder="name@company.com"
            class="input-field text-caption text-neutral-900"
            :class="{ 'input-field-error': errors.email }"
            :disabled="isPending"
          />
          <span v-if="errors.email" class="text-[10px] text-danger-text block mt-1">
            {{ errors.email }}
          </span>
        </div>

        <button 
          type="submit" 
          class="w-full btn btn-primary h-10 text-xs font-semibold"
          :disabled="isPending"
        >
          <PhSpinner v-if="isPending" class="animate-spin w-4 h-4 mr-2" />
          <span>{{ isPending ? 'Dispatching Link...' : 'Send Reset Link' }}</span>
        </button>
      </form>

      <div class="text-center mt-4">
        <router-link to="/login" class="text-caption font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
          ← Back to Login
        </router-link>
      </div>
    </template>

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

onMounted(() => {
  store.dispatch('notifications/triggerToast', {
    message: 'Password management is handled directly by your organization administrator.',
    type: 'info',
  });
  router.replace('/login');
});
</script>
