<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
    <!-- Header / Navigation -->
    <header class="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2.5">
          <img src="/trackdeal_logo.png" alt="TrackDeal Logo" class="h-8 w-auto object-contain" />
        </router-link>

        <div class="flex items-center gap-3">
          <router-link
            to="/"
            class="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            &larr; Back to Home
          </router-link>
          <router-link
            to="/login"
            class="text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
          >
            Sign in
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <!-- Title Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span class="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Official Legal Policy
          </span>
          <span class="text-xs text-slate-400">Effective & Last Updated: 25 October 2026</span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          TrackDeal &bull; Lead Management Platform for Educational Organizations
          <br class="hidden sm:inline" />
          Website: <a href="https://trackdeal.in" class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">trackdeal.in</a> &bull; Application: TrackDeal
        </p>

        <!-- Advisory Notice -->
        <div class="mt-5 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
          <strong>Notice:</strong> This Privacy Policy is a product-specific legal document prepared for the TrackDeal functionality and Excel import template. Before publication, TrackDeal should insert its legal entity name, official privacy/contact email, registered address, actual third-party service providers, and any legally required jurisdiction-specific provisions.
        </div>
      </div>

      <!-- Policy Body Sections -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
        <!-- 1. Introduction -->
        <section class="space-y-3 pt-6 first:pt-0">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">1.</span>
            <span>Introduction</span>
          </h2>
          <p>
            TrackDeal is a lead management and admission workflow platform designed for educational organizations such as coaching classes, private classes, academies, schools, colleges, and other education-focused institutions. TrackDeal is available through its website and application.
          </p>
          <p>
            The platform helps organizations record and manage admission inquiries, maintain student and parent information, assign leads to staff, schedule and track follow-ups, manage student records, and monitor the progress of leads through the admission process.
          </p>
          <p>
            This Privacy Policy explains how information may be collected, used, stored, processed, shared, and protected when TrackDeal is used.
          </p>
        </section>

        <!-- 2. Who This Policy Applies To -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">2.</span>
            <span>Who This Policy Applies To</span>
          </h2>
          <p>
            This Policy applies to users of the TrackDeal website and application, including administrators, staff members, and other authorized users of an organization that has an account with TrackDeal.
          </p>
          <p>
            TrackDeal may process information about prospective students, students, parents, or guardians because an authorized educational organization enters that information into TrackDeal. In those situations, the organization using TrackDeal is responsible for ensuring that it has the appropriate authority, notice, consent, or other lawful basis required to collect and use the information.
          </p>
        </section>

        <!-- 3. Information We Collect and Process -->
        <section class="space-y-4 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">3.</span>
            <span>Information We Collect and Process</span>
          </h2>

          <div class="space-y-2">
            <h3 class="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
              3.1 Information Entered Through the New Student Lead Form
            </h3>
            <p>
              An authorized user may create an individual student lead by entering information into the TrackDeal lead form. Depending on the organization's configuration and the information provided, this may include:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Student first name and last name.</li>
              <li>Primary mobile number.</li>
              <li>Alternate phone number.</li>
              <li>School, college, or institution name.</li>
              <li>Institution type (e.g. School, College, Private, Integrated).</li>
              <li>Education board, such as CBSE, ICSE, or State Board.</li>
              <li>Standard or grade, including configured grades such as Class 8, Class 9, Class 10, Class 11, and Class 12.</li>
              <li>Academic stream, such as Science or Commerce.</li>
              <li>Current coaching or private classes, where applicable.</li>
              <li>Inquiry source, such as walk-in or another configured source.</li>
              <li>Parent or guardian name.</li>
              <li>Parent or guardian mobile number.</li>
              <li>Native place and other customer-configured custom attributes, where enabled.</li>
            </ul>
          </div>

          <div class="space-y-2 pt-2">
            <h3 class="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
              3.2 Information Entered Through Bulk Lead / Student Import
            </h3>
            <p>
              TrackDeal also supports bulk data import using an Excel file. An authorized administrator or staff member may upload an Excel file containing multiple lead or student records instead of entering each record individually.
            </p>
            <p>
              The TrackDeal Excel import template supported by the platform contains the following fields:
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
              <div>&bull; First Name</div>
              <div>&bull; Last Name</div>
              <div>&bull; Primary Mobile</div>
              <div>&bull; Alternate Phone</div>
              <div>&bull; College / School Name</div>
              <div>&bull; Institution Type</div>
              <div>&bull; Education Board</div>
              <div>&bull; Standard / Grade</div>
              <div>&bull; Academic Stream</div>
              <div>&bull; Parent Name</div>
              <div>&bull; Parent Mobile</div>
              <div>&bull; Email Address</div>
              <div>&bull; Student Status</div>
              <div>&bull; Academic Notes</div>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              The exact information processed during an import depends on the fields and records supplied by the authorized user. Organizations should not upload information that they are not authorized or legally permitted to process.
            </p>
          </div>

          <div class="space-y-2 pt-2">
            <h3 class="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
              3.3 Lead, Follow-Up and Activity Information
            </h3>
            <p>
              TrackDeal may also process operational information associated with a lead, including:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Lead status, such as Interested, Call Back, Future Prospect, Enrolled, and Not Interested.</li>
              <li>Assigned staff member.</li>
              <li>Follow-up tasks and scheduled activities.</li>
              <li>Task completion and overdue status.</li>
              <li>Notes and activity information entered by authorized users.</li>
              <li>Activity timestamps and changes to lead status.</li>
              <li>Information used to determine the ordering or priority of leads in the active pipeline.</li>
            </ul>
          </div>

          <div class="space-y-2 pt-2">
            <h3 class="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
              3.4 Staff and Administrator Account Information
            </h3>
            <p>For users of the TrackDeal platform, TrackDeal may process:</p>
            <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Name.</li>
              <li>Registered email address.</li>
              <li>Username or other account identifier.</li>
              <li>Authentication and account credentials.</li>
              <li>Role, such as Admin or Staff.</li>
              <li>Permissions and access settings.</li>
              <li>Account status, including active, deactivated, or terminated status.</li>
              <li>Relevant account activity and audit information.</li>
            </ul>
          </div>
        </section>

        <!-- 4. How TrackDeal Uses Information -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">4.</span>
            <span>How TrackDeal Uses Information</span>
          </h2>
          <p>TrackDeal may use information for the following purposes:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Providing and operating the TrackDeal website and application.</li>
            <li>Creating and managing student leads and admission inquiries.</li>
            <li>Maintaining student and parent/guardian records entered by an authorized customer organization.</li>
            <li>Assigning leads to staff members according to configured assignment rules.</li>
            <li>Supporting equal split distribution and fixed-batch round-robin workflows.</li>
            <li>Allowing authorized users to filter and segment leads.</li>
            <li>Managing follow-ups, tasks, reminders, and overdue activities.</li>
            <li>Sending operational emails, including staff onboarding emails and overdue-task summaries.</li>
            <li>Sending in-app and push notifications for lead assignments and task updates.</li>
            <li>Supporting student enrollment and related administrative workflows.</li>
            <li>Maintaining activity and audit records.</li>
            <li>Processing bulk Excel imports.</li>
            <li>Maintaining service security, reliability, troubleshooting, and performance.</li>
            <li>Detecting and investigating unauthorized access, misuse, or security incidents.</li>
            <li>Complying with applicable legal, regulatory, and contractual obligations.</li>
          </ul>
        </section>

        <!-- 5. Lead Filtering and Segmentation -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">5.</span>
            <span>Lead Filtering and Segmentation</span>
          </h2>
          <p>
            TrackDeal allows authorized users to filter and segment leads based on information captured in the system. Depending on the organization's configuration, filtering may include:
          </p>
          <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Institution type, such as School, College, Coaching / Private Classes, or other configured types.</li>
            <li>Education Board, such as CBSE, ICSE, and State Board.</li>
            <li>Standard / Grade.</li>
            <li>Academic Stream, such as Science and Commerce.</li>
            <li>Lead status.</li>
            <li>Assigned staff member.</li>
          </ul>
        </section>

        <!-- 6. Lead Distribution and Staff Assignment -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">6.</span>
            <span>Lead Distribution and Staff Assignment</span>
          </h2>
          <p>
            TrackDeal supports configured lead distribution rules:
          </p>
          <ul class="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>
              <strong>Equal Split Distribution:</strong> Divides any number of leads equally across selected staff members. If an exact split leaves a remainder (e.g., 501 leads across 5 staff), the base leads are allocated evenly (100 each) and the remainder lead is sequentially assigned to the initial staff member to ensure 100% allocation with zero unassigned leads.
            </li>
            <li>
              <strong>Batch Round-Robin:</strong> Assigns leads in fixed batch sizes (e.g., batches of 10) sequentially and cyclically across selected staff members.
            </li>
            <li>
              <strong>Staff Deactivation:</strong> When a staff member is deactivated or terminated, active leads assigned to that staff member may be returned to the Admin for re-allocation according to the organization's configured workflow.
            </li>
          </ul>
        </section>

        <!-- 7. Staff and Administrator Access -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">7.</span>
            <span>Staff and Administrator Access</span>
          </h2>
          <p>
            TrackDeal provides different account roles, including Admin and Staff. An Admin may have broader administrative privileges, including user management, permissions, lead oversight, and other administrative functions. Staff access may be limited according to permissions assigned by the Admin.
          </p>
          <p>
            Customer organizations are responsible for configuring appropriate access and ensuring that only authorized personnel can access student, parent, and lead information.
          </p>
        </section>

        <!-- 8. Bulk Excel Import and Temporary Files -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">8.</span>
            <span>Bulk Excel Import and Temporary Files</span>
          </h2>
          <p>
            TrackDeal supports bulk lead/student import through Excel files. When an authorized user uploads an Excel file, the file may be processed through temporary storage or processing infrastructure for the purpose of importing the records into TrackDeal.
          </p>
          <p>
            TrackDeal is designed to safely purge or delete uploaded Excel files from temporary storage after the import process is completed, subject to any limited technical records, logs, backups, or security records that may need to be retained for operational, security, or legal reasons.
          </p>
          <p>
            The organization uploading the file is responsible for ensuring that the file contains only information that it is authorized to upload and process.
          </p>
        </section>

        <!-- 9. Automated Emails and Notifications -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">9.</span>
            <span>Automated Emails and Notifications</span>
          </h2>
          <p>TrackDeal may send the following service-related communications:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Welcome or onboarding emails to newly created staff accounts.</li>
            <li>Emails containing account setup or login information where the organization's workflow requires such communication.</li>
            <li>Daily morning overdue-task or pending-task summaries to administrators.</li>
            <li>In-app notifications for lead assignments and task updates.</li>
            <li>Push notifications where the application and device configuration supports them.</li>
          </ul>
          <p>
            These communications are intended to operate the TrackDeal service and support the organization's admission and follow-up workflows.
          </p>
        </section>

        <!-- 10. Activity-Based Lead Prioritization -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">10.</span>
            <span>Activity-Based Lead Prioritization</span>
          </h2>
          <p>
            TrackDeal may use activity information to organize the active lead pipeline. For example, when a follow-up or task is completed, the associated lead may receive a lower priority and move down in the active pipeline view. This is a workflow and display function and does not by itself determine a person's eligibility for admission.
          </p>
        </section>

        <!-- 11. How Information Is Shared -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">11.</span>
            <span>How Information Is Shared</span>
          </h2>
          <p>
            TrackDeal does not sell personal information as a product. Information may be accessible to the customer organization and its authorized users as part of the TrackDeal service.
          </p>
          <p>Information may also be disclosed or processed:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>By authorized administrators and staff of the customer organization, according to their permissions.</li>
            <li>By service providers that support hosting, storage, email delivery, push notifications, security, monitoring, or other essential service functions, where applicable.</li>
            <li>When required by applicable law, regulation, court order, or lawful governmental request.</li>
            <li>When reasonably necessary to investigate fraud, abuse, security incidents, or threats to the service or its users.</li>
          </ul>
        </section>

        <!-- 12. No Integrated Payment Processing -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">12.</span>
            <span>No Integrated Payment Processing</span>
          </h2>
          <p>
            TrackDeal does not currently have an integrated payment system for collecting payments through the TrackDeal website or application. TrackDeal therefore does not currently collect or process payment card, credit card, debit card, or banking information through an in-product payment gateway.
          </p>
        </section>

        <!-- 13. Student and Minor Information -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">13.</span>
            <span>Student and Minor Information</span>
          </h2>
          <p>
            TrackDeal may be used by educational organizations to manage information relating to students, including students who may be minors. The platform may therefore contain student names, school or college information, grade, education board, academic stream, parent/guardian information, and other admission-related information.
          </p>
          <p>
            TrackDeal is an administrative lead-management platform and does not require students to directly provide personal information for unrelated purposes. Where an organization enters information about a student or minor, the organization is responsible for ensuring that the collection and processing of that information complies with applicable law and any required parental or guardian authorization.
          </p>
        </section>

        <!-- 14. Data Security -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">14.</span>
            <span>Data Security</span>
          </h2>
          <p>
            TrackDeal uses reasonable technical and organizational measures intended to protect information against unauthorized access, alteration, disclosure, loss, or misuse. Depending on the service component, these measures may include authentication, role-based access controls, encrypted network connections, controlled infrastructure access, backups, monitoring, and audit/activity logging.
          </p>
          <p>
            No system can be guaranteed to be completely secure. Users and customer organizations should use strong passwords, protect account credentials, restrict access to authorized personnel, and promptly report suspected security incidents.
          </p>
        </section>

        <!-- 15. Data Retention and Deletion -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">15.</span>
            <span>Data Retention and Deletion</span>
          </h2>
          <p>
            TrackDeal may retain information for as long as reasonably necessary to provide the service, maintain customer accounts, support operational workflows, maintain appropriate audit and security records, resolve disputes, and comply with legal or contractual requirements.
          </p>
          <p>
            Customer organizations should determine appropriate retention periods for their student, parent, lead, and staff information based on their own legal and operational requirements.
          </p>
          <p>
            Temporary Excel files used for bulk import are intended to be removed after processing, subject to technical logs, backups, or other records that may need to be retained for security, troubleshooting, or compliance purposes.
          </p>
        </section>

        <!-- 16. Cookies and Similar Technologies -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">16.</span>
            <span>Cookies and Similar Technologies</span>
          </h2>
          <p>
            The TrackDeal website or application may use cookies, local storage, session technologies, or similar mechanisms that are necessary for authentication, session management, preferences, security, and core functionality.
          </p>
          <p>
            If TrackDeal enables optional analytics, advertising, or other non-essential tracking technologies, those technologies should be documented separately and used in accordance with applicable law and the consent choices required for the relevant jurisdiction.
          </p>
        </section>

        <!-- 17. Third-Party Services -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">17.</span>
            <span>Third-Party Services</span>
          </h2>
          <p>
            TrackDeal may use third-party infrastructure and service providers to operate parts of the platform, such as hosting, database or storage services, email delivery, push notifications, security, monitoring, or other technical services.
          </p>
          <p>
            Such providers may process information on behalf of TrackDeal to the extent necessary to provide their services and subject to applicable contractual and security requirements.
          </p>
        </section>

        <!-- 18. International Processing -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">18.</span>
            <span>International Processing</span>
          </h2>
          <p>
            Depending on the infrastructure and service providers used by TrackDeal, information may be stored or processed in locations outside the user's state or country. Where required by applicable law, TrackDeal will use appropriate safeguards for such processing or transfer.
          </p>
        </section>

        <!-- 19. Your Privacy Rights -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">19.</span>
            <span>Your Privacy Rights</span>
          </h2>
          <p>
            Depending on applicable law and your relationship with the organization using TrackDeal, you may have rights relating to your personal information, which may include rights to access, correction, deletion, restriction, or other legally available remedies.
          </p>
          <p>
            If your information was entered into TrackDeal by a school, coaching class, academy, or other customer organization, you should generally contact that organization first because it may control the underlying student or lead record. You may also contact TrackDeal using the official privacy contact provided below.
          </p>
        </section>

        <!-- 20. Responsibilities of TrackDeal Customers -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">20.</span>
            <span>Responsibilities of TrackDeal Customers</span>
          </h2>
          <p>Organizations using TrackDeal are responsible for:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Collecting and processing personal information lawfully.</li>
            <li>Providing appropriate privacy notices to parents, students, staff, and other individuals where required.</li>
            <li>Obtaining consent or other lawful authorization where required.</li>
            <li>Ensuring that uploaded Excel files contain only information that the organization is authorized to process.</li>
            <li>Giving access to student, parent, and lead information only to authorized personnel.</li>
            <li>Keeping staff credentials secure.</li>
            <li>Using TrackDeal's role and permission controls appropriately.</li>
            <li>Responding to individual privacy requests where the organization is responsible for the relevant information.</li>
          </ul>
        </section>

        <!-- 21. Changes to This Privacy Policy -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">21.</span>
            <span>Changes to This Privacy Policy</span>
          </h2>
          <p>
            TrackDeal may update this Privacy Policy from time to time to reflect changes in the platform, processing practices, security measures, or applicable legal requirements. The latest version will be made available through the TrackDeal website and/or application, with the effective or last-updated date shown at the beginning of the Policy.
          </p>
        </section>

        <!-- 22. Contact Us -->
        <section class="space-y-3 pt-6">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-mono text-sm">22.</span>
            <span>Contact Us</span>
          </h2>
          <p>
            For privacy questions, requests, or concerns relating to TrackDeal, please contact:
          </p>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
            <p><strong>Platform:</strong> TrackDeal (Lead Management Platform)</p>
            <p><strong>Official Contact & Privacy Email:</strong> <a href="mailto:contact@trackdeal.in" class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">contact@trackdeal.in</a></p>
            <p><strong>Website:</strong> <a href="https://trackdeal.in" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">trackdeal.in</a></p>
          </div>
        </section>
      </div>

      <!-- Quick Back to Top / Footer Link -->
      <div class="flex items-center justify-between text-xs text-slate-500 pt-4">
        <span>&copy; {{ new Date().getFullYear() }} TrackDeal. All rights reserved.</span>
        <router-link to="/" class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Return to Home &rarr;
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' });
});
</script>

