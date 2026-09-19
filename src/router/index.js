import { createRouter, createWebHistory } from "vue-router";
import { setupRouterGuards } from "./guards";
import { h } from "vue";
import { authRoutes } from "@/modules/auth";

// Top-Level Layouts
const AuthLayout = () => import("@/layouts/AuthLayout.vue");
const AppLayout = () => import("@/layouts/AppLayout.vue");
const SettingsLayout = () => import("@/layouts/SettingsLayout.vue");
const ReportLayout = () => import("@/layouts/ReportLayout.vue");

// Helper function to render a quick placeholder view to keep scaffolding compilable
const defineMockView = (title) => ({
  name: `${title.replace(/\s+/g, "")}Placeholder`,
  render() {
    return h(
      "div",
      { class: "p-6 bg-surface border border-default rounded-lg shadow-sm" },
      [
        h(
          "h1",
          { class: "font-heading text-xl font-bold mb-2" },
          `${title} View`,
        ),
        h(
          "p",
          { class: "text-slate-600 text-sm" },
          `Scaffolding placeholder workspace. Business logic implementation is pending.`,
        ),
      ],
    );
  },
});

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/modules/marketing/pages/LandingPage.vue"),
    meta: { public: true },
  },
  {
    path: "/",
    component: AuthLayout,
    children: authRoutes,
  },
  {
    path: "/app",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/app/dashboard",
      },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/modules/dashboards/pages/WorkspaceDashboard.vue"),
      },

      {
        path: "leads",
        name: "Leads",
        component: () => import("@/modules/leads/pages/LeadWorkspace.vue"),
        meta: { module: "leads" },
      },
      {
        path: "leads/:id",
        name: "LeadDetails",
        component: () => import("@/modules/leads/pages/LeadDetailsWorkspace.vue"),
        meta: { module: "leads" },
      },
      {
        path: "students",
        name: "Students",
        component: () => import("@/modules/education/pages/StudentsList.vue"),
        meta: { module: "students", vertical: "education" },
      },
      {
        path: "classes",
        name: "Classes",
        component: () => import("@/modules/education/pages/ClassesList.vue"),
        meta: { module: "classes", vertical: "education" },
      },
      {
        path: "agents",
        name: "Agents",
        component: () => import("@/modules/agents/pages/AgentsList.vue"),
        meta: { module: "agents", vertical: "realEstate" },
      },
      {
        path: "agents/:id",
        name: "AgentDetails",
        component: () => import("@/modules/agents/pages/AgentDetails.vue"),
        meta: { module: "agents", vertical: "realEstate" },
      },
      {
        path: "deals",
        name: "Deals",
        component: () => import("@/modules/deals/pages/DealsList.vue"),
        meta: { module: "deals", vertical: "realEstate" },
      },
      {
        path: "deals/:id",
        name: "DealDetails",
        component: () => import("@/modules/deals/pages/DealDetails.vue"),
        meta: { module: "deals", vertical: "realEstate" },
      },
      {
        path: "loans",
        name: "Loans",
        component: () => import("@/modules/loans/pages/LoansList.vue"),
        meta: { module: "loans", vertical: "realEstate" },
      },
      {
        path: "loans/banks-dsa",
        name: "LoanBanksDsa",
        component: () => import("@/modules/loans/pages/BankDsaDirectory.vue"),
        meta: { module: "loans", vertical: "realEstate" },
      },
      {
        path: "loans/:id",
        name: "LoanDetails",
        component: () => import("@/modules/loans/pages/LoanDetails.vue"),
        meta: { module: "loans", vertical: "realEstate" },
      },
      {
        path: "agreements",
        name: "Agreements",
        component: () =>
          import("@/modules/agreements/pages/AgreementsList.vue"),
        meta: { module: "agreements", vertical: "realEstate" },
      },
      {
        path: "agreements/new",
        name: "CreateAgreement",
        component: () =>
          import("@/modules/agreements/pages/CreateAgreementWizard.vue"),
        meta: { module: "agreements", vertical: "realEstate" },
      },
      {
        path: "agreements/templates",
        name: "DocumentTemplates",
        component: () =>
          import("@/modules/agreements/pages/DocumentTemplatesDirectory.vue"),
        meta: { module: "agreements", vertical: "realEstate" },
      },
      {
        path: "agreements/:id",
        name: "AgreementPreview",
        component: () =>
          import("@/modules/agreements/pages/AgreementPreview.vue"),
        meta: { module: "agreements", vertical: "realEstate" },
      },
      {
        path: "agreements/:id/edit-details",
        name: "EditAgreementDetails",
        component: () =>
          import("@/modules/agreements/pages/EditAgreementDetails.vue"),
        meta: { module: "agreements", vertical: "realEstate" },
      },
      {
        path: "agreements/:id/editor",
        name: "AgreementFullEditor",
        component: () =>
          import("@/modules/agreements/pages/AgreementFullEditor.vue"),
        meta: { module: "agreements", vertical: "realEstate" },
      },
      {
        path: "tasks",
        name: "Tasks",
        component: () => import("@/modules/tasks/pages/TasksList.vue"),
        meta: { module: "tasks", permission: "tasks:read" },
      },
      {
        path: "projects",
        name: "Projects",
        component: () => import("@/modules/properties/pages/ProjectsList.vue"),
        meta: { module: "projects", vertical: "realEstate" },
      },
      {
        path: "projects/:id",
        name: "ProjectDetails",
        component: () =>
          import("@/modules/properties/pages/ProjectDetails.vue"),
        meta: { module: "projects", vertical: "realEstate" },
      },
      {
        path: "projects/:id/analytics",
        name: "ProjectAnalytics",
        component: () =>
          import("@/modules/properties/pages/ProjectAnalytics.vue"),
        meta: { module: "projects", vertical: "realEstate" },
      },
      {
        path: "properties",
        name: "Properties",
        component: () =>
          import("@/modules/properties/pages/PropertiesList.vue"),
        meta: { module: "properties", vertical: "realEstate" },
      },
      {
        path: "properties/:id",
        name: "PropertyDetails",
        component: () =>
          import("@/modules/properties/pages/PropertyDetails.vue"),
        meta: { module: "properties", vertical: "realEstate" },
      },
      {
        path: "builders",
        name: "Builders",
        component: () => import("@/modules/properties/pages/BuildersList.vue"),
        meta: { module: "projects", vertical: "realEstate" },
      },
      {
        path: "builders/:id",
        name: "BuilderDetails",
        component: () =>
          import("@/modules/properties/pages/BuilderDetails.vue"),
        meta: { module: "projects", vertical: "realEstate" },
      },
      {
        path: "commissions",
        name: "CommissionsDashboard",
        component: () =>
          import("@/modules/commissions/pages/CommissionsDashboard.vue"),
        meta: {
          permission: "commissions.read",
          featureFlag: "commissionModule",
          module: "commissions",
          vertical: "realEstate",
        },
      },
      {
        path: "commissions/receivables",
        name: "ReceivablesLedger",
        component: () =>
          import("@/modules/commissions/pages/ReceivablesLedger.vue"),
        meta: {
          permission: "commissions.read",
          featureFlag: "commissionModule",
          module: "commissions",
          vertical: "realEstate",
        },
      },
      {
        path: "commissions/list",
        name: "CommissionsList",
        component: () =>
          import("@/modules/commissions/pages/CommissionsList.vue"),
        meta: {
          permission: "commissions.read",
          featureFlag: "commissionModule",
          module: "commissions",
          vertical: "realEstate",
        },
      },
      {
        path: "commissions/:id",
        name: "CommissionDetails",
        component: () =>
          import("@/modules/commissions/pages/CommissionDetails.vue"),
        meta: {
          permission: "commissions.read",
          featureFlag: "commissionModule",
          module: "commissions",
          vertical: "realEstate",
        },
      },
      {
        path: "analytics",
        redirect: "/app/reports/dashboard",
      },
      {
        path: "reports",
        component: ReportLayout,
        meta: { featureFlag: "reportsModule", module: "reports" },
        children: [
          {
            path: "",
            redirect: "/app/reports/dashboard",
          },
          {
            path: "dashboard",
            name: "ReportsDashboard",
            component: () =>
              import("@/modules/reports/pages/ReportsDashboard.vue"),
          },
          {
            path: "builder",
            name: "CustomReportBuilder",
            component: () =>
              import("@/modules/reports/pages/CustomReportBuilder.vue"),
          },
          {
            path: "export",
            name: "ExportCenter",
            component: () => import("@/modules/reports/pages/ExportCenter.vue"),
          },
          {
            path: "viewer/:type",
            name: "ReportViewer",
            component: () => import("@/modules/reports/pages/ReportViewer.vue"),
          },
        ],
      },
      {
        path: "settings",
        component: SettingsLayout,
        meta: { module: "settings" },
        children: [
          {
            path: "",
            redirect: "/app/settings/org",
          },
          {
            path: "org",
            name: "OrgSettings",
            component: () => import("@/modules/settings/pages/OrgSettings.vue"),
          },
          {
            path: "branches",
            name: "BranchSettings",
            component: () =>
              import("@/modules/settings/pages/BranchSettings.vue"),
            meta: { requiresOrgType: ["ENTERPRISE_AGENCY"] },
          },
          {
            path: "users",
            name: "UserSettings",
            component: () =>
              import("@/modules/settings/pages/UserSettings.vue"),
            meta: { requiresOrgType: ["AGENCY", "ENTERPRISE_AGENCY"] },
          },
          {
            path: "roles",
            name: "RoleSettings",
            component: () =>
              import("@/modules/settings/pages/RoleSettings.vue"),
            meta: { requiresOrgType: ["AGENCY", "ENTERPRISE_AGENCY"] },
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAuth: true, requiresSystemAdmin: true },
    children: [
      {
        path: "",
        redirect: "/admin/dashboard",
      },
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/modules/admin/views/AdminDashboard.vue"),
      },
      {
        path: "tenants",
        name: "AdminTenants",
        component: () => import("@/modules/admin/views/AdminTenants.vue"),
      },
      {
        path: "organizations",
        name: "AdminOrganizations",
        component: () => import("@/modules/admin/views/AdminOrganizations.vue"),
      },
      {
        path: "organizations/:id",
        name: "AdminOrganizationDetails",
        component: () =>
          import("@/modules/admin/views/AdminOrganizationDetails.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("@/modules/admin/views/AdminUsers.vue"),
      },
      {
        path: "audit-logs",
        name: "AdminAuditLogs",
        component: () => import("@/modules/admin/views/AdminAuditLogs.vue"),
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("@/modules/admin/views/AdminSettings.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: {
      render() {
        return h(
          "div",
          {
            class:
              "min-h-screen flex items-center justify-center bg-background",
          },
          [
            h("div", { class: "text-center" }, [
              h(
                "h1",
                { class: "font-heading text-4xl font-bold text-red-500 mb-2" },
                "404",
              ),
              h(
                "p",
                { class: "text-slate-600 mb-4" },
                "The page you requested could not be found.",
              ),
              h(
                "a",
                {
                  href: "/app/dashboard",
                  class: "px-4 py-2 bg-primary text-white rounded font-medium",
                },
                "Back to Dashboard",
              ),
            ]),
          ],
        );
      },
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

setupRouterGuards(router);

export default router;
