function toBengaliDigits(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)]);
}

export function getEnglishDateBangla(d = new Date()) {
  try {
    const dateObj = parseDateSafe(d) || new Date();
    const formatter = new Intl.DateTimeFormat('bn-BD', {
      timeZone: 'Asia/Dhaka',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(dateObj).replace(/,\s*([০-৯\d]+)$/, ' $1');
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

const HIJRI_MONTHS_BN = [
  'মুহররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানি',
  'জমাদিউল আউয়াল',
  'জমাদিউস সানি',
  'রজব',
  'শাবান',
  'রমজান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ্জ',
];

export function getHijriDate(d = new Date()) {
  try {
    const dateObj = parseDateSafe(d) || new Date();
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(dateObj);
    let day = '';
    let month = '';
    let year = '';

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.type === 'day') day = p.value;
      else if (p.type === 'month') month = p.value;
      else if (p.type === 'year') year = p.value;
    }

    const monthIndex = parseInt(month, 10) - 1;
    const monthName = HIJRI_MONTHS_BN[monthIndex] || 'জমাদিউস সানি';

    return `${toBengaliDigits(day)} ${monthName} ${toBengaliDigits(year)} হিজরি`;
  } catch (e) {
    return '১০ জমাদিউস সানি ১৪৪৮ হিজরি';
  }
}

export function getDhakaDate(d = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    let year = 1970;
    let month = 1;
    let day = 1;
    let hour = 0;
    let minute = 0;
    let second = 0;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.type === 'year') year = parseInt(p.value, 10);
      else if (p.type === 'month') month = parseInt(p.value, 10);
      else if (p.type === 'day') day = parseInt(p.value, 10);
      else if (p.type === 'hour') hour = parseInt(p.value, 10);
      else if (p.type === 'minute') minute = parseInt(p.value, 10);
      else if (p.type === 'second') second = parseInt(p.value, 10);
    }
    return new Date(year, month - 1, day, hour, minute, second);
  } catch (_e) {
    return d;
  }
}

export async function getSyncedPortalDates() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cached = window.sessionStorage.getItem('portal_dates_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.english && parsed?.bangla && parsed?.hijri && parsed?.timestamp) {
        if (Date.now() - parsed.timestamp < 3600000) {
          return {
            english: parsed.english,
            bangla: parsed.bangla,
            hijri: parsed.hijri,
          };
        }
      }
    }
  } catch (_e) {}

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const g = json?.data?.date?.gregorian;
      const h = json?.data?.date?.hijri;

      if (g && h) {
        const year = parseInt(g.year, 10);
        const month = parseInt(g.month?.number, 10);
        const day = parseInt(g.day, 10);
        const dateObj = new Date(year, month - 1, day);

        const english = getEnglishDateBangla(dateObj);
        const bangla = getBanglaDate(dateObj);

        const hijriDay = parseInt(h.day, 10);
        const hijriMonthIdx = parseInt(h.month?.number, 10) - 1;
        const hijriYear = parseInt(h.year, 10);
        const hijriMonthName = HIJRI_MONTHS_BN[hijriMonthIdx] || 'জমাদিউস সানি';
        const hijri = `${toBengaliDigits(hijriDay)} ${hijriMonthName} ${toBengaliDigits(hijriYear)} হিজরি`;

        const result = { english, bangla, hijri };
        try {
          window.sessionStorage.setItem(
            'portal_dates_cache',
            JSON.stringify({ ...result, timestamp: Date.now() })
          );
        } catch (_e) {}
        return result;
      }
    }
  } catch (_err) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://timeapi.io/api/time/current/zone?timeZone=Asia/Dhaka', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const dateObj = new Date(data.year, data.month - 1, data.day);
        const result = {
          english: getEnglishDateBangla(dateObj),
          bangla: getBanglaDate(dateObj),
          hijri: getHijriDate(dateObj),
        };
        try {
          window.sessionStorage.setItem(
            'portal_dates_cache',
            JSON.stringify({ ...result, timestamp: Date.now() })
          );
        } catch (_e) {}
        return result;
      }
    } catch (_e2) {}
  }

  return null;
}

export function parseDateSafe(timestamp) {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'number') {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  }
  let str = String(timestamp).trim();
  if (!str) return null;
  if (/^\d+$/.test(str)) {
    const d = new Date(Number(str));
    return isNaN(d.getTime()) ? null : d;
  }
  if (!/([zZ]|[+-]\d{2}(:?\d{2})?)$/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  } else {
    str = str.replace(' ', 'T');
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'কিছুক্ষণ আগে';
  if (typeof timestamp === 'string' && (timestamp.includes('আগে') || timestamp === 'এইমাত্র')) {
    return timestamp;
  }
  try {
    const date = parseDateSafe(timestamp);
    if (!date || isNaN(date.getTime())) return 'কিছুক্ষণ আগে';
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

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

export function getDhakaParts(timestamp) {
  const d = parseDateSafe(timestamp);
  if (!d || isNaN(d.getTime())) return null;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(d);
    let year = 1970;
    let month = 1;
    let day = 1;
    let hour = 0;
    let minute = 0;
    let second = 0;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.type === 'year') year = parseInt(p.value, 10);
      else if (p.type === 'month') month = parseInt(p.value, 10);
      else if (p.type === 'day') day = parseInt(p.value, 10);
      else if (p.type === 'hour') hour = parseInt(p.value, 10);
      else if (p.type === 'minute') minute = parseInt(p.value, 10);
      else if (p.type === 'second') second = parseInt(p.value, 10);
    }
    return { year, month, day, hour, minute, second };
  } catch (_e) {
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
    };
  }
}

export function formatStaticDateTime(timestamp) {
  if (!timestamp) return '—';
  try {
    const parts = getDhakaParts(timestamp);
    if (!parts) return '—';

    const day = toBengaliDigits(parts.day);
    const month = BENGALI_MONTHS[parts.month - 1] || '';
    const year = toBengaliDigits(parts.year);

    let hours = parts.hour;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const bnHours = toBengaliDigits(hours);
    const bnMinutes = toBengaliDigits(String(parts.minute).padStart(2, '0'));

    return `${day} ${month} ${year}, ${bnHours}:${bnMinutes} ${ampm}`;
  } catch (_e) {
    return '—';
  }
}

export const formatAuditDateTime = formatStaticDateTime;

export const HIDDEN_PUBLISH_DATE_SENTINEL = "1970-01-01 00:00:01";

export function isPublishDateHidden(val) {
  if (!val) return false;
  const str = String(val).trim();
  return (
    str.startsWith("1970-01-01") ||
    str === HIDDEN_PUBLISH_DATE_SENTINEL ||
    str === "hidden"
  );
}

export function formatArticlePublishDate(timestamp, includePrefix = true) {
  if (!timestamp || isPublishDateHidden(timestamp)) return '';
  try {
    const parts = getDhakaParts(timestamp);
    if (!parts) return '';

    const day = toBengaliDigits(parts.day);
    const month = BENGALI_MONTHS[parts.month - 1] || '';
    const year = toBengaliDigits(parts.year);

    const hours = toBengaliDigits(String(parts.hour).padStart(2, '0'));
    const minutes = toBengaliDigits(String(parts.minute).padStart(2, '0'));

    const formatted = `${day} ${month} ${year}, ${hours}:${minutes}`;
    return includePrefix ? `প্রকাশ: ${formatted}` : formatted;
  } catch (_e) {
    return '';
  }
}

export function formatDateForInput(timestamp) {
  if (!timestamp) return '';
  try {
    const parts = getDhakaParts(timestamp);
    if (!parts) return '';

    const year = parts.year;
    const month = String(parts.month).padStart(2, '0');
    const day = String(parts.day).padStart(2, '0');
    const hours = String(parts.hour).padStart(2, '0');
    const minutes = String(parts.minute).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (_e) {
    return '';
  }
}

export function parseDhakaDateInput(val) {
  if (!val) return null;
  let str = String(val).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
    str += ':00+06:00';
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
    str += '+06:00';
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 19).replace('T', ' ');
}
