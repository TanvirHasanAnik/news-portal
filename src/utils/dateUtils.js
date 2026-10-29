function toBengaliDigits(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)]);
}

export function getEnglishDateBangla(d = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('bn-BD', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(d).replace(/,\s*([০-৯\d]+)$/, ' $1');
  } catch (e) {
    return 'বৃহস্পতিবার, ১৫ অক্টোবর ২০২৬';
  }
}

export function getBanglaDate(d = new Date()) {
  const months = [
    'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
    'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
  ];

  const year = d.getFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

  const boishakh1 = new Date(year, 3, 14);
  let banglaYear = year - 593;
  let diffDays;

  const dZero = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const bZero = new Date(boishakh1.getFullYear(), boishakh1.getMonth(), boishakh1.getDate());

  if (dZero < bZero) {
    banglaYear = year - 594;
    const prevBoishakh1 = new Date(year - 1, 3, 14);
    diffDays = Math.round((dZero - prevBoishakh1) / (1000 * 60 * 60 * 24));
  } else {
    diffDays = Math.round((dZero - bZero) / (1000 * 60 * 60 * 24));
  }

  const daysInMonths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeap ? 30 : 29, 30];

  let monthIndex = 0;
  let day = diffDays + 1;
  for (let i = 0; i < daysInMonths.length; i++) {
    if (day <= daysInMonths[i]) {
      monthIndex = i;
      break;
    }
    day -= daysInMonths[i];
  }

  return `${toBengaliDigits(day)} ${months[monthIndex]} ${toBengaliDigits(banglaYear)} বঙ্গাব্দ`;
}

export function getHijriDate(d = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('bn-BD-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    let formatted = formatter.format(d);

    formatted = formatted.replace(',', '').replace(/যুগ/g, 'হিজরি').trim();
    if (!formatted.includes('হিজরি')) {
      formatted += ' হিজরি';
    }
    return formatted;
  } catch (e) {
    return '৪ জমাদিউল আউয়াল ১৪৪৮ হিজরি';
  }
}

export function parseDateSafe(timestamp) {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  let str = String(timestamp).trim();
  if (!str) return null;
  if (!str.includes('Z') && !str.includes('+') && !str.includes('-0') && !str.includes('+0')) {
    str = str.replace(' ', 'T') + 'Z';
  } else {
    str = str.replace(' ', 'T');
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'কিছুক্ষণ আগে';
  try {
    const date = parseDateSafe(timestamp);
    if (!date) return 'কিছুক্ষণ আগে';
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now - date) / 1000));

    if (diffSeconds < 60) {
      return 'এইমাত্র';
    }
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${toBengaliDigits(diffMinutes)} মিনিট আগে`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${toBengaliDigits(diffHours)} ঘণ্টা আগে`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${toBengaliDigits(diffDays)} দিন আগে`;
    }

    return getEnglishDateBangla(date);
  } catch (_e) {
    return 'কিছুক্ষণ আগে';
  }
}

const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export function formatStaticDateTime(timestamp) {
  if (!timestamp) return '—';
  try {
    const d = parseDateSafe(timestamp);
    if (!d) return '—';

    const day = toBengaliDigits(d.getDate());
    const month = BENGALI_MONTHS[d.getMonth()] || '';
    const year = toBengaliDigits(d.getFullYear());

    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const bnHours = toBengaliDigits(hours);
    const bnMinutes = toBengaliDigits(String(d.getMinutes()).padStart(2, '0'));

    return `${day} ${month} ${year}, ${bnHours}:${bnMinutes} ${ampm}`;
  } catch (_e) {
    return '—';
  }
}

export const formatAuditDateTime = formatStaticDateTime;
