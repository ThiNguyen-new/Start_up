/*
 * Demo Cart (thay Snipcart)
 * - Giỏ hàng VND lưu trong sessionStorage key "survivalKitCart" (cùng key với
 *   Build Your Own Kit / Schedule / Send Rescue — xem layouts/_partials/CONTRACT.md).
 * - Bắt mọi nút ".js-add-to-cart" và ".snipcart-add-item" (nút cũ của theme),
 *   đọc data-item-id / name / price / image.
 * - Không gửi dữ liệu đi đâu, không thanh toán thật.
 */
(function () {
  'use strict';

  var CART_KEY = 'survivalKitCart';

  function load() {
    try {
      var raw = sessionStorage.getItem(CART_KEY);
      var cart = raw ? JSON.parse(raw) : null;
      if (cart && typeof cart === 'object') {
        if (!Array.isArray(cart.items)) cart.items = [];
        return cart;
      }
    } catch (e) {}
    return { items: [] };
  }

  function recompute(cart) {
    var qty = 0;
    var total = 0;
    cart.items.forEach(function (it) {
      it.qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
      it.price = Number(it.price) || 0;
      it.subtotal = it.price * it.qty;
      qty += it.qty;
      total += it.subtotal;
    });
    cart.totalItems = qty;
    cart.total = total;
    return cart;
  }

  function save(cart) {
    recompute(cart);
    try {
      if (cart.items.length === 0 && !cart.schedule && !cart.gift) {
        sessionStorage.removeItem(CART_KEY);
      } else {
        sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
      }
    } catch (e) {}
    updateBadge();
    document.dispatchEvent(new CustomEvent('democartchange', { detail: { cart: cart } }));
    return cart;
  }

  function addItem(item) {
    var cart = load();
    var existing = null;
    cart.items.forEach(function (it) {
      if (it.id === item.id) existing = it;
    });
    if (existing) {
      existing.qty = (existing.qty || 0) + (item.qty || 1);
    } else {
      cart.items.push({
        id: item.id,
        name: item.name,
        category: item.category || 'Survival Kit',
        price: Number(item.price) || 0,
        image: item.image || '',
        qty: item.qty || 1,
        source: 'product'
      });
    }
    return save(cart);
  }

  function setQty(id, qty) {
    var cart = load();
    cart.items.forEach(function (it) {
      if (it.id === id) it.qty = qty;
    });
    return save(cart);
  }

  function removeItem(id) {
    var cart = load();
    cart.items = cart.items.filter(function (it) { return it.id !== id; });
    return save(cart);
  }

  function clear() {
    try { sessionStorage.removeItem(CART_KEY); } catch (e) {}
    updateBadge();
    document.dispatchEvent(new CustomEvent('democartchange', { detail: { cart: { items: [] } } }));
  }

  function formatVND(n) {
    return (Math.round(Number(n) || 0)).toLocaleString('vi-VN') + '₫';
  }

  function updateBadge() {
    var count = recompute(load()).totalItems || 0;
    document.querySelectorAll('.js-cart-count').forEach(function (el) {
      el.textContent = count > 99 ? '99+' : String(count);
      if (count > 0) el.removeAttribute('hidden'); else el.setAttribute('hidden', 'hidden');
    });
  }

  // Link giỏ hàng ở header đã được Hugo đổi sang đường dẫn tương đối đúng,
  // nên dùng nó làm mốc cho URL giỏ và gốc site (chạy được cả trên GitHub Pages).
  function cartUrl() {
    var a = document.querySelector('a.cart[href]');
    return a ? a.href : new URL('cart-demo/', document.baseURI).href;
  }

  function siteRoot() {
    return cartUrl().replace(/cart-demo\/?(index\.html)?$/, '');
  }

  function resolveAsset(path) {
    if (!path) return '';
    if (/^(https?:|data:)/.test(path)) return path;
    var root = new URL(siteRoot());
    if (path.charAt(0) === '/' && path.indexOf(root.pathname) === 0) return root.origin + path;
    return root.href + path.replace(/^\.?\//, '');
  }

  var toastTimer = null;
  function toast(message) {
    var el = document.querySelector('.sk-cart-toast');
    if (!el) return;
    var url = cartUrl();
    el.textContent = '';
    var text = document.createElement('span');
    text.textContent = message;
    var link = document.createElement('a');
    link.href = url;
    link.textContent = 'Xem giỏ hàng';
    el.appendChild(text);
    el.appendChild(link);
    el.removeAttribute('hidden');
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-visible');
      setTimeout(function () { el.setAttribute('hidden', 'hidden'); }, 250);
    }, 3200);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.js-add-to-cart, .snipcart-add-item') : null;
    if (!btn) return;
    e.preventDefault();
    var name = btn.getAttribute('data-item-name') || 'Survival Kit';
    // Ảnh: ưu tiên data-item-image đã xử lý (product-card), nếu là đường dẫn ảnh gốc
    // của theme (không tồn tại sau build) thì lấy ảnh đang hiển thị trên trang.
    var dataImg = btn.getAttribute('data-item-image') || '';
    var image = /\.webp(\?|$)/.test(dataImg) ? resolveAsset(dataImg) : '';
    if (!image) {
      var scope = btn.closest('article, .card, section') || document;
      var pageImg = scope.querySelector('img[src]');
      image = pageImg ? (pageImg.currentSrc || pageImg.src) : '';
    }
    addItem({
      id: btn.getAttribute('data-item-id') || name,
      name: name,
      price: btn.getAttribute('data-item-price'),
      image: image
    });
    toast('Đã thêm “' + name + '” vào giỏ.');
  });

  window.DemoCart = {
    load: load,
    save: save,
    add: addItem,
    setQty: setQty,
    remove: removeItem,
    clear: clear,
    formatVND: formatVND,
    updateBadge: updateBadge,
    siteRoot: siteRoot
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateBadge);
  } else {
    updateBadge();
  }
})();
