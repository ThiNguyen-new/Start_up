/**
 * Kit Recommend: đọc dữ liệu kit (category x level) từ <script id="sk-kit-data">.
 * Dùng chung cho trang chủ và trang Build. API: window.KitRecommend.
 */
(function () {
  'use strict';
  var CATEGORY_KEY = 'survivalKitCategory';
  var DEFAULT_CATEGORY = 'exam';
  var data = { products: {}, categories: [] };
  var formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
  var assetBaseUrl = (function () {
    var scriptUrl = document.currentScript && document.currentScript.src;
    return scriptUrl ? new URL('../', scriptUrl) : new URL('.', window.location.href);
  })();

  // Resolve Hugo's root-relative image paths from this site's own script URL.
  // This keeps images working when the site is opened from a QR code under a
  // nested path or embedded in a page hosted on another domain (for example,
  // Google Sites).
  function resolveImageUrl(imagePath) {
    if (!imagePath) { return ''; }
    try {
      return new URL(String(imagePath).replace(/^\/+/, ''), assetBaseUrl).href;
    } catch (e) {
      return imagePath;
    }
  }

  function load() {
    var el = document.getElementById('sk-kit-data');
    if (!el) { return; }
    try { data = JSON.parse(el.textContent); } catch (e) { /* giữ data rỗng */ }
    /* Giữ nguyên đường dẫn ảnh gốc ("images/..."). Chỉ resolveImageUrl() đổi nó
       thành URL tuyệt đối, tính từ URL của chính file script này (luôn nằm ở
       <gốc site>/js/), nên đúng ở mọi thư mục con như /Start_up/.
       Không ghép thêm data-root-url ở đây: ghép 2 lần sẽ ra "../../images"
       và vỡ ảnh ở các trang con trên GitHub Pages. */
  }

  function categories() { return data.categories || []; }

  function findCategory(id) {
    var list = categories();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { return list[i]; }
    }
    return null;
  }

  function getCategory() {
    var id = null;
    try {
      var params = new URLSearchParams(window.location.search);
      id = params.get('category');
      if (id && findCategory(id)) {
        sessionStorage.setItem(CATEGORY_KEY, id);
        return id;
      }
      id = sessionStorage.getItem(CATEGORY_KEY);
    } catch (e) { /* bỏ qua */ }
    return (id && findCategory(id)) ? id : DEFAULT_CATEGORY;
  }

  function syncButtons() {
    var current = getCategory();
    document.querySelectorAll('.js-kit-cat-btn').forEach(function (btn) {
      var on = btn.getAttribute('data-category') === current;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setCategory(id) {
    if (!findCategory(id)) { return; }
    try { sessionStorage.setItem(CATEGORY_KEY, id); } catch (e) { /* bỏ qua */ }
    syncButtons();
    document.dispatchEvent(new CustomEvent('kitcategorychange', { detail: { category: id } }));
  }

  /* Trả về { category, level, kit, items[], total, count } hoặc null. */
  function recommend(categoryId, level) {
    var cat = findCategory(categoryId);
    if (!cat || !cat.levels) { return null; }
    var kit = cat.levels[String(level)];
    if (!kit || !kit.items) { return null; }
    var items = [];
    var total = 0;
    var count = 0;
    Object.keys(kit.items).forEach(function (pid) {
      var product = data.products[pid];
      var qty = Number(kit.items[pid]);
      if (!product || !(qty > 0)) { return; }
      var subtotal = product.price * qty;
      items.push({
        id: pid, name: product.name, price: product.price,
        image: resolveImageUrl(product.image), qty: qty, subtotal: subtotal
      });
      total += subtotal;
      count += qty;
    });
    return {
      category: cat, level: Number(level), kit: kit,
      items: items, total: total, count: count
    };
  }

  function formatVND(amount) {
    try { return formatter.format(amount); } catch (e) { return amount + ' ₫'; }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.js-kit-cat-btn') : null;
    if (btn) { setCategory(btn.getAttribute('data-category')); }
  });

  load();

  window.KitRecommend = {
    categories: categories,
    getCategory: getCategory,
    setCategory: setCategory,
    recommend: recommend,
    formatVND: formatVND
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncButtons);
  } else {
    syncButtons();
  }
})();
