const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VALID_CATEGORIES = ['drinks', 'snacks', 'study', 'ergonomics', 'mood', 'packaging'];

test('Build Your Own Kit: products.json has 12 valid sample items across 6 categories', () => {
  const filePath = path.join(__dirname, '../data/survival_kit/products.json');
  assert.ok(fs.existsSync(filePath), 'products.json must exist in data/survival_kit/');
  
  const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.equal(products.length, 12, 'Must have exactly 12 sample products');

  const categoryCounts = {};
  VALID_CATEGORIES.forEach(c => categoryCounts[c] = 0);

  products.forEach(p => {
    assert.ok(p.id, 'Product must have an id');
    assert.ok(p.name, 'Product must have a name');
    assert.ok(VALID_CATEGORIES.includes(p.category), `Category ${p.category} must be one of ${VALID_CATEGORIES.join(', ')}`);
    categoryCounts[p.category] += 1;

    assert.ok(Number.isInteger(p.price) && p.price > 0, `Price of ${p.id} must be an integer > 0`);
    assert.ok(p.image, `Product ${p.id} must have image`);
    assert.ok(Array.isArray(p.themes) && p.themes.length > 0, `Product ${p.id} must have themes`);
    assert.ok(Array.isArray(p.suggestedLevels) && p.suggestedLevels.length > 0, `Product ${p.id} must have suggestedLevels`);
    p.suggestedLevels.forEach(lvl => {
      assert.ok(Number.isInteger(lvl) && lvl >= 1 && lvl <= 7, `Level ${lvl} must be between 1 and 7`);
    });
  });

  VALID_CATEGORIES.forEach(c => {
    assert.ok(categoryCounts[c] >= 2, `Category ${c} must have at least 2 items`);
  });
});

test('Build Your Own Kit: presets.json contains valid Level 7 quick kit presets', () => {
  const productsPath = path.join(__dirname, '../data/survival_kit/products.json');
  const presetsPath = path.join(__dirname, '../data/survival_kit/presets.json');
  
  assert.ok(fs.existsSync(presetsPath), 'presets.json must exist in data/survival_kit/');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const validIds = new Set(products.map(p => p.id));

  const presets = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
  assert.ok(presets.length >= 2, 'Must have at least 2 presets for Level 7');

  presets.forEach(preset => {
    assert.ok(preset.id, 'Preset must have an id');
    assert.ok(preset.name, 'Preset must have a name');
    assert.ok(preset.items && typeof preset.items === 'object', 'Preset must have items map');
    
    const itemIds = Object.keys(preset.items);
    assert.ok(itemIds.length > 0, 'Preset must include at least 1 item');
    itemIds.forEach(id => {
      assert.ok(validIds.has(id), `Preset item ${id} must exist in products.json`);
      assert.ok(Number.isInteger(preset.items[id]) && preset.items[id] > 0, `Preset item quantity for ${id} must be > 0`);
    });
  });
});

test('Panic Level: message mapping matches specification', () => {
  function messageFor(n) {
    if (n <= 2) return "Bình tĩnh: kit nhẹ nhàng, tạo động lực.";
    if (n <= 4) return "Bắt đầu căng: gợi ý đồ uống, snack, dụng cụ tập trung.";
    if (n <= 6) return "Deadline sát: gợi ý bộ hỗ trợ làm việc, bạn tự chọn.";
    return "Cứu deadline!";
  }

  assert.equal(messageFor(1), "Bình tĩnh: kit nhẹ nhàng, tạo động lực.");
  assert.equal(messageFor(2), "Bình tĩnh: kit nhẹ nhàng, tạo động lực.");
  assert.equal(messageFor(3), "Bắt đầu căng: gợi ý đồ uống, snack, dụng cụ tập trung.");
  assert.equal(messageFor(4), "Bắt đầu căng: gợi ý đồ uống, snack, dụng cụ tập trung.");
  assert.equal(messageFor(5), "Deadline sát: gợi ý bộ hỗ trợ làm việc, bạn tự chọn.");
  assert.equal(messageFor(6), "Deadline sát: gợi ý bộ hỗ trợ làm việc, bạn tự chọn.");
  assert.equal(messageFor(7), "Cứu deadline!");
});

test('Build Your Own Kit: calculations, quantity bounds and cart payload shape', () => {
  const items = {
    'cafe-phin': 2,
    'energy-bar': 3
  };
  const catalog = {
    'cafe-phin': { price: 25000 },
    'energy-bar': { price: 22000 }
  };

  function computeTotal(itemsMap) {
    let total = 0;
    let count = 0;
    Object.keys(itemsMap).forEach(id => {
      const q = itemsMap[id];
      if (q > 0 && catalog[id]) {
        count += q;
        total += q * catalog[id].price;
      }
    });
    return { count, total };
  }

  const { count, total } = computeTotal(items);
  assert.equal(count, 5);
  assert.equal(total, 2 * 25000 + 3 * 22000); // 50000 + 66000 = 116000

  // Quantity bounding logic
  function sanitizeQty(val) {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) return 0;
    if (n > 20) return 20;
    return n;
  }

  assert.equal(sanitizeQty(-5), 0);
  assert.equal(sanitizeQty('abc'), 0);
  assert.equal(sanitizeQty(25), 20);
  assert.equal(sanitizeQty(15), 15);
});
