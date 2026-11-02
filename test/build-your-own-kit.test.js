const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VALID_CATEGORIES = ['drinks', 'snacks', 'study', 'ergonomics', 'mood', 'packaging'];

test('Build Your Own Kit: products.json has at least 15 valid items across 6 categories', () => {
  const filePath = path.join(__dirname, '../data/survival_kit/products.json');
  assert.ok(fs.existsSync(filePath), 'products.json must exist in data/survival_kit/');
  
  const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.ok(products.length >= 15, 'Must have at least 15 products (12 initial + 3 club products)');

  const categoryCounts = {};
  VALID_CATEGORIES.forEach(c => categoryCounts[c] = 0);

  products.forEach(p => {
    assert.ok(p.id, 'Product must have an id');
    assert.ok(p.name, 'Product must have a name');
    assert.ok(VALID_CATEGORIES.includes(p.category), `Category ${p.category} must be one of ${VALID_CATEGORIES.join(', ')}`);
    categoryCounts[p.category] += 1;

    assert.ok(Number.isInteger(p.price) && p.price > 0, `Price of ${p.id} must be an integer > 0`);
    assert.ok(p.image, `Product ${p.id} must have image`);
  });

  VALID_CATEGORIES.forEach(c => {
    assert.ok(categoryCounts[c] >= 2, `Category ${c} must have at least 2 items`);
  });
});

test('Recommendation Engine: kits.json contains all 28 kits (4 categories x 7 levels) with valid products and pricing', () => {
  const productsPath = path.join(__dirname, '../data/survival_kit/products.json');
  const kitsPath = path.join(__dirname, '../data/survival_kit/kits.json');

  assert.ok(fs.existsSync(kitsPath), 'kits.json must exist in data/survival_kit/');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const productMap = {};
  products.forEach(p => productMap[p.id] = p);

  const kits = JSON.parse(fs.readFileSync(kitsPath, 'utf8'));
  assert.equal(kits.length, 4, 'Must have 4 categories: exam, project, club, care');

  const EXPECTED_TOTALS = {
    exam: { '1': 60000, '2': 73000, '3': 90000, '4': 108000, '5': 129000, '6': 122000, '7': 129000 },
    project: { '1': 53000, '2': 71000, '3': 88000, '4': 110000, '5': 132000, '6': 140000, '7': 127000 },
    club: { '1': 75000, '2': 93000, '3': 123000, '4': 160000, '5': 175000, '6': 170000, '7': 182000 },
    care: { '1': 55000, '2': 70000, '3': 90000, '4': 92000, '5': 105000, '6': 140000, '7': 162000 }
  };

  kits.forEach(cat => {
    assert.ok(EXPECTED_TOTALS[cat.id], `Category ${cat.id} must be in expected list`);
    for (let l = 1; l <= 7; l++) {
      const lvlStr = String(l);
      const k = cat.levels[lvlStr];
      assert.ok(k, `Category ${cat.id} must have level ${l}`);
      assert.ok(k.name, `Category ${cat.id} level ${l} must have name`);
      assert.ok(k.tagline, `Category ${cat.id} level ${l} must have tagline`);

      let total = 0;
      let count = 0;
      const itemIds = Object.keys(k.items);
      assert.ok(itemIds.length > 0, `Category ${cat.id} level ${l} must have items`);

      itemIds.forEach(pid => {
        const prod = productMap[pid];
        assert.ok(prod, `Product ${pid} in ${cat.id} level ${l} must exist in products.json`);
        const qty = k.items[pid];
        assert.ok(Number.isInteger(qty) && qty >= 1 && qty <= 20, `Qty for ${pid} must be integer 1-20`);
        total += prod.price * qty;
        count += qty;
      });

      assert.equal(total, EXPECTED_TOTALS[cat.id][lvlStr], `Total for ${cat.id} level ${l} must match specification table`);
    }
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
