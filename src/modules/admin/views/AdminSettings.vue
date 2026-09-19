<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <p class="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent-400">
        System Configuration
      </p>
      <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
        Platform Security &amp; Cluster Settings
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Global security policies, multi-tenant database isolation parameters, and runtime rules.
      </p>
    </div>

    <!-- Cluster Configuration Box -->
    <div class="p-6 rounded-xl bg-surface border border-default shadow-xs space-y-5">
      <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">
          SaaS Multi-Tenant Isolation Configuration
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Strict data isolation guarantees and platform firewall policies.
        </p>
      </div>

      <div class="space-y-3 text-xs">
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
          <div>
            <div class="font-bold text-slate-800 dark:text-slate-200">
              Strict AsyncLocalStorage Organization Scoping
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Applies automatic organization filtering to all database operations.
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
            ENABLED
          </span>
        </div>

        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
          <div>
            <div class="font-bold text-slate-800 dark:text-slate-200">
              Lead Transfer PII Sanitization
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Automatically strips customer phone numbers, emails, and private notes across transfers.
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
            ENABLED
          </span>
        </div>

        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
          <div>
            <div class="font-bold text-slate-800 dark:text-slate-200">
              Brute Force Authentication Lockout
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Locks tenant accounts after 5 consecutive invalid password attempts for 15 minutes.
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
            ENABLED
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>
