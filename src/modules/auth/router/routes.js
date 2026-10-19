const Login = () => import('../pages/Login.vue');
const ForgotPassword = () => import('../pages/ForgotPassword.vue');
const ResetPassword = () => import('../pages/ResetPassword.vue');
const AcceptInvitation = () => import('../pages/AcceptInvitation.vue');
const SessionExpired = () => import('../pages/SessionExpired.vue');
const Unauthorized = () => import('../pages/Unauthorized.vue');

export const authRoutes = [
  {
    path: 'login',
    name: 'Login',
    component: Login
  },
  {
    path: 'forgot-password',
    redirect: '/login'
  },
  {
    path: 'reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: 'accept-invitation',
    name: 'AcceptInvitation',
    component: AcceptInvitation
  },
  {
    path: 'session-expired',
    name: 'SessionExpired',
    component: SessionExpired
  },
  {
    path: 'unauthorized',
    name: 'Unauthorized',
    component: Unauthorized
  }
];

export default authRoutes;
