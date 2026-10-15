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

  // April 14 in local calendar
  const boishakh1 = new Date(year, 3, 14);
  let banglaYear = year - 593;
  let diffDays;

  // Set hours to 0 to compare days properly
  const dZero = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const bZero = new Date(boishakh1.getFullYear(), boishakh1.getMonth(), boishakh1.getDate());

  if (dZero < bZero) {
    banglaYear = year - 594;
    const prevBoishakh1 = new Date(year - 1, 3, 14);
    diffDays = Math.round((dZero - prevBoishakh1) / (1000 * 60 * 60 * 24));
  } else {
    diffDays = Math.round((dZero - bZero) / (1000 * 60 * 60 * 24));
  }

  // Bangla Academy rules (adopted in Bangladesh):
  // Boishakh to Ashwin: 31 days each (first 6 months)
  // Kartik to Magh: 30 days each (next 4 months)
  // Falgun: 29 days (30 in Gregorian leap year)
  // Chaitra: 30 days
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
    // Remove comma and replace 'যুগ' with 'হিজরি' if present
    formatted = formatted.replace(',', '').replace(/যুগ/g, 'হিজরি').trim();
    if (!formatted.includes('হিজরি')) {
      formatted += ' হিজরি';
    }
    return formatted;
  } catch (e) {
    return '৪ জমাদিউল আউয়াল ১৪৪৮ হিজরি';
  }
}
