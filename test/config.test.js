const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Hugo configuration has valid metadata and timezone', () => {
  const hugoToml = fs.readFileSync(path.join(__dirname, '../config/_default/hugo.toml'), 'utf8');
  assert.match(hugoToml, /timeZone\s*=\s*"Asia\/Ho_Chi_Minh"/);
  assert.match(hugoToml, /title\s*=\s*"Survival Kit \| The Deadline Rescue Station"/);
  assert.match(hugoToml, /theme\s*=\s*"hargo-hugo"/);
});

test('Params configuration has valid contacts, currency, and feature flags', () => {
  const paramsToml = fs.readFileSync(path.join(__dirname, '../config/_default/params.toml'), 'utf8');
  assert.match(paramsToml, /currencySymbol\s*=\s*"₫"/);
  assert.match(paramsToml, /enable_schedule_rescue\s*=\s*true/);
  assert.match(paramsToml, /enable_send_rescue\s*=\s*true/);
  assert.match(paramsToml, /enable_panic_level\s*=\s*true/);
  assert.match(paramsToml, /contact@survivalkit\.vn/);
});

test('Menus configuration contains required navigation items', () => {
  const menusToml = fs.readFileSync(path.join(__dirname, '../config/_default/menus.en.toml'), 'utf8');
  assert.match(menusToml, /name\s*=\s*"Survival Kits"/);
  assert.match(menusToml, /name\s*=\s*"Schedule Rescue"/);
  assert.match(menusToml, /name\s*=\s*"Send a Rescue"/);
  assert.match(menusToml, /name\s*=\s*"Blog"/);
  assert.match(menusToml, /name\s*=\s*"FAQ"/);
});

test('Social media data file exists and contains valid links', () => {
  const socialData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/social.json'), 'utf8'));
  assert.ok(Array.isArray(socialData));
  assert.ok(socialData.length >= 3);
  assert.equal(socialData[0].name, 'Facebook');
});

test('Panic Level logic maps severity correctly (1 to 7)', () => {
  function getPanicMode(level) {
    if (level === 1) return { mode: 'Chill Mode', badge: 'badge-success' };
    if (level >= 2 && level <= 3) return { mode: 'Mild / Nervous Mode', badge: 'badge-info' };
    if (level >= 4 && level <= 5) return { mode: 'Panic Mode', badge: 'badge-warning' };
    if (level >= 6 && level <= 7) return { mode: 'Final Boss / SOS', badge: 'badge-danger' };
    throw new Error('Invalid panic level');
  }

  assert.equal(getPanicMode(1).mode, 'Chill Mode');
  assert.equal(getPanicMode(2).mode, 'Mild / Nervous Mode');
  assert.equal(getPanicMode(3).mode, 'Mild / Nervous Mode');
  assert.equal(getPanicMode(4).mode, 'Panic Mode');
  assert.equal(getPanicMode(5).mode, 'Panic Mode');
  assert.equal(getPanicMode(6).mode, 'Final Boss / SOS');
  assert.equal(getPanicMode(7).mode, 'Final Boss / SOS');
});

test('Schedule delivery validation ensures delivery is before deadline', () => {
  function validateSchedule(deadlineDateStr, deliveryDateStr) {
    const deadline = new Date(deadlineDateStr);
    const delivery = new Date(deliveryDateStr);
    const diffMs = deadline.getTime() - delivery.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return {
      isValid: diffDays >= 1,
      diffDays
    };
  }

  // Delivery 2 days before deadline is valid
  assert.equal(validateSchedule('2026-11-20', '2026-11-18').isValid, true);
  // Delivery on deadline day or after is invalid
  assert.equal(validateSchedule('2026-11-20', '2026-11-20').isValid, false);
  assert.equal(validateSchedule('2026-11-20', '2026-11-21').isValid, false);
});
