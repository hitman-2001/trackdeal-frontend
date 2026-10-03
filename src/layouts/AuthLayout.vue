<template>
  <div class="auth-shell min-h-screen flex bg-[#f8fafc] text-[#0f172a]">
    <!-- ── Left Panel: Brand Showcase (Desktop >= 1024px) ── -->
    <div
      class="auth-showcase hidden lg:flex lg:w-[50%] xl:w-[52%] relative p-12 xl:p-16 flex-col justify-between overflow-hidden"
    >
      <!-- Background subtle grid & ambient glows -->
      <div class="auth-mesh-grid" aria-hidden="true"></div>
      <div class="auth-ambient-glow" aria-hidden="true"></div>

      <!-- Top Logo lockup -->
      <div class="relative z-10 flex items-center">
        <router-link to="/" class="inline-block transition-opacity hover:opacity-90" aria-label="TrackDeal Home">
          <img
            src="/trackdeal_logo.png"
            alt="TrackDeal - Lead Management System"
            class="auth-showcase-logo h-10 w-auto"
          />
        </router-link>
      </div>

      <!-- Center visual value prop & live pipeline preview -->
      <div class="relative z-10 space-y-6 my-auto max-w-lg">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a6ef0]/10 border border-[#0a6ef0]/20 text-[11px] font-semibold text-[#0a6ef0]"
        >
          <span class="h-2 w-2 rounded-full bg-[#0a6ef0] animate-pulse"></span>
          Next-Gen Lead Management System
        </div>

        <h1
          class="font-heading text-4xl xl:text-5xl font-extrabold text-[#0f172a] tracking-[-0.04em] leading-[1.12]"
        >
          Turn every inquiry<br />into a
          <span class="auth-gradient-text">closed deal.</span>
        </h1>

        <p class="text-[#64748b] text-sm leading-relaxed max-w-md">
          Capture multi-channel leads, automate follow-up schedules, coordinate reps, and accelerate your entire sales pipeline in one calm workspace.
        </p>

        <!-- Mock pipeline preview card -->
        <div class="auth-pipeline-card p-5 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-[#0a6ef0]"></span>
              <span class="text-xs font-bold text-[#0f172a]">Active Sales Pipeline</span>
            </div>
            <span class="text-[10px] font-semibold text-[#0aaa64] bg-[#0aaa64]/10 px-2 py-0.5 rounded-md border border-[#0aaa64]/20">
              78% Win Rate
            </span>
          </div>

          <!-- Mini stats in showcase -->
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-white/80 p-2.5 rounded-lg border border-[#e2e8f0]/80">
              <span class="text-[10px] text-[#64748b] block">Active Leads</span>
              <strong class="text-base font-bold text-[#0f172a]">142</strong>
            </div>
            <div class="bg-white/80 p-2.5 rounded-lg border border-[#e2e8f0]/80">
              <span class="text-[10px] text-[#64748b] block">Deals Won</span>
              <strong class="text-base font-bold text-[#0f172a]">86</strong>
            </div>
            <div class="bg-white/80 p-2.5 rounded-lg border border-[#e2e8f0]/80">
              <span class="text-[10px] text-[#64748b] block">Today's Tasks</span>
              <strong class="text-base font-bold text-[#0f172a]">14</strong>
            </div>
          </div>

          <!-- Lead activity preview row -->
          <div class="flex items-center justify-between bg-white/90 p-3 rounded-xl border border-[#e2e8f0]">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-7 h-7 rounded-full bg-[#0a6ef0] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                PS
              </div>
              <div class="min-w-0">
                <strong class="text-xs text-[#0f172a] block truncate">Priya Sharma</strong>
                <span class="text-[10px] text-[#64748b] block truncate">Demo class · High Intent</span>
              </div>
            </div>
            <span class="text-[10px] font-semibold px-2 py-1 rounded bg-[#0a6ef0]/10 text-[#0a6ef0] shrink-0">
              Call Back Today
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom footer credits -->
      <div class="relative z-10 text-xs text-[#94a3b8] font-medium flex items-center justify-between">
        <span>© {{ currentYear }} TrackDeal Technologies.</span>
        <span>Thoughtfully built for high-velocity teams.</span>
      </div>
    </div>

    <!-- ── Right Panel: Auth Form Container (Desktop & Mobile) ── -->
    <div
      class="auth-form-panel w-full lg:w-[50%] xl:w-[48%] flex flex-col justify-between items-center p-6 sm:p-10 lg:p-14 relative min-h-screen"
    >
      <!-- Top Bar: Navigation -->
      <div class="w-full flex items-center justify-between mb-6">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#0a6ef0] transition-colors py-1.5 px-3 rounded-lg hover:bg-black/5"
        >
          <span aria-hidden="true">&larr;</span> Back to website
        </router-link>
      </div>

      <!-- Main Form Wrapper -->
      <div class="w-full max-w-[440px] my-auto">
        <!-- Logo for Mobile & Tablet (< 1024px) -->
        <div class="lg:hidden flex flex-col items-center mb-8">
          <router-link to="/" aria-label="TrackDeal Home">
            <img
              src="/trackdeal_logo.png"
              alt="TrackDeal - Lead Management System"
              class="auth-mobile-logo h-9 w-auto"
            />
          </router-link>
        </div>

        <!-- Elevated Form Card -->
        <div class="auth-card bg-white border border-[#e5e5dd] rounded-2xl p-7 sm:p-9 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <router-view />
        </div>
      </div>

      <!-- Bottom Help Note -->
      <div class="w-full text-center text-xs text-[#939c8c] mt-8 pt-4">
        Need assistance accessing your account?
        <span class="text-[#70776f] font-medium">Contact your workspace administrator.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.auth-shell {
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
  background: #faf9f6;
}

/* Left Showcase Panel Styling */
.auth-showcase {
  background:
    radial-gradient(ellipse 70% 60% at 20% 20%, rgba(10, 110, 240, 0.14) 0%, transparent 70%),
    radial-gradient(ellipse 60% 60% at 85% 85%, rgba(10, 30, 60, 0.08) 0%, transparent 70%),
    #f8fafc;
  border-right: 1px solid #e2e8f0;
}

.auth-mesh-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%);
}

.auth-ambient-glow {
  position: absolute;
  top: -120px;
  left: -80px;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(10, 110, 240, 0.12) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

.auth-gradient-text {
  font-family: Georgia, "Times New Roman", serif;
  font-style: italic;
  font-weight: 400;
  color: #0a6ef0;
  letter-spacing: -0.04em;
}

.auth-pipeline-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 16px 40px -12px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
}

.auth-showcase-logo,
.auth-mobile-logo {
  display: block;
  object-fit: contain;
}

/* Right Form Panel */
.auth-form-panel {
  background:
    radial-gradient(circle at 100% 0%, rgba(10, 110, 240, 0.04) 0%, transparent 26rem),
    #f8fafc;
}

.auth-card {
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
</style>
