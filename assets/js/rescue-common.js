/**
 * Survival Kit — Shared Rescue Utilities (Schedule & Send Rescue)
 * Pure functions for date validation, phone formatting, character counting,
 * order code generation, .ics building, draft storage, and query sanitization.
 */
(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.RescueCommon = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function todayVN() {
    try {
      var parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date());
      var y, m, d;
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === 'year') y = parts[i].value;
        if (parts[i].type === 'month') m = parts[i].value;
        if (parts[i].type === 'day') d = parts[i].value;
      }
      return y + '-' + m + '-' + d;
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function parseISODate(dateStr) {
    if (typeof dateStr !== 'string') return null;
    var match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    var year = parseInt(match[1], 10);
    var month = parseInt(match[2], 10);
    var day = parseInt(match[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    var utcMs = Date.UTC(year, month - 1, day);
    var checkDate = new Date(utcMs);
    if (checkDate.getUTCFullYear() !== year ||
        checkDate.getUTCMonth() !== month - 1 ||
        checkDate.getUTCDate() !== day) {
      return null;
    }
    return { year: year, month: month, day: day, utcMs: utcMs };
  }

  function diffDays(dateStrA, dateStrB) {
    var pA = parseISODate(dateStrA);
    var pB = parseISODate(dateStrB);
    if (!pA || !pB) return NaN;
    return Math.round((pA.utcMs - pB.utcMs) / 86400000);
  }

  function addDays(dateStr, n) {
    var p = parseISODate(dateStr);
    if (!p) return null;
    var target = new Date(p.utcMs + n * 86400000);
    var y = target.getUTCFullYear();
    var m = String(target.getUTCMonth() + 1).padStart(2, '0');
    var d = String(target.getUTCDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function validateSchedule(deadline, receive, rules, today) {
    today = today || todayVN();
    rules = rules || {};
    var minLead = Number.isInteger(rules.minLeadDays) ? rules.minLeadDays : 1;
    var maxLead = Number.isInteger(rules.maxLeadDays) ? rules.maxLeadDays : 2;
    var prepDays = Number.isInteger(rules.prepDays) ? rules.prepDays : 1;
    var blackouts = Array.isArray(rules.blackoutDates) ? rules.blackoutDates : [];

    if (!deadline || !parseISODate(deadline)) {
      return { isValid: false, error: 'Vui lòng chọn ngày deadline hợp lệ.', leadDays: NaN };
    }
    if (!receive || !parseISODate(receive)) {
      return { isValid: false, error: 'Vui lòng chọn ngày nhận hợp lệ.', leadDays: NaN };
    }

    var deadlineVsToday = diffDays(deadline, today);
    if (deadlineVsToday < prepDays + minLead) {
      return {
        isValid: false,
        error: 'Deadline cần sau hôm nay ít nhất ' + (prepDays + minLead) + ' ngày để kịp chuẩn bị.',
        leadDays: diffDays(deadline, receive)
      };
    }

    var receiveVsToday = diffDays(receive, today);
    if (receiveVsToday < prepDays) {
      return {
        isValid: false,
        error: 'Ngày nhận phải sau hôm nay ít nhất ' + prepDays + ' ngày để kịp chuẩn bị.',
        leadDays: diffDays(deadline, receive)
      };
    }

    if (blackouts.includes(receive)) {
      return {
        isValid: false,
        error: 'Ngày này cửa hàng chưa giao được, bạn chọn ngày khác nhé.',
        leadDays: diffDays(deadline, receive)
      };
    }

    var leadDays = diffDays(deadline, receive);
    if (leadDays < minLead || leadDays > maxLead) {
      return {
        isValid: false,
        error: 'Chọn ngày nhận trước deadline 1 hoặc 2 ngày.',
        leadDays: leadDays
      };
    }

    return { isValid: true, error: null, leadDays: leadDays };
  }

  function validateGiftDate(receive, recipientDeadline, rules, today) {
    today = today || todayVN();
    rules = rules || {};
    var prepDays = Number.isInteger(rules.prepDays) ? rules.prepDays : 1;
    var blackouts = Array.isArray(rules.blackoutDates) ? rules.blackoutDates : [];

    if (!receive || !parseISODate(receive)) {
      return { isValid: false, error: 'Vui lòng chọn ngày giao hợp lệ.' };
    }

    var receiveVsToday = diffDays(receive, today);
    if (receiveVsToday < prepDays) {
      return {
        isValid: false,
        error: 'Ngày giao phải sau hôm nay ít nhất ' + prepDays + ' ngày để kịp chuẩn bị.'
      };
    }

    if (blackouts.includes(receive)) {
      return {
        isValid: false,
        error: 'Ngày này shop chưa giao được, chọn ngày khác nhé.'
      };
    }

    if (recipientDeadline && parseISODate(recipientDeadline)) {
      var minLead = Number.isInteger(rules.minLeadDays) ? rules.minLeadDays : 1;
      var maxLead = Number.isInteger(rules.maxLeadDays) ? rules.maxLeadDays : 2;
      var leadDays = diffDays(recipientDeadline, receive);
      if (leadDays < minLead || leadDays > maxLead) {
        return {
          isValid: false,
          error: 'Nếu có deadline, ngày nhận cần trước deadline 1 hoặc 2 ngày.'
        };
      }
    }

    return { isValid: true, error: null };
  }

  function isValidPhone(phone) {
    if (typeof phone !== 'string') return false;
    var cleaned = phone.replace(/[\s.\-()]/g, '');
    return /^(0|\+84)\d{9}$/.test(cleaned);
  }

  function countChars(str) {
    if (!str) return 0;
    return Array.from(String(str).normalize('NFC')).length;
  }

  function makeOrderCode(prefix, dateStr) {
    prefix = prefix || 'SK';
    dateStr = dateStr || todayVN();
    var dateDigits = dateStr.replace(/-/g, '');
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var randomPart = '';
    for (var i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + '-' + dateDigits + '-' + randomPart;
  }

  function escapeICS(str) {
    return (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  function formatDateICS(dateStr) {
    return dateStr.replace(/-/g, '');
  }

  function buildICS(options) {
    options = options || {};
    var title = options.title || 'Deadline';
    var receive = options.receiveDate;
    var deadline = options.deadlineDate;
    var code = options.orderCode || makeOrderCode();
    var now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';

    var receiveNext = addDays(receive, 1);
    var deadlineNext = addDays(deadline, 1);

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Survival Kit//Rescue Station//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    if (receive) {
      lines.push(
        'BEGIN:VEVENT',
        'UID:' + code + '-receive@survivalkit.vn',
        'DTSTAMP:' + now,
        'DTSTART;VALUE=DATE:' + formatDateICS(receive),
        'DTEND;VALUE=DATE:' + formatDateICS(receiveNext),
        'SUMMARY:' + escapeICS('Nhận Survival Kit tiếp sức deadline'),
        'DESCRIPTION:' + escapeICS('Bộ kit cứu trợ deadline Survival Kit được giao vào hôm nay. Mã đơn: ' + code),
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    if (deadline) {
      lines.push(
        'BEGIN:VEVENT',
        'UID:' + code + '-deadline@survivalkit.vn',
        'DTSTAMP:' + now,
        'DTSTART;VALUE=DATE:' + formatDateICS(deadline),
        'DTEND;VALUE=DATE:' + formatDateICS(deadlineNext),
        'SUMMARY:' + escapeICS('Deadline: ' + title),
        'DESCRIPTION:' + escapeICS('Hạn chót deadline: ' + title + '. Chúc bạn hoàn thành xuất sắc!'),
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }

  function loadDraft(key) {
    try {
      if (typeof sessionStorage === 'undefined') return null;
      var raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveDraft(key, data) {
    try {
      if (typeof sessionStorage === 'undefined') return;
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  function clearDraft(key) {
    try {
      if (typeof sessionStorage === 'undefined') return;
      sessionStorage.removeItem(key);
    } catch (e) {}
  }

  function mergeIntoCart(extra) {
    var cart = loadDraft('survivalKitCart') || {};
    var merged = Object.assign({}, cart, extra);
    saveDraft('survivalKitCart', merged);
    return merged;
  }

  function sanitizeQuery(params, allowedCategories, minLevel, maxLevel) {
    params = params || {};
    allowedCategories = allowedCategories || ['exam', 'project', 'club', 'care'];
    minLevel = Number.isInteger(minLevel) ? minLevel : 1;
    maxLevel = Number.isInteger(maxLevel) ? maxLevel : 7;

    var result = {};
    if (params.deadline && parseISODate(params.deadline)) result.deadline = params.deadline;
    if (params.receive && parseISODate(params.receive)) result.receive = params.receive;
    if (params.category && allowedCategories.includes(params.category)) result.category = params.category;
    if (params.level) {
      var lvl = parseInt(params.level, 10);
      if (!isNaN(lvl) && lvl >= minLevel && lvl <= maxLevel) result.level = lvl;
    }
    if (params.type && ['bestie', 'love', 'crush', 'team'].includes(params.type)) result.type = params.type;
    if (params.recipient) result.recipient = String(params.recipient).slice(0, 60);
    if (params.message) result.message = String(params.message).slice(0, 200);

    return result;
  }

  return {
    todayVN: todayVN,
    parseISODate: parseISODate,
    diffDays: diffDays,
    addDays: addDays,
    validateSchedule: validateSchedule,
    validateGiftDate: validateGiftDate,
    isValidPhone: isValidPhone,
    countChars: countChars,
    makeOrderCode: makeOrderCode,
    buildICS: buildICS,
    loadDraft: loadDraft,
    saveDraft: saveDraft,
    clearDraft: clearDraft,
    mergeIntoCart: mergeIntoCart,
    sanitizeQuery: sanitizeQuery
  };
});
