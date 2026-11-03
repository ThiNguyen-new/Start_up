const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const RescueCommon = require('../assets/js/rescue-common.js');

const scheduleRules = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/survival_kit/schedule-rules.json'), 'utf8')
);
const giftTypes = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/survival_kit/gift-types.json'), 'utf8')
);
const kits = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/survival_kit/kits.json'), 'utf8')
);

test('M2: schedule-rules.json and gift-types.json structure and references', () => {
  // schedule-rules.json checks
  assert.equal(typeof scheduleRules.minLeadDays, 'number');
  assert.equal(typeof scheduleRules.maxLeadDays, 'number');
  assert.equal(typeof scheduleRules.prepDays, 'number');
  assert.ok(scheduleRules.minLeadDays >= 1);
  assert.ok(scheduleRules.maxLeadDays >= scheduleRules.minLeadDays);
  assert.ok(Array.isArray(scheduleRules.slots) && scheduleRules.slots.length >= 2);
  assert.ok(Array.isArray(scheduleRules.blackoutDates));

  // gift-types.json checks
  assert.ok(Array.isArray(giftTypes));
  assert.equal(giftTypes.length, 4);

  const validCategoryIds = kits.map(k => k.id);
  const typeIds = giftTypes.map(g => g.id);
  assert.deepEqual(typeIds.sort(), ['bestie', 'crush', 'love', 'team'].sort());

  giftTypes.forEach(g => {
    assert.ok(validCategoryIds.includes(g.defaultCategory), `Unknown category: ${g.defaultCategory}`);
    assert.ok(Array.isArray(g.samples) && g.samples.length >= 1);
    assert.ok(Array.isArray(g.cards) && g.cards.length >= 1);
    if (g.id === 'crush') {
      assert.equal(g.allowAnonymous, true);
    } else {
      assert.equal(g.allowAnonymous, false);
    }
  });
});

test('M2: Date helpers and difference calculation', () => {
  assert.equal(RescueCommon.diffDays('2026-11-20', '2026-11-18'), 2);
  assert.equal(RescueCommon.diffDays('2026-11-20', '2026-11-19'), 1);
  assert.equal(RescueCommon.diffDays('2026-11-20', '2026-11-20'), 0);
  assert.equal(RescueCommon.diffDays('2026-11-20', '2026-11-17'), 3);

  assert.equal(RescueCommon.addDays('2026-11-18', 2), '2026-11-20');
  assert.equal(RescueCommon.addDays('2026-11-30', 1), '2026-12-01');
  assert.ok(RescueCommon.parseISODate('2026-11-20') !== null);
  assert.equal(RescueCommon.parseISODate('invalid-date'), null);
});

test('M2: validateSchedule rules (lead days, prep days, blackout, past dates)', () => {
  const today = '2026-11-10';
  const rules = {
    minLeadDays: 1,
    maxLeadDays: 2,
    prepDays: 1,
    blackoutDates: ['2026-11-15']
  };

  // Valid: deadline 2026-11-14, receive 2026-11-12 (lead = 2 days, receive >= today + 1)
  const res1 = RescueCommon.validateSchedule('2026-11-14', '2026-11-12', rules, today);
  assert.equal(res1.isValid, true);
  assert.equal(res1.leadDays, 2);

  // Valid: receive 1 day before deadline
  const res2 = RescueCommon.validateSchedule('2026-11-14', '2026-11-13', rules, today);
  assert.equal(res2.isValid, true);
  assert.equal(res2.leadDays, 1);

  // Invalid: receive 0 days before deadline (same day)
  const res0 = RescueCommon.validateSchedule('2026-11-14', '2026-11-14', rules, today);
  assert.equal(res0.isValid, false);

  // Invalid: receive 3 days before deadline
  const res3 = RescueCommon.validateSchedule('2026-11-14', '2026-11-11', rules, today);
  assert.equal(res3.isValid, false);

  // Invalid: receive is blackout date
  const resBlackout = RescueCommon.validateSchedule('2026-11-17', '2026-11-15', rules, today);
  assert.equal(resBlackout.isValid, false);

  // Invalid: receive earlier than today + prepDays (e.g. today or past)
  const resPast = RescueCommon.validateSchedule('2026-11-11', '2026-11-10', rules, today);
  assert.equal(resPast.isValid, false);
});

test('M2: validateGiftDate handles lead times and blackouts', () => {
  const today = '2026-11-10';
  const rules = {
    minLeadDays: 1,
    maxLeadDays: 2,
    prepDays: 1,
    blackoutDates: ['2026-11-12']
  };

  assert.equal(RescueCommon.validateGiftDate('2026-11-13', null, rules, today).isValid, true);
  assert.equal(RescueCommon.validateGiftDate('2026-11-10', null, rules, today).isValid, false);
  assert.equal(RescueCommon.validateGiftDate('2026-11-12', null, rules, today).isValid, false);
  // With recipient deadline
  assert.equal(RescueCommon.validateGiftDate('2026-11-13', '2026-11-15', rules, today).isValid, true);
  assert.equal(RescueCommon.validateGiftDate('2026-11-11', '2026-11-15', rules, today).isValid, false);
});

test('M2: Phone validation (Vietnamese mobile formats)', () => {
  assert.equal(RescueCommon.isValidPhone('0901234567'), true);
  assert.equal(RescueCommon.isValidPhone('+84901234567'), true);
  assert.equal(RescueCommon.isValidPhone('090 123 4567'), true);
  assert.equal(RescueCommon.isValidPhone('090.123.4567'), true);
  assert.equal(RescueCommon.isValidPhone('090-123-4567'), true);

  assert.equal(RescueCommon.isValidPhone('123456'), false);
  assert.equal(RescueCommon.isValidPhone('080123456789'), false);
  assert.equal(RescueCommon.isValidPhone('abc0901234567'), false);
});

test('M2: Character counter counts accents and emojis accurately', () => {
  assert.equal(RescueCommon.countChars('Cố lên nhé!'), 11);
  assert.equal(RescueCommon.countChars('🚀'), 1);
  assert.equal(RescueCommon.countChars('Chúc bạn thi tốt! 🌟💪'), 20);
});

test('M2: Order code generation format SK-YYYYMMDD-XXXX', () => {
  const code = RescueCommon.makeOrderCode('SK', '2026-11-03');
  assert.match(code, /^SK-20261103-[A-Z2-9]{4}$/);
});

test('M2: ICS calendar builder generates valid format with CRLF and 2 events', () => {
  const ics = RescueCommon.buildICS({
    title: 'Đồ án CSDL',
    receiveDate: '2026-11-18',
    deadlineDate: '2026-11-20',
    orderCode: 'SK-20261103-9F2K'
  });

  assert.ok(ics.includes('\r\n'));
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261118'));
  assert.ok(ics.includes('DTEND;VALUE=DATE:20261119'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261120'));
  assert.ok(ics.includes('DTEND;VALUE=DATE:20261121'));
  assert.ok(ics.includes('END:VCALENDAR'));
});

test('M2: sanitizeQuery strips invalid categories and formats values', () => {
  const sanitized = RescueCommon.sanitizeQuery({
    deadline: '2026-11-20',
    receive: '2026-11-18',
    category: 'exam',
    level: '5',
    type: 'crush',
    recipient: 'Bạn Thân Rất Thân',
    message: 'Cố lên nha!'
  });

  assert.equal(sanitized.deadline, '2026-11-20');
  assert.equal(sanitized.receive, '2026-11-18');
  assert.equal(sanitized.category, 'exam');
  assert.equal(sanitized.level, 5);
  assert.equal(sanitized.type, 'crush');

  // Strip unknown
  const bad = RescueCommon.sanitizeQuery({
    category: 'hack-category',
    level: '99',
    type: 'unknown-type'
  });
  assert.equal(bad.category, undefined);
  assert.equal(bad.level, undefined);
  assert.equal(bad.type, undefined);
});
