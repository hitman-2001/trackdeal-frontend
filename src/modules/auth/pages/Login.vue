<template>
  <div class="space-y-6">
    <!-- Server Exception Alerts -->
    <div
      v-if="errorMessage"
      class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold flex items-center justify-between"
    >
      <span>{{ errorMessage }}</span>
      <button
        @click="errorMessage = ''"
        class="font-bold opacity-80 hover:opacity-100"
      >
        <AppIcon name="close" :size="14" weight="bold" />
      </button>
    </div>

    <!-- Login Form -->
    <form @submit="onSubmit" class="space-y-4">
      <!-- Organization Input -->
      <div class="space-y-1">
        <label for="organization" class="label-text"> Organization </label>
        <input
          id="organization"
          v-model="organization"
          type="text"
          placeholder="Organization name"
          autocomplete="organization"
          class="input-field text-caption text-neutral-900"
          :class="{ 'input-field-error': errors.organization }"
          :disabled="isPending"
        />
        <span
          v-if="errors.organization"
          class="text-[10px] text-danger-text block mt-1"
        >
          {{ errors.organization }}
        </span>
        <span v-else class="text-[10px] text-neutral-400 block mt-1">
          Required for organization users.
        </span>
      </div>

      <!-- Email Address Input -->
      <div class="space-y-1">
        <label
          for="email"
          class="label-text"
          :class="{ 'label-required': true }"
        >
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
        <span
          v-if="errors.email"
          class="text-[10px] text-danger-text block mt-1"
        >
          {{ errors.email }}
        </span>
      </div>

      <!-- Password Input -->
      <div class="space-y-1">
        <div class="flex justify-between items-center mb-1">
          <label
            for="password"
            class="label-text"
            :class="{ 'label-required': true }"
          >
            Password
          </label>
          <router-link
            to="/forgot-password"
            class="text-[11px] font-semibold text-accent-600 hover:text-accent-700 hover:underline"
            :disabled="isPending"
          >
            Forgot password?
          </router-link>
        </div>
        <div class="relative flex items-center">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="input-field text-caption text-neutral-900 pr-10"
            :class="{ 'input-field-error': errors.password }"
            :disabled="isPending"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 text-neutral-400 hover:text-neutral-600 focus:outline-none"
            :disabled="isPending"
          >
            <component
              :is="showPassword ? PhEyeSlash : PhEye"
              class="w-4 h-4"
            />
          </button>
        </div>
        <span
          v-if="errors.password"
          class="text-[10px] text-danger-text block mt-1"
        >
          {{ errors.password }}
        </span>
      </div>

      <!-- Remember Me Toggle -->
      <div class="flex items-center justify-between">
        <label class="flex items-center cursor-pointer">
          <input
            type="checkbox"
            v-model="rememberMe"
            class="rounded border-neutral-200 text-accent-600 focus:ring-accent-500 h-3.5 w-3.5"
            :disabled="isPending"
          />
          <span class="ml-2 text-caption text-neutral-500">Remember email</span>
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full btn btn-primary h-10 text-xs font-semibold"
        :disabled="isPending"
      >
        <PhSpinner v-if="isPending" class="animate-spin w-4 h-4 mr-2" />
        <span>{{ isPending ? "Signing in..." : "Sign In" }}</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { PhEye, PhEyeSlash, PhSpinner } from "@phosphor-icons/vue";
import { loginSchema } from "../schemas/validation";
import { useLoginMutation } from "../queries";

const showPassword = ref(false);
const errorMessage = ref("");

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

// Throttled mutations hook
const { mutate, isPending } = useLoginMutation();

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

const onSubmit = handleSubmit((values) => {
  errorMessage.value = "";

  // Remember email logic
  if (values.rememberMe) {
    localStorage.setItem("remembered_email", values.email);
  } else {
    localStorage.removeItem("remembered_email");
  }
  localStorage.setItem("remembered_organization", values.organization.trim());

  // Trigger mutation
  mutate(
    {
      organization: values.organization.trim(),
      email: values.email,
      password: values.password,
    },
    {
      onError: (err) => {
        // Render server errors
        errorMessage.value =
          err.data?.message ||
          "Invalid credentials. Please verify your organization, email and password.";
      },
    },
  );
});
</script>
