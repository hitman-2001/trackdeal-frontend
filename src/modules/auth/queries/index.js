import { useMutation } from "@tanstack/vue-query";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import authApi from "../api/endpoints";
import { syncPushTokenIfPermissionGranted } from "@/services/firebase";

export function useLoginMutation() {
  const store = useStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      // API wrapper response: response = { success: true, data: { accessToken, refreshToken, user } }
      const payload = response.data || {};
      store.dispatch("auth/loginUser", {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        profile: payload.user,
      });
      syncPushTokenIfPermissionGranted().catch(() => {});
      store.dispatch("notifications/triggerToast", {
        message: "Successfully logged in. Welcome back!",
        type: "success",
      });
      if (['system_admin', 'super_admin'].includes(payload.user?.role)) {
        router.push("/admin");
      } else {
        router.push("/app/dashboard");
      }
    },
  });
}

export function useForgotPasswordMutation() {
  const store = useStore();

  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      store.dispatch("notifications/triggerToast", {
        message: "Password reset link sent to your registered email address.",
        type: "success",
      });
    },
  });
}

export function useResetPasswordMutation() {
  const store = useStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      store.dispatch("notifications/triggerToast", {
        message:
          "Password successfully updated. Please login with your new credentials.",
        type: "success",
      });
      router.push("/login");
    },
  });
}

export function useAcceptInvitationMutation() {
  const store = useStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.acceptInvitation,
    onSuccess: () => {
      store.dispatch("notifications/triggerToast", {
        message: "Invitation accepted! Please login with your credentials.",
        type: "success",
      });
      router.push("/login");
    },
  });
}

