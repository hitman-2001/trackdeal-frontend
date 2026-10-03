<template>
  <div class="lp-root">
    <!-- ─── NAV ──────────────────────────────────── -->
    <header :class="['lp-nav', scrolled && 'lp-nav--scrolled']">
      <div class="lp-nav-inner">
        <router-link to="/" class="lp-logo" aria-label="TrackDeal">
          <img src="/trackdeal_logo.png" alt="TrackDeal" class="lp-brand-logo" />
        </router-link>

        <nav class="lp-nav-links" aria-label="Site navigation">
          <a href="#features">Platform</a>
          <a href="#workflow">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div class="lp-nav-actions">
          <router-link to="/login" class="lp-btn-ghost">Sign in</router-link>
          <router-link to="/login" class="lp-btn-primary lp-btn-sm">
            Get started
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </router-link>
        </div>

        <button class="lp-hamburger" :aria-expanded="mobileOpen" @click="mobileOpen = !mobileOpen" type="button" aria-label="Toggle navigation">
          <span :class="['lp-hamburger-line', mobileOpen && 'open-1']"></span>
          <span :class="['lp-hamburger-line', mobileOpen && 'open-2']"></span>
        </button>
      </div>

      <nav v-if="mobileOpen" class="lp-mobile-menu" @click="mobileOpen = false">
        <a href="#features">Platform</a>
        <a href="#workflow">How it works</a>
        <a href="#faq">FAQ</a>
        <router-link to="/login" class="lp-btn-primary" style="width: 100%; justify-content: center;">Get started →</router-link>
      </nav>
    </header>

    <main>
      <!-- ─── HERO ──────────────────────────────────── -->
      <section class="lp-hero">
        <!-- Animated gradient mesh background -->
        <div class="lp-mesh" aria-hidden="true">
          <div class="mesh-blob mesh-blob-1"></div>
          <div class="mesh-blob mesh-blob-2"></div>
          <div class="mesh-blob mesh-blob-3"></div>
          <div class="mesh-grid"></div>
        </div>

        <div class="lp-hero-content">
          <div class="lp-badge lp-anim lp-anim-1">
            <span class="badge-dot"></span>
            Modern Lead Management & Deal Tracking
          </div>

          <h1 class="lp-hero-h1 lp-anim lp-anim-2">
            Turn every inquiry<br />into a
            <span class="lp-gradient-text">closed deal.</span>
          </h1>

          <p class="lp-hero-sub lp-anim lp-anim-3">
            TrackDeal brings customer leads, deal pipelines, and your entire team into one calm, high-velocity workspace — from first inquiry to signed deal.
          </p>

          <div class="lp-hero-cta lp-anim lp-anim-4">
            <router-link to="/login" class="lp-btn-primary lp-btn-lg">
              Open your workspace
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </router-link>
            <a href="#features" class="lp-btn-ghost lp-btn-lg">Explore platform</a>
          </div>

          <p class="lp-hero-footnote lp-anim lp-anim-4">
            Designed for high-performing sales, counselling & client teams.
          </p>

          <!-- Floating product mockup -->
          <div class="lp-mockup-wrap lp-anim lp-anim-5">
            <div class="lp-mockup-chrome">
              <div class="chrome-dots">
                <i></i><i></i><i></i>
              </div>
              <span>app.trackdeal.com/leads</span>
            </div>
            <div class="lp-mockup-body">
              <aside class="lp-mock-sidebar">
                <div class="mock-brand">
                  <img src="/trackdeal_logo.png" alt="TrackDeal" class="mock-logo-img" />
                </div>
                <div class="mock-nav-item active"><div class="mock-icon"></div>Overview</div>
                <div class="mock-nav-item"><div class="mock-icon"></div>Leads & Inquiries</div>
                <div class="mock-nav-item"><div class="mock-icon"></div>Deal Pipeline</div>
                <div class="mock-nav-item"><div class="mock-icon"></div>Customers</div>
                <div class="mock-nav-item"><div class="mock-icon"></div>Analytics</div>
              </aside>
              <div class="lp-mock-main">
                <div class="mock-topbar">
                  <div>
                    <div class="mock-title-line"></div>
                    <div class="mock-sub-line"></div>
                  </div>
                  <div class="mock-badge-pill">Live Sales Pipeline</div>
                </div>
                <div class="mock-stats">
                  <div class="mock-stat">
                    <span>Active Leads</span>
                    <strong class="count-anim">142</strong>
                    <div class="stat-bar" style="--pct: 78%"></div>
                  </div>
                  <div class="mock-stat">
                    <span>Deals Closed</span>
                    <strong class="count-anim">86</strong>
                    <div class="stat-bar" style="--pct: 88%"></div>
                  </div>
                  <div class="mock-stat">
                    <span>Follow-ups Today</span>
                    <strong class="count-anim">14</strong>
                    <div class="stat-bar" style="--pct: 42%"></div>
                  </div>
                </div>
                <div class="mock-cards-row">
                  <div class="mock-card">
                    <div class="mc-avatar mc-a1">PS</div>
                    <div class="mc-info">
                      <strong>Priya Sharma</strong>
                      <span>Enterprise Plan · High Intent</span>
                    </div>
                    <div class="mc-status interested">Demo Scheduled</div>
                  </div>
                  <div class="mock-card">
                    <div class="mc-avatar mc-a2">AM</div>
                    <div class="mc-info">
                      <strong>Aarav Mehta</strong>
                      <span>Custom Proposal · Follow-up at 3 PM</span>
                    </div>
                    <div class="mc-status callback">Call Back</div>
                  </div>
                  <div class="mock-card">
                    <div class="mc-avatar mc-a3">RK</div>
                    <div class="mc-info">
                      <strong>Rohan Kapoor</strong>
                      <span>Contract Approved · Payment Pending</span>
                    </div>
                    <div class="mc-status enrolled">Closed Won</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── FEATURES ──────────────────────────────── -->
      <section id="features" class="lp-features lp-container">
        <div class="lp-section-header reveal">
          <div class="lp-eyebrow">CAPABILITIES</div>
          <h2 class="lp-section-h2">Everything you need to capture,<br /><em>track, and close.</em></h2>
          <p class="lp-section-sub">A thoughtful, fast workspace built to eliminate dropped leads, streamline team follow-ups, and accelerate your sales pipeline.</p>
        </div>

        <div class="lp-bento">
          <!-- Lead management — wide card -->
          <div class="bento-card bento-wide reveal">
            <div class="bento-icon-wrap bento-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>
            </div>
            <h3>See the lead.<br />Know the exact next step.</h3>
            <p>Consolidate leads from websites, WhatsApp, calls, ads, and walk-ins. Keep notes, discussion history, and callback reminders in one unified record.</p>
            <div class="bento-lead-demo">
              <div class="bld-card">
                <div class="bld-avatar bld-av1">PS</div>
                <div class="bld-meta">
                  <strong>Priya Sharma</strong>
                  <span>Interested in Annual Partnership</span>
                </div>
                <div class="bld-tag counselling">Discussion</div>
              </div>
              <div class="bld-card">
                <div class="bld-avatar bld-av2">AM</div>
                <div class="bld-meta">
                  <strong>Aarav Mehta</strong>
                  <span>Executive Demo Completed</span>
                </div>
                <div class="bld-tag callback">Proposal Sent</div>
              </div>
              <div class="bld-followup">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                Next up: Follow-up call with decision maker · 4:00 PM
              </div>
            </div>
          </div>

          <!-- Pipeline card -->
          <div class="bento-card bento-narrow reveal reveal-delay-1">
            <div class="bento-icon-wrap bento-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h3>Custom Pipeline.<br />Complete Clarity.</h3>
            <p>Structure your sales funnel with clear stages, deal sizes, and automated milestone triggers.</p>
            <div class="bento-class-pills">
              <span class="cp cp-open">New Inquiries · 34 Active</span>
              <span class="cp cp-filling">Negotiation · ₹18.4L</span>
              <span class="cp cp-open">Closed Deals · 92% SLA</span>
            </div>
          </div>

          <!-- Analytics card -->
          <div class="bento-card bento-narrow reveal reveal-delay-2">
            <div class="bento-icon-wrap bento-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h3>Velocity &<br />Revenue Insights.</h3>
            <p>Real-time analytics reveal top performers, conversion roadblocks, and monthly revenue trends.</p>
            <div class="bento-chart-mini">
              <div v-for="(bar, i) in miniChart" :key="i" class="mini-bar" :style="`--h: ${bar}%`"></div>
            </div>
            <div class="bento-progress-track">
              <div class="bento-progress-fill" style="width: 78%"></div>
            </div>
            <span>78% Lead-to-Deal Conversion</span>
          </div>

          <!-- Team card -->
          <div class="bento-card bento-mid reveal reveal-delay-1">
            <div class="bento-icon-wrap bento-orange">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h3>Smart Lead Distribution</h3>
            <p>Assign leads automatically by region, product type, or rep capacity. Keep managers in control with full role permissions.</p>
            <div class="bento-team-row">
              <div class="team-pill">
                <div class="tp-dot tp-admin"></div> Admin
              </div>
              <div class="team-pill">
                <div class="tp-dot tp-counsel"></div> Sales Exec
              </div>
              <div class="team-pill">
                <div class="tp-dot tp-mgr"></div> Manager
              </div>
            </div>
          </div>

          <!-- Mobile card -->
          <div class="bento-card bento-mid reveal reveal-delay-2">
            <div class="bento-icon-wrap bento-rose">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M9 18h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </div>
            <h3>One-Tap Mobile Actions</h3>
            <p>Reps can call, send pre-formatted WhatsApp messages, and update deal status in seconds right from their smartphones.</p>
            <div class="bento-mobile-demo">
              <div class="bmd-btn bmd-call">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 5.18 2 2 0 015.09 3h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L9.09 11a16 16 0 006.89 6.89l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                Call Lead
              </div>
              <div class="bmd-btn bmd-whatsapp">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M8.5 9.5c.5 2 2.5 4 4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                WhatsApp
              </div>
              <div class="bmd-btn bmd-status">
                Won / Deal
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── WORKFLOW ──────────────────────────── -->
      <section id="workflow" class="lp-workflow">
        <div class="lp-container">
          <div class="lp-section-header reveal">
            <div class="lp-eyebrow">HOW IT WORKS</div>
            <h2 class="lp-section-h2">From first inquiry to<br /><em>loyal customer.</em></h2>
            <p class="lp-section-sub">A streamlined, friction-free sales engine designed to keep every deal moving forward.</p>
          </div>

          <div class="lp-steps">
            <div v-for="(step, i) in steps" :key="step.number" :class="['lp-step', `reveal`, `reveal-delay-${i}`]">
              <div class="step-number">{{ step.number }}</div>
              <div class="step-connector" v-if="i < steps.length - 1"></div>
              <div class="step-body">
                <div :class="['step-icon-wrap', step.color]">
                  <component :is="'div'" v-html="step.iconSvg" class="step-icon-svg"></component>
                </div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── FAQ ──────────────────────────────── -->
      <section id="faq" class="lp-faq lp-container">
        <div class="lp-section-header reveal">
          <div class="lp-eyebrow">FREQUENTLY ASKED QUESTIONS</div>
          <h2 class="lp-section-h2">Clear answers to<br /><em>get you started.</em></h2>
        </div>
        <div class="faq-grid">
          <div v-for="faq in faqs" :key="faq.q" class="faq-item reveal" @click="faq.open = !faq.open">
            <div class="faq-q">
              <span>{{ faq.q }}</span>
              <div :class="['faq-chevron', faq.open && 'open']">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>
            <div v-if="faq.open" class="faq-a">{{ faq.a }}</div>
          </div>
        </div>
      </section>

      <!-- ─── CTA ──────────────────────────────── -->
      <section class="lp-cta lp-container">
        <div class="lp-cta-card reveal">
          <div class="cta-glow"></div>
          <div class="cta-content">
            <div class="lp-eyebrow" style="color: #628b63;">ACCELERATE YOUR GROWTH</div>
            <h2 class="lp-cta-h2">Stop losing leads to slow follow-ups.<br /><em>Start closing faster with TrackDeal.</em></h2>
            <p>Join fast-moving businesses that have transformed their sales, client conversion, and team productivity.</p>
            <div class="cta-actions">
              <router-link to="/login" class="lp-btn-primary lp-btn-lg cta-btn">
                Open your workspace free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </router-link>
              <p class="cta-footnote">Fast setup · Works seamlessly on mobile and desktop.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- ─── FOOTER ──────────────────────────────── -->
    <footer class="lp-footer">
      <div class="lp-container lp-footer-inner">
        <div class="lp-footer-brand">
          <router-link to="/" class="lp-logo" aria-label="TrackDeal">
            <img src="/trackdeal_logo.png" alt="TrackDeal" class="lp-brand-logo" />
          </router-link>
          <p>Modern lead management & deal conversion workspace.</p>
        </div>
        <nav class="lp-footer-links">
          <a href="#features">Platform</a>
          <a href="#workflow">How it works</a>
          <a href="#faq">FAQ</a>
          <router-link to="/login">Sign in</router-link>
        </nav>
        <div class="lp-footer-copy">
          <span>© {{ new Date().getFullYear() }} TrackDeal. All rights reserved.</span>
          <a href="#" class="lp-back-top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';

const scrolled = ref(false);
const mobileOpen = ref(false);

const miniChart = [40, 55, 70, 60, 85, 72, 90];

const steps = [
  {
    number: '01',
    title: 'Capture & Auto-Assign',
    description: 'Capture inbound inquiries instantly across website forms, WhatsApp, calls, and ad campaigns. Auto-assign to the best rep with complete customer history.',
    color: 'step-blue',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    number: '02',
    title: 'Nurture with Precision',
    description: 'Schedule follow-up calls, log meeting notes, and set smart alerts so your team always reaches out when buyer intent is at its highest.',
    color: 'step-purple',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    number: '03',
    title: 'Close & Grow Revenue',
    description: 'Move seamlessly from proposal to deal closure. Track agreement sign-offs, payment status, and build long-term repeat customer relationships.',
    color: 'step-emerald',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
];

const faqs = reactive([
  {
    q: 'What kind of businesses is TrackDeal built for?',
    a: 'TrackDeal is designed for any business handling high-value inquiries and customer conversion cycles — including professional service firms, consultancies, coaching academies, agencies, and enterprise sales teams.',
    open: false,
  },
  {
    q: 'Can my sales team manage leads on mobile?',
    a: 'Yes! TrackDeal is fully mobile-first. Reps can make calls, initiate WhatsApp messages, log notes, and update lead stages directly on their phones with zero delay.',
    open: false,
  },
  {
    q: 'How does lead distribution work?',
    a: 'Leads can be automatically distributed across your team by territory, deal size, or round-robin logic, ensuring fair workload and instant response times.',
    open: false,
  },
  {
    q: 'Can we customize pipeline stages and fields?',
    a: 'Yes. TrackDeal allows you to configure deal stages, custom tags, and follow-up workflows that match your exact conversion process.',
    open: false,
  },
  {
    q: 'How quickly can our team get started?',
    a: 'Setup takes just minutes. Invite your team via email, define roles, and start managing and converting leads without tedious software training.',
    open: false,
  },
]);

function handleScroll() {
  scrolled.value = window.scrollY > 32;

  // Scroll reveal trigger
  document.querySelectorAll('.reveal').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88) {
      el.classList.add('revealed');
    }
  });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Trigger on mount
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* ─── ROOT & TOKENS ────────────────────────── */
.lp-root {
  --lp-bg: #f8fafc;
  --lp-surface: #ffffff;
  --lp-surface-alt: #f1f5f9;
  --lp-border: rgba(15, 23, 42, 0.08);
  --lp-border-strong: rgba(15, 23, 42, 0.12);
  --lp-text: #0f172a;
  --lp-muted: #64748b;
  --lp-muted-light: #94a3b8;
  --lp-accent: #0a6ef0;
  --lp-accent-mid: #0056cc;
  --lp-accent-light: #38bdf8;
  --lp-accent-glow: rgba(10, 110, 240, 0.22);
  --lp-gradient: linear-gradient(135deg, #0a6ef0 0%, #0052cc 100%);
  --lp-em-color: #0a6ef0;

  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  background: var(--lp-bg);
  color: var(--lp-text);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.lp-container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ─── NAV ──────────────────────────────────── */
.lp-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
  border-bottom: 1px solid transparent;
}
.lp-nav--scrolled {
  background: rgba(248, 250, 252, 0.92);
  backdrop-filter: blur(20px) saturate(1.4);
  border-color: #e2e8f0;
}
.lp-nav-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
  height: 68px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.lp-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.lp-brand-logo {
  height: 36px;
  width: auto;
  max-width: 175px;
  object-fit: contain;
  display: block;
}

.lp-nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 16px;
}
.lp-nav-links a {
  color: #64748b;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
}
.lp-nav-links a:hover {
  color: var(--lp-text);
  background: rgba(15, 23, 42, 0.05);
}

.lp-nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.lp-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.lp-btn-ghost:hover {
  color: var(--lp-text);
  background: rgba(15, 23, 42, 0.06);
}

.lp-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: white;
  background: #0a6ef0;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 3px 8px rgba(10, 110, 240, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.lp-btn-primary:hover {
  background: #0056cc;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(10, 110, 240, 0.35);
}
.lp-btn-primary:active {
  transform: translateY(0);
}
.lp-btn-sm {
  padding: 7px 14px;
  font-size: 12.5px;
}
.lp-btn-lg {
  padding: 13px 26px;
  font-size: 14.5px;
  border-radius: 12px;
}

.lp-hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
}
.lp-hamburger-line {
  width: 22px;
  height: 2px;
  background: var(--lp-text);
  border-radius: 2px;
  transition: transform 0.25s, opacity 0.25s;
}
.lp-hamburger-line.open-1 {
  transform: translateY(7px) rotate(45deg);
}
.lp-hamburger-line.open-2 {
  transform: translateY(-7px) rotate(-45deg);
}

.lp-mobile-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 24px 20px;
  background: rgba(250, 249, 246, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e5e5dd;
}
.lp-mobile-menu a {
  color: var(--lp-text);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  padding: 12px 8px;
  border-radius: 8px;
  transition: background 0.2s;
  display: block;
}
.lp-mobile-menu a:hover {
  background: rgba(0, 0, 0, 0.04);
}

/* ─── HERO ──────────────────────────────────── */
.lp-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 130px 24px 80px;
  overflow: hidden;
}

.lp-mesh {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.mesh-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.6;
}
.mesh-blob-1 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(10, 110, 240, 0.20) 0%, transparent 70%);
  top: -200px;
  left: -200px;
  animation: blob-drift 14s ease-in-out infinite alternate;
}
.mesh-blob-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.16) 0%, transparent 70%);
  top: 100px;
  right: -150px;
  animation: blob-drift 18s ease-in-out infinite alternate-reverse;
}
.mesh-blob-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(10, 30, 60, 0.08) 0%, transparent 70%);
  bottom: 0;
  left: 40%;
  animation: blob-drift 10s ease-in-out infinite alternate;
}
.mesh-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.035) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%);
}
@keyframes blob-drift {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(40px, 30px) scale(1.08);
  }
}

.lp-hero-content {
  position: relative;
  max-width: 1160px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
}

.lp-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px 5px 8px;
  border-radius: 999px;
  border: 1px solid rgba(10, 110, 240, 0.2);
  background: rgba(10, 110, 240, 0.06);
  font-size: 12px;
  font-weight: 500;
  color: #0a6ef0;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0a6ef0;
  box-shadow: 0 0 8px rgba(10, 110, 240, 0.5);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(10, 110, 240, 0.5);
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 14px rgba(10, 110, 240, 0.7);
  }
}

.lp-hero-h1 {
  font-size: clamp(40px, 6vw, 76px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.045em;
  color: #0f172a;
}
.lp-gradient-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  color: var(--lp-em-color);
  letter-spacing: -0.04em;
}

.lp-hero-sub {
  font-size: clamp(15px, 1.8vw, 18px);
  color: var(--lp-muted);
  line-height: 1.75;
  max-width: 620px;
}

.lp-hero-cta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.lp-hero-footnote {
  font-size: 11px;
  color: var(--lp-muted-light);
}

/* Staggered entrance animations */
.lp-anim {
  opacity: 0;
  transform: translateY(24px);
  animation: lp-enter 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.lp-anim-1 { animation-delay: 0.1s; }
.lp-anim-2 { animation-delay: 0.2s; }
.lp-anim-3 { animation-delay: 0.35s; }
.lp-anim-4 { animation-delay: 0.5s; }
.lp-anim-5 { animation-delay: 0.7s; }

@keyframes lp-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ─── PRODUCT MOCKUP ────────────────────────── */
.lp-mockup-wrap {
  width: 100%;
  max-width: 880px;
  margin-top: 12px;
  border-radius: 16px;
  border: 1px solid #dcddd5;
  background: #fff;
  box-shadow:
    0 0 0 1px rgba(37, 78, 59, 0.06),
    0 40px 100px -20px rgba(33, 60, 49, 0.2),
    0 8px 40px -8px rgba(33, 60, 49, 0.1);
  overflow: hidden;
}

.lp-mockup-chrome {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #f7f6f2;
  border-bottom: 1px solid #e5e5dd;
}
.chrome-dots {
  display: flex;
  gap: 5px;
}
.chrome-dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: block;
}
.chrome-dots i:nth-child(1) { background: #ff5f57; }
.chrome-dots i:nth-child(2) { background: #febc2e; }
.chrome-dots i:nth-child(3) { background: #28c840; }
.lp-mockup-chrome > span {
  font-size: 10.5px;
  color: #939c8c;
  font-family: monospace;
}

.lp-mockup-body {
  display: grid;
  grid-template-columns: 210px 1fr;
  min-height: 350px;
}

.lp-mock-sidebar {
  background: #f7f6f2;
  border-right: 1px solid #e5e5dd;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mock-brand {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}
.mock-logo-img {
  height: 24px;
  width: auto;
  object-fit: contain;
}
.mock-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 7px;
  font-size: 11.5px;
  color: #70776f;
  cursor: pointer;
  transition: background 0.15s;
}
.mock-nav-item.active {
  background: rgba(10, 110, 240, 0.1);
  color: #0a6ef0;
  font-weight: 600;
}
.mock-icon {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: currentColor;
  opacity: 0.3;
}

.lp-mock-main {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mock-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.mock-title-line {
  width: 180px;
  height: 12px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.1);
}
.mock-sub-line {
  width: 120px;
  height: 8px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.06);
  margin-top: 8px;
}
.mock-badge-pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(10, 110, 240, 0.08);
  border: 1px solid rgba(10, 110, 240, 0.18);
  font-size: 10px;
  color: #0a6ef0;
  white-space: nowrap;
}

.mock-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.mock-stat {
  padding: 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.mock-stat span {
  display: block;
  font-size: 10px;
  color: var(--lp-muted);
  margin-bottom: 4px;
}
.mock-stat strong {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: var(--lp-text);
  letter-spacing: -0.04em;
  margin-bottom: 8px;
}
.stat-bar {
  height: 3px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.stat-bar::after {
  content: '';
  display: block;
  height: 100%;
  width: var(--pct);
  background: var(--lp-gradient);
  border-radius: 999px;
}

.mock-cards-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mock-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 9px;
  background: #f7f6f2;
  border: 1px solid #e5e5dd;
}
.mc-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}
.mc-a1 { background: linear-gradient(135deg, #0a6ef0, #0052cc); }
.mc-a2 { background: linear-gradient(135deg, #0a1e3c, #1e293b); }
.mc-a3 { background: linear-gradient(135deg, #0aaa64, #059669); }
.mc-info {
  flex: 1;
  min-width: 0;
}
.mc-info strong {
  display: block;
  font-size: 11px;
  color: var(--lp-text);
}
.mc-info span {
  display: block;
  font-size: 10px;
  color: var(--lp-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mc-status {
  font-size: 9.5px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  white-space: nowrap;
}
.mc-status.interested { background: rgba(10, 110, 240, 0.1); color: #0a6ef0; }
.mc-status.callback { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.mc-status.enrolled { background: rgba(10, 170, 100, 0.1); color: #0aaa64; }

/* ─── FEATURES ──────────────────────────────── */
.lp-features {
  padding: 100px 24px;
}
.lp-section-header {
  text-align: center;
  max-width: 620px;
  margin: 0 auto 64px;
}
.lp-eyebrow {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #628b63;
  margin-bottom: 14px;
}
.lp-section-h2 {
  font-size: clamp(32px, 4.5vw, 52px);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.1;
  color: #213c31;
  margin-bottom: 18px;
}
.lp-section-h2 em {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: normal;
  font-weight: 400;
  color: var(--lp-em-color);
  letter-spacing: -0.05em;
}
.lp-section-sub {
  font-size: 15px;
  color: var(--lp-muted);
  line-height: 1.7;
}

/* Bento grid */
.lp-bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}
.bento-card {
  background: var(--lp-surface);
  border: 1px solid #e5e5dd;
  border-radius: 18px;
  padding: 28px;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
  position: relative;
  overflow: hidden;
}
.bento-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 0% 0%, rgba(37, 78, 59, 0.04) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}
.bento-card:hover::before { opacity: 1; }
.bento-card:hover {
  border-color: rgba(37, 78, 59, 0.2);
  transform: translateY(-3px);
  box-shadow: 0 16px 48px -12px rgba(33, 60, 49, 0.14), 0 0 0 1px rgba(37, 78, 59, 0.08);
}
.bento-wide { grid-column: span 4; }
.bento-narrow { grid-column: span 2; }
.bento-mid { grid-column: span 3; }

.bento-card h3 {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.035em;
  color: #213c31;
  line-height: 1.25;
  margin: 14px 0 10px;
}
.bento-card p {
  font-size: 13.5px;
  color: var(--lp-muted);
  line-height: 1.7;
}

.bento-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bento-blue { background: rgba(10, 110, 240, 0.08); color: #0a6ef0; border: 1px solid rgba(10, 110, 240, 0.15); }
.bento-purple { background: rgba(80, 65, 100, 0.08); color: #5a4a72; border: 1px solid rgba(80, 65, 100, 0.12); }
.bento-emerald { background: rgba(10, 170, 100, 0.08); color: #0aaa64; border: 1px solid rgba(10, 170, 100, 0.15); }
.bento-orange { background: rgba(160, 100, 40, 0.08); color: #8a5a20; border: 1px solid rgba(160, 100, 40, 0.12); }
.bento-rose { background: rgba(160, 60, 60, 0.08); color: #8a3a3a; border: 1px solid rgba(160, 60, 60, 0.12); }

/* Lead demo */
.bento-lead-demo {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bld-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.bld-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}
.bld-av1 { background: linear-gradient(135deg, #0a6ef0, #0052cc); }
.bld-av2 { background: linear-gradient(135deg, #0a1e3c, #1e293b); }
.bld-meta { flex: 1; }
.bld-meta strong { display: block; font-size: 12px; color: #0f172a; }
.bld-meta span { display: block; font-size: 11px; color: var(--lp-muted); }
.bld-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
}
.bld-tag.counselling { background: rgba(10, 110, 240, 0.1); color: #0a6ef0; }
.bld-tag.callback { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.bld-followup {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  font-size: 11px;
  color: #0a6ef0;
  background: rgba(10, 110, 240, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(10, 110, 240, 0.15);
}

/* Class pills */
.bento-class-pills {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cp {
  display: block;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}
.cp-open { background: rgba(10, 170, 100, 0.08); color: #0aaa64; border: 1px solid rgba(10, 170, 100, 0.15); }
.cp-filling { background: rgba(245, 158, 11, 0.08); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.15); }

/* Mini chart */
.bento-chart-mini {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 60px;
  margin-top: 24px;
}
.mini-bar {
  flex: 1;
  height: var(--h);
  border-radius: 4px 4px 0 0;
  background: linear-gradient(to top, #0a6ef0, #38bdf8);
  opacity: 0.75;
  transition: opacity 0.2s;
}
.mini-bar:hover { opacity: 1; }
.bento-progress-track {
  position: relative;
  height: 4px;
  background: rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  margin-top: 14px;
  overflow: hidden;
}
.bento-progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--lp-gradient);
  border-radius: 999px;
}
.bento-progress-track + span {
  display: block;
  margin-top: 7px;
  font-size: 11px;
  color: var(--lp-muted);
}

/* Team pills */
.bento-team-row {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.team-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: var(--lp-muted);
  background: #f8fafc;
}
.tp-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.tp-admin { background: #0a1e3c; }
.tp-counsel { background: #0a6ef0; }
.tp-mgr { background: #d97706; }

/* Mobile demo buttons */
.bento-mobile-demo {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}
.bmd-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  cursor: default;
}
.bmd-call { background: #f8fafc; border: 1px solid #e2e8f0; color: var(--lp-muted); }
.bmd-whatsapp { background: rgba(10, 170, 100, 0.08); border: 1px solid rgba(10, 170, 100, 0.18); color: #0aaa64; }
.bmd-status { background: #0a6ef0; color: white; }

/* ─── WORKFLOW ──────────────────────────────── */
.lp-workflow {
  padding: 100px 24px;
  background: #f1f5f9;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.lp-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-top: 64px;
  position: relative;
}
.lp-steps::before {
  content: '';
  position: absolute;
  top: 34px;
  left: calc(16.67% + 28px);
  right: calc(16.67% + 28px);
  height: 1px;
  background: linear-gradient(to right, rgba(10, 110, 240, 0.35), rgba(10, 110, 240, 0.15));
}

.lp-step { position: relative; }
.step-number {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #0a6ef0;
  margin-bottom: 24px;
  font-family: monospace;
}
.step-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.step-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step-blue { background: rgba(10, 110, 240, 0.1); color: #0a6ef0; border: 1px solid rgba(10, 110, 240, 0.18); }
.step-purple { background: rgba(80, 65, 100, 0.1); color: #5a4a72; border: 1px solid rgba(80, 65, 100, 0.16); }
.step-emerald { background: rgba(10, 170, 100, 0.1); color: #0aaa64; border: 1px solid rgba(10, 170, 100, 0.18); }
.step-icon-svg { display: flex; }

.step-body h3 {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #0f172a;
}
.step-body p {
  font-size: 13.5px;
  color: #64748b;
  line-height: 1.7;
}

/* ─── FAQ ──────────────────────────────────── */
.lp-faq {
  padding: 100px 24px;
}
.faq-grid {
  max-width: 740px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.faq-item {
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.15s;
  border-radius: 4px;
  padding: 0 4px;
}
.faq-item:hover { background: rgba(15, 23, 42, 0.02); }
.faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 0;
  font-size: 14.5px;
  font-weight: 500;
  color: #0f172a;
}
.faq-chevron {
  flex-shrink: 0;
  color: var(--lp-muted);
  transition: transform 0.2s;
}
.faq-chevron.open {
  transform: rotate(180deg);
  color: #0a6ef0;
}
.faq-a {
  padding: 0 0 20px;
  font-size: 13.5px;
  color: var(--lp-muted);
  line-height: 1.75;
  animation: faq-open 0.2s ease-out;
}
@keyframes faq-open {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── CTA ──────────────────────────────────── */
.lp-cta {
  padding: 80px 24px 100px;
}
.lp-cta-card {
  position: relative;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(10, 110, 240, 0.08) 0%, rgba(14, 165, 233, 0.04) 100%);
  border: 1px solid rgba(10, 110, 240, 0.18);
  padding: 80px 60px;
  text-align: center;
  overflow: hidden;
}
.cta-glow {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse at center, rgba(10, 110, 240, 0.20) 0%, transparent 70%);
  pointer-events: none;
}
.cta-content { position: relative; }
.lp-cta-h2 {
  font-size: clamp(34px, 5vw, 56px);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.15;
  color: #213c31;
  margin: 14px 0 16px;
}
.lp-cta-h2 em {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: normal;
  font-weight: 400;
  color: var(--lp-em-color);
  letter-spacing: -0.05em;
}
.lp-cta-card > .cta-content > p {
  font-size: 15px;
  color: #70776f;
  margin-bottom: 36px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.cta-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.cta-btn {
  box-shadow: 0 8px 32px rgba(37, 78, 59, 0.22);
}
.cta-footnote {
  font-size: 12px;
  color: var(--lp-muted-light);
}

/* ─── FOOTER ──────────────────────────────── */
.lp-footer {
  border-top: 1px solid #e5e5dd;
  padding: 40px 24px;
  background: #f7f6f2;
}
.lp-footer-inner {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}
.lp-footer-brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lp-footer-brand p {
  font-size: 12.5px;
  color: var(--lp-muted);
}
.lp-footer-links {
  display: flex;
  gap: 6px;
  margin-left: auto;
}
.lp-footer-links a {
  color: var(--lp-muted);
  text-decoration: none;
  font-size: 12.5px;
  padding: 5px 10px;
  border-radius: 7px;
  transition: color 0.2s;
}
.lp-footer-links a:hover { color: var(--lp-text); }
.lp-footer-copy {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--lp-muted-light);
  padding-top: 20px;
  border-top: 1px solid #e5e5dd;
}
.lp-back-top {
  color: var(--lp-muted);
  text-decoration: none;
  font-size: 11.5px;
  transition: color 0.2s;
}
.lp-back-top:hover { color: var(--lp-text); }

/* ─── SCROLL REVEAL ──────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }

/* ─── RESPONSIVE ─────────────────────────── */
@media (max-width: 900px) {
  .lp-nav-links, .lp-nav-actions { display: none; }
  .lp-hamburger { display: flex; }
  .lp-bento { grid-template-columns: 1fr 1fr; }
  .bento-wide, .bento-narrow, .bento-mid { grid-column: span 2; }
  .lp-steps { grid-template-columns: 1fr; gap: 32px; }
  .lp-steps::before { display: none; }
  .lp-mockup-body { grid-template-columns: 1fr; }
  .lp-mock-sidebar { display: none; }
}
@media (max-width: 640px) {
  .lp-hero { padding: 100px 20px 60px; }
  .lp-bento { grid-template-columns: 1fr; }
  .bento-wide, .bento-narrow, .bento-mid { grid-column: span 1; }
  .mock-stats { grid-template-columns: 1fr 1fr; }
  .mock-cards-row .mock-card:last-child { display: none; }
  .lp-cta-card { padding: 50px 24px; }
  .lp-footer-inner { flex-direction: column; align-items: flex-start; gap: 20px; }
  .lp-footer-links { margin-left: 0; flex-wrap: wrap; }
}

@media (prefers-reduced-motion: reduce) {
  .lp-anim { animation: none; opacity: 1; transform: none; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .mesh-blob { animation: none; }
}
</style>