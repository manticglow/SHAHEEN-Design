/* أيقونات شاهين: مصدر واحد لصفحة الحساب والتجارب (نفس رسمة أيقونات الأنظمة: خط ١.٧ وأطراف دائرية) */
(function () {
  'use strict';
  var IC = {
    cup: '<path d="M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 9h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3v2M11 3v2"/>',
    latte: '<path d="M6 7h12l-1.4 11.2A2 2 0 0 1 14.6 20H9.4a2 2 0 0 1-2-1.8z"/><path d="M5 7h14"/><path d="M9.5 12.5c1-1.2 4-1.2 5 0-1 1.5-4 1.5-5 0z"/>',
    drip: '<path d="M6 5h12l-4 7h-4z"/><path d="M12 12v3"/><path d="M8 17h8l-1 3H9z"/>',
    dallah: '<path d="M9 5h4l1 4-3 1-3-1z"/><path d="M8 9c-2 3-2 7 0 10h6c2-3 2-7 0-10"/><path d="M14 11l4-3"/>',
    iced: '<path d="M7 6h10l-1.5 14h-7z"/><path d="M12 6V2.5l3-1"/><rect x="9" y="10" width="3" height="3" rx=".5"/><rect x="12" y="13" width="3" height="3" rx=".5"/>',
    matcha: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M8 11c1-2 3-3 4-6 1 3 3 4 4 6"/>',
    tea: '<path d="M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2"/><path d="M9 7c0-1 1-1 1-2M12 7c0-1 1-1 1-2"/>',
    cake: '<path d="M4 20h16v-7H4z"/><path d="M4 15c2 1 4 1 6 0s4-1 6 0 3 1 4 0"/><path d="M12 13V9"/><path d="M12 6.5a1 1 0 0 1 0-2 1 1 0 0 1 0 2z"/>',
    cookie: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r=".8"/><circle cx="14" cy="9" r=".8"/><circle cx="13" cy="14" r=".8"/><circle cx="9.5" cy="15" r=".8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S9 9 12 9zM12 9c2-4 6-4 6-1.5S15 9 12 9z"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.5 8.5a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5L17 4"/>', home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1"/><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1"/>', arrow: '<path d="M15 6l-6 6 6 6"/>',
    qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>', steth: '<path d="M6 4v5a4 4 0 0 0 8 0V4"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    scissors: '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 17M8 15.5L20 7"/>', spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    drop: '<path d="M12 3.5c3 4 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.5 6-10.5z"/>', bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>', brush: '<path d="M15 4l5 5-8 8-5-5z"/><path d="M7 12c-3 0-4 3-4 7 4 0 7-1 7-4"/>', door: '<path d="M6 21V4h10v17"/><path d="M4 21h16"/><circle cx="13" cy="12.5" r=".8"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>', insta: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".6"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', in: '<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 4h5v16h-5"/>', out: '<path d="M14 17l5-5-5-5"/><path d="M19 12H7"/><path d="M10 4H5v16h5"/>',
    receipt: '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.2"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M4 4l16 16"/><path d="M9.9 5.7A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.6M6.5 7.5C4 9.3 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.3-1"/><path d="M10 10a3 3 0 0 0 4 4"/>',
    back: '<path d="M9 6h11v12H9l-6-6z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19h14"/>',
    print: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
    refresh: '<path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19 4v4h-4"/>',
    crown: '<path d="M4 17l-1-9 5 4 4-7 4 7 5-4-1 9z"/><path d="M4 20h16"/>',
    out: '<path d="M14 7V5a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 4 5v14a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 14 19v-2"/><path d="M10 12h10M17 9l3 3-3 3"/>',
    devices: '<rect x="3" y="5" width="13" height="10" rx="1.5"/><path d="M1.5 18h16"/><rect x="17" y="8" width="5.5" height="11" rx="1.2"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.2"/><path d="M11 18h2"/>',
    share: '<path d="M12 15V4M8 7.5L12 4l4 3.5"/><path d="M6 11v8.5h12V11"/>'
  };
  window.KI = { IC: IC, ic: function (n, size, sw) { var z = size || 22; return '<svg width="' + z + '" height="' + z + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || (z <= 18 ? 2 : 1.7)) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || IC.spark) + '</svg>'; } };
})();
