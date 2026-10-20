<template>
  <div class="space-y-6">
    <!-- Header Section (Standard Login) -->
    <div v-if="!isMfaStep" class="login-header text-left">
      <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#213c31] font-heading">
        Sign in to your workspace
      </h2>
      <p class="text-sm text-[#70776f] mt-1.5 leading-relaxed">
        Enter your organization and account details to access your leads and pipelines.
      </p>
    </div>

    <!-- Header Section (Super Admin MFA) -->
    <div v-else class="login-header text-left">
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50 text-[11px] font-semibold mb-2">
        <PhShieldCheck :size="14" weight="bold" class="text-amber-600" />
        <span>Super Admin Security</span>
      </div>
      <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#213c31] font-heading">
        Two-Factor Authentication
      </h2>
      <p class="text-sm text-[#70776f] mt-1.5 leading-relaxed">
        Enter the 6-digit verification code sent to
        <span class="font-mono font-bold text-slate-800 dark:text-slate-100">{{ mfaEmail }}</span>
        to authorize your session.
      </p>
    </div>

    <!-- Server Exception Alerts -->
    <div
      v-if="errorMessage"
      class="p-3.5 bg-red-50/90 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center justify-between gap-2 shadow-sm animate-shake"
    >
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
        <span>{{ errorMessage }}</span>
      </div>
      <button
        type="button"
        @click="errorMessage = ''"
        class="text-red-500 hover:text-red-800 p-1 rounded-md hover:bg-red-100 transition-colors"
        aria-label="Dismiss error"
      >
        <PhX :size="14" weight="bold" />
      </button>
    </div>

    <!-- MFA Verification Form -->
    <form v-if="isMfaStep" @submit.prevent="onVerifyMfa" class="space-y-4">
      <div class="space-y-2">
        <label for="mfaCode" class="block text-xs font-semibold text-[#0f172a]">
          Verification Code <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            id="mfaCode"
            v-model="mfaCode"
            type="text"
            maxlength="6"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="••••••"
            autocomplete="one-time-code"
            autofocus
            class="w-full h-14 px-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] text-center text-2xl font-mono font-bold tracking-[8px] focus:bg-white focus:border-[#0a6ef0] focus:ring-2 focus:ring-[#0a6ef0]/15 outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300"
            :disabled="isVerifyingMfa"
          />
        </div>
        <p class="text-[11px] text-[#94a3b8]">
          The verification code is valid for 10 minutes. Please check your inbox and spam folder.
        </p>
      </div>

      <!-- Verify Button -->
      <button
        type="submit"
        class="w-full h-11 mt-2 bg-[#0a6ef0] hover:bg-[#0056cc] active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-[0_3px_8px_rgba(10,110,240,0.25)] hover:shadow-[0_6px_20px_rgba(10,110,240,0.32)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isVerifyingMfa || mfaCode.trim().length !== 6"
      >
        <AppSpinner v-if="isVerifyingMfa" size="xs" color="white" />
        <span v-if="isVerifyingMfa">Verifying Code...</span>
        <template v-else>
          <span>Verify &amp; Sign In</span>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </button>

      <!-- Actions: Back and Resend -->
      <div class="flex items-center justify-between pt-2 text-xs">
        <button
          type="button"
          @click="onCancelMfa"
          class="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors flex items-center gap-1"
        >
          <PhArrowLeft :size="13" />
          <span>Back to sign in</span>
        </button>

        <button
          type="button"
          @click="onResendMfa"
          :disabled="isResendingMfa || resendCooldown > 0"
          class="text-[#0a6ef0] hover:text-[#0056cc] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isResendingMfa">Sending...</span>
          <span v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
          <span v-else>Resend Code</span>
        </button>
      </div>
    </form>

    <!-- Standard Login Form -->
    <form v-else @submit.prevent="onSubmit" class="space-y-4">
      <!-- Organization Input -->
      <div class="space-y-1.5">
        <label for="organization" class="block text-xs font-semibold text-[#213c31]">
          Organization <span class="text-neutral-400 font-normal">(Required)</span>
        </label>
        <div class="relative">
          <input
            id="organization"
            v-model="organization"
            type="text"
            placeholder="e.g. AcmeCorp or Institute name"
            autocomplete="organization"
            class="w-full h-11 px-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] placeholder-[#94a3b8] text-sm focus:bg-white focus:border-[#0a6ef0] focus:ring-2 focus:ring-[#0a6ef0]/15 outline-none transition-all"
            :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/15': errors.organization }"
            :disabled="isPending"
          />
        </div>
        <span
          v-if="errors.organization"
          class="text-[11px] text-red-600 block mt-1 font-medium"
        >
          {{ errors.organization }}
        </span>
        <span v-else class="text-[11px] text-[#94a3b8] block mt-0.5">
          Your unique organization workspace slug or identifier.
        </span>
      </div>

      <!-- Email Address Input -->
      <div class="space-y-1.5">
        <label for="email" class="block text-xs font-semibold text-[#0f172a]">
          Work Email <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="name@company.com"
            autocomplete="email"
            class="w-full h-11 px-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] placeholder-[#94a3b8] text-sm focus:bg-white focus:border-[#0a6ef0] focus:ring-2 focus:ring-[#0a6ef0]/15 outline-none transition-all"
            :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/15': errors.email }"
            :disabled="isPending"
          />
        </div>
        <span
          v-if="errors.email"
          class="text-[11px] text-red-600 block mt-1 font-medium"
        >
          {{ errors.email }}
        </span>
      </div>

      <!-- Password Input -->
      <div class="space-y-1.5">
        <label for="password" class="block text-xs font-semibold text-[#0f172a] mb-1">
          Password <span class="text-red-500">*</span>
        </label>
        <div class="relative flex items-center">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full h-11 px-3.5 pr-11 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] placeholder-[#94a3b8] text-sm focus:bg-white focus:border-[#0a6ef0] focus:ring-2 focus:ring-[#0a6ef0]/15 outline-none transition-all font-mono"
            :class="{ 'border-red-400 focus:border-red-500 focus:ring-red-500/15': errors.password }"
            :disabled="isPending"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 p-1 text-[#64748b] hover:text-[#0f172a] focus:outline-none transition-colors"
            :disabled="isPending"
            aria-label="Toggle password visibility"
          >
            <component
              :is="showPassword ? PhEyeSlash : PhEye"
              class="w-4 h-4"
            />
          </button>
        </div>
        <span
          v-if="errors.password"
          class="text-[11px] text-red-600 block mt-1 font-medium"
        >
          {{ errors.password }}
        </span>
      </div>

      <!-- Remember Me Toggle -->
      <div class="flex items-center justify-between pt-1">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="rememberMe"
            class="rounded border-[#e2e8f0] text-[#0a6ef0] focus:ring-[#0a6ef0]/20 h-4 w-4 accent-[#0a6ef0]"
            :disabled="isPending"
          />
          <span class="text-xs text-[#64748b]">Remember my email</span>
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full h-11 mt-2 bg-[#0a6ef0] hover:bg-[#0056cc] active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-[0_3px_8px_rgba(10,110,240,0.25)] hover:shadow-[0_6px_20px_rgba(10,110,240,0.32)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isPending"
      >
        <AppSpinner v-if="isPending" size="xs" color="white" />
        <span v-if="isPending">Signing in...</span>
        <template v-else>
          <span>Sign In</span>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { PhEye, PhEyeSlash, PhX, PhShieldCheck, PhArrowLeft } from "@phosphor-icons/vue";
import AppSpinner from "@/components/AppSpinner.vue";
import { getErrorMessage } from "@/utils/errorHandler";
import { loginSchema } from "../schemas/validation";
import { useLoginMutation, useVerifyMfaMutation } from "../queries";
import authApi from "../api/endpoints";

const store = useStore();
const showPassword = ref(false);
const errorMessage = ref("");

// MFA State
const isMfaStep = ref(false);
const mfaToken = ref("");
const mfaEmail = ref("integration@swarajyaconsultancy.in");
const mfaCode = ref("");
const isResendingMfa = ref(false);
const resendCooldown = ref(0);
let cooldownTimer = null;

// Bind schemas to VeeValidate
const { errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    organization: "",
    email: "",
    password: "",
    rememberMe: false,
  },
});

const { value: organization } = useField("organization");
const { value: email } = useField("email");
const { value: password } = useField("password");
const { value: rememberMe } = useField("rememberMe");

// Mutations
const { mutate, isPending } = useLoginMutation();
const { mutate: verifyMfaMutate, isPending: isVerifyingMfa } = useVerifyMfaMutation();

function startCooldown(seconds = 60) {
  resendCooldown.value = seconds;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

onMounted(() => {
  // Pre-fill email if stored in local storage
  const savedEmail = localStorage.getItem("remembered_email");
  if (savedEmail) {
    email.value = savedEmail;
    rememberMe.value = true;
  }
  const savedOrganization =
    localStorage.getItem("remembered_organization") ||
    localStorage.getItem("remembered_tenant");
  if (savedOrganization) {
    organization.value = savedOrganization;
  }
});

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

const onSubmit = handleSubmit((values) => {
  errorMessage.value = "";

  // Remember email logic
  if (values.rememberMe) {
    localStorage.setItem("remembered_email", values.email);
  } else {
    localStorage.removeItem("remembered_email");
  }
  localStorage.setItem("remembered_organization", values.organization.trim());

  // Trigger login mutation
  mutate(
    {
      organization: values.organization.trim(),
      email: values.email,
      password: values.password,
    },
    {
      onSuccess: (response) => {
        const payload = response.data || {};
        if (payload.mfaRequired) {
          isMfaStep.value = true;
          mfaToken.value = payload.mfaToken;
          mfaEmail.value = payload.email || "integration@swarajyaconsultancy.in";
          mfaCode.value = "";
          startCooldown(60);
          return;
        }
      },
      onError: (err) => {
        errorMessage.value = getErrorMessage(
          err,
          "Invalid credentials. Please verify your organization, email and password."
        );
      },
    },
  );
});

function onVerifyMfa() {
  if (!mfaCode.value || mfaCode.value.trim().length !== 6) return;
  errorMessage.value = "";

  verifyMfaMutate(
    {
      mfaToken: mfaToken.value,
      code: mfaCode.value.trim(),
    },
    {
      onError: (err) => {
        errorMessage.value = getErrorMessage(
          err,
          "Invalid or expired verification code. Please check your email and try again."
        );
      },
    },
  );
}

async function onResendMfa() {
  if (isResendingMfa.value || resendCooldown.value > 0) return;
  errorMessage.value = "";
  isResendingMfa.value = true;

  try {
    const res = await authApi.resendMfa({ mfaToken: mfaToken.value });
    store.dispatch("notifications/triggerToast", {
      message: res.message || `A new verification code was sent to ${mfaEmail.value}`,
      type: "info",
    });
    startCooldown(60);
  } catch (err) {
    errorMessage.value = getErrorMessage(err, "Failed to resend verification code.");
  } finally {
    isResendingMfa.value = false;
  }
}

function onCancelMfa() {
  isMfaStep.value = false;
  mfaCode.value = "";
  mfaToken.value = "";
  errorMessage.value = "";
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.35s ease-in-out;
}
</style>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.35s ease-in-out;
}
</style>
