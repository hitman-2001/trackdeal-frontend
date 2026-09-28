export const EDUCATION_STATUSES = [
  { value: 'interested', label: 'Interested', variant: 'warning' },
  { value: 'not_interested', label: 'Not Interested', variant: 'danger' },
  { value: 'future_prospect', label: 'Future Prospect', variant: 'info' },
  { value: 'call_back', label: 'Call Back', variant: 'info' },
  { value: 'enrolled', label: 'Enrolled', variant: 'success' },
];

export const EDUCATION_SUB_STATUS_MAP = {
  interested: [
    'Follow-Up Needed',
    'Branch Visit Pending',
    'Branch Visit Done',
    'Demo Lecture Scheduled',
    'Demo class attended',
    'Ready to Enroll',
    'Fee Discussion',
    'Others',
  ],
  not_interested: [
    'Wrong Number',
    'Joined With others',
    'Distance issue',
    'Ex-Student',
    'Fee Too High',
    'Not Eligible',
    'Others',
  ],
  call_back: [
    'Ringing',
    'Call Disconnected',
    'Parent was Busy',
    'Student in Class / Exam',
    'Busy / Out of Station',
    'Requested Callback Later',
    'Switch Off',
    'Others',
  ],
  future_prospect: [
    'Next Batch / Semester',
    'Budget / Financial Planning',
    'Decision Pending with Parents',
    'Exploring Options',
    'Exam in Progress',
    'Others',
  ],
  enrolled: [
    'Fee Paid (Full)',
    'Fee Paid (Partial / Token)',
    'Documentation Pending',
    'Batch Allocated',
    'Admission Confirmed',
    'Others',
  ],
};

export const LEGACY_STATUS_MAP = {
  new: 'interested',
  contacted: 'interested',
  follow_up: 'interested',
  meeting_scheduled: 'interested',
  qualified: 'interested',
  application_trial: 'interested',
  converted: 'enrolled',
  on_hold: 'call_back',
  lost: 'not_interested',
};

export function normalizeStatus(status) {
  if (!status) return 'interested';
  const s = String(status).toLowerCase();
  if (EDUCATION_SUB_STATUS_MAP[s]) return s;
  return LEGACY_STATUS_MAP[s] || 'interested';
}
