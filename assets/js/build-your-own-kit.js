/**
 * Build Your Own Survival Kit - Client-side Interactive Builder
 * Integrated with Panic Level and Category Recommendation Engine.
 * Handles item selection, quantities, category recommendation,
 * custom message preview, and demo cart persistence via sessionStorage.
 */
(function () {
  'use strict';

  var CART_KEY = 'survivalKitCart';
  var MAX_QTY = 20;
  var MIN_QTY = 0;
  var MAX_MESSAGE_LEN = 120;

  var state = {
    items: {},       // { [productId]: qty }
    message: ''
  };

  var currentReco = null;

  // Product catalog cache from DOM
  var productsCatalog = {};

  var currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });

  function formatVND(amount) {
    try {
      return currencyFormatter.format(amount);
    } catch (e) {
      return (amount || 0).toLocaleString('vi-VN') + ' ₫';
    }
  }

  function currentLevel() {
    return window.PanicLevel ? window.PanicLevel.get() : 3;
  }

  // Collect products metadata from DOM data attributes
  function initCatalog() {
    var cards = document.querySelectorAll('.js-byok-card');
    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');
      if (!id) return;
      var price = parseInt(card.getAttribute('data-price'), 10) || 0;
      var name = card.getAttribute('data-name') || '';
      var category = card.getAttribute('data-category') || '';
      var selectedImage = card.querySelector('.js-product-image-choice[aria-pressed="true"]');
      var defaultImg = card.querySelector('.js-product-image');
      var defaultSrc = (defaultImg && (defaultImg.currentSrc || defaultImg.src || defaultImg.getAttribute('src'))) || card.getAttribute('data-image') || '';
      var imageSrc = defaultSrc;
      var variantLabel = '';
      if (selectedImage) {
        var choiceImg = selectedImage.querySelector('img');
        imageSrc = (choiceImg && (choiceImg.currentSrc || choiceImg.src)) || selectedImage.getAttribute('data-image-src') || defaultSrc;
        variantLabel = selectedImage.getAttribute('data-variant-label') || '';
      }

      productsCatalog[id] = {
        id: id,
        name: name,
        price: price,
        category: category,
        image: imageSrc,
        variant: variantLabel
      };
    });
  }

  // Restore state from sessionStorage if existing
  function restoreSavedCart() {
    try {
      var saved = sessionStorage.getItem(CART_KEY);
      if (!saved) return;
      var parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items)) {
        parsed.items.forEach(function (it) {
          if (it.id && Number.isInteger(it.qty) && it.qty > 0) {
            state.items[it.id] = Math.min(MAX_QTY, Math.max(0, it.qty));
          }
        });
      }
      if (typeof parsed.message === 'string') {
        state.message = parsed.message.slice(0, MAX_MESSAGE_LEN);
      }
    } catch (e) {
      // Ignore parse errors on demo storage
    }
  }

  // Calculate totals
  function getTotals() {
    var totalItems = 0;
    var totalPrice = 0;
    var selectedTypesCount = 0;

    Object.keys(state.items).forEach(function (id) {
      var qty = state.items[id] || 0;
      if (qty > 0 && productsCatalog[id]) {
        selectedTypesCount += 1;
        totalItems += qty;
        totalPrice += qty * productsCatalog[id].price;
      }
    });

    return {
      typesCount: selectedTypesCount,
      totalItems: totalItems,
      totalPrice: totalPrice
    };
  }

  function clearQuantities() {
    state.items = {};
    document.querySelectorAll('.js-byok-card').forEach(function (card) {
      var input = card.querySelector('.js-qty-input');
      var minusBtn = card.querySelector('.js-qty-minus');
      var plusBtn = card.querySelector('.js-qty-plus');
      if (input) { input.value = 0; }
      if (minusBtn) { minusBtn.disabled = true; }
      if (plusBtn) { plusBtn.disabled = false; }
    });
  }

  // Update item quantity safely
  function updateItemQty(id, qty) {
    if (!productsCatalog[id]) return;
    var sanitized = parseInt(qty, 10);
    if (isNaN(sanitized) || sanitized < MIN_QTY) {
      sanitized = 0;
    } else if (sanitized > MAX_QTY) {
      sanitized = MAX_QTY;
    }

    if (sanitized === 0) {
      delete state.items[id];
    } else {
      state.items[id] = sanitized;
    }

    // Sync input field in card
    var card = document.querySelector('.js-byok-card[data-id="' + id + '"]');
    if (card) {
      var input = card.querySelector('.js-qty-input');
      var minusBtn = card.querySelector('.js-qty-minus');
      var plusBtn = card.querySelector('.js-qty-plus');
      if (input) input.value = sanitized;
      if (minusBtn) minusBtn.disabled = (sanitized <= 0);
      if (plusBtn) plusBtn.disabled = (sanitized >= MAX_QTY);
    }

    renderSummary();
    renderPreview();
  }

  // Render recommendation card for current level and category
  function renderReco() {
    var card = document.querySelector('.js-reco-card');
    if (!card || !window.KitRecommend) { return; }
    var rec = window.KitRecommend.recommend(window.KitRecommend.getCategory(), currentLevel());
    currentReco = rec;
    if (!rec) { card.setAttribute('hidden', 'hidden'); return; }
    card.removeAttribute('hidden');

    var headingEl = card.querySelector('.js-reco-heading');
    if (headingEl) {
      headingEl.textContent = 'Kit gợi ý cho Level ' + rec.level + ' · ' + rec.category.name;
    }
    var nameEl = card.querySelector('.js-reco-name');
    if (nameEl) {
      nameEl.textContent = rec.kit.name;
    }
    var tagEl = card.querySelector('.js-reco-tagline');
    if (tagEl) {
      tagEl.textContent = rec.kit.tagline;
    }
    var totalEl = card.querySelector('.js-reco-total');
    if (totalEl) {
      totalEl.textContent = window.KitRecommend.formatVND(rec.total) + ' · ' + rec.count + ' món';
    }

    var list = card.querySelector('.js-reco-items');
    if (list) {
      list.textContent = '';
      rec.items.forEach(function (it) {
        var li = document.createElement('li');
        li.className = 'sk-kit-chip';
        var img = document.createElement('img');
        img.src = it.image;
        img.alt = '';
        img.width = 32;
        img.height = 32;
        img.loading = 'lazy';
        var label = document.createElement('span');
        label.textContent = it.name + ' × ' + it.qty;
        li.appendChild(img);
        li.appendChild(label);
        list.appendChild(li);
      });
    }
  }

  // Nhãn "Gợi ý" = món nằm trong kit gợi ý hiện tại.
  function updateSuggestedBadges() {
    var ids = {};
    if (currentReco && Array.isArray(currentReco.items)) {
      currentReco.items.forEach(function (it) { ids[it.id] = true; });
    }
    document.querySelectorAll('.js-byok-card').forEach(function (card) {
      var on = !!ids[card.getAttribute('data-id')];
      var badge = card.querySelector('.js-suggested-badge');
      card.classList.toggle('is-suggested', on);
      if (badge) {
        if (on) {
          badge.removeAttribute('hidden');
        } else {
          badge.setAttribute('hidden', 'hidden');
        }
      }
    });
  }

  function refreshReco() {
    renderReco();
    updateSuggestedBadges();
  }

  function applyReco() {
    if (!currentReco) { return; }
    if (getTotals().totalItems > 0 &&
        !window.confirm('Thay các món đang chọn bằng kit gợi ý?')) { return; }
    clearQuantities();
    currentReco.items.forEach(function (it) { updateItemQty(it.id, it.qty); });
    renderSummary();
    renderPreview();
  }

  // ?apply=1 (từ nút "Xây kit này" ở trang chủ): chỉ tự áp dụng khi giỏ trống.
  function handleApplyParam() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('apply') !== '1') { return; }
      if (getTotals().totalItems === 0) { applyReco(); }
      params.delete('apply');
      var qs = params.toString();
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    } catch (e) { /* bỏ qua */ }
  }

  // Render kit summary box & mobile sticky bar
  function renderSummary() {
    var totals = getTotals();

    // Counts
    var typesEls = document.querySelectorAll('.js-summary-types-count');
    typesEls.forEach(function (el) { el.textContent = totals.typesCount; });

    var itemsEls = document.querySelectorAll('.js-summary-items-count');
    itemsEls.forEach(function (el) { el.textContent = totals.totalItems; });

    // Prices
    var formattedPrice = formatVND(totals.totalPrice);
    var priceEls = document.querySelectorAll('.js-summary-total-price');
    priceEls.forEach(function (el) { el.textContent = formattedPrice; });

    // Empty state vs items list
    var emptyEl = document.querySelector('.js-summary-empty');
    var listEl = document.querySelector('.js-summary-items-list');

    if (totals.totalItems === 0) {
      if (emptyEl) emptyEl.removeAttribute('hidden');
      if (listEl) {
        listEl.setAttribute('hidden', 'hidden');
        listEl.innerHTML = '';
      }
    } else {
      if (emptyEl) emptyEl.setAttribute('hidden', 'hidden');
      if (listEl) {
        listEl.removeAttribute('hidden');
        listEl.innerHTML = '';

        Object.keys(state.items).forEach(function (id) {
          var qty = state.items[id];
          if (qty > 0 && productsCatalog[id]) {
            var item = productsCatalog[id];
            var row = document.createElement('div');
            row.className = 'sk-summary-item-row';

            var nameSpan = document.createElement('span');
            nameSpan.className = 'font-weight-medium text-dark';
            nameSpan.textContent = item.name + ' × ' + qty;

            var priceSpan = document.createElement('span');
            priceSpan.className = 'text-primary font-weight-bold';
            priceSpan.textContent = formatVND(item.price * qty);

            row.appendChild(nameSpan);
            row.appendChild(priceSpan);
            listEl.appendChild(row);
          }
        });
      }
    }

    // Add to cart buttons state
    var cartBtns = document.querySelectorAll('.js-btn-add-to-cart');
    cartBtns.forEach(function (btn) {
      btn.disabled = (totals.totalItems === 0);
    });
  }

  // Render preview using STRICT textContent (safe against XSS / HTML injection)
  function renderPreview() {
    var previewItems = document.querySelector('.js-preview-items');
    var previewNote = document.querySelector('.js-preview-note');
    var charCount = document.querySelector('.js-message-char-count');

    if (charCount) {
      charCount.textContent = state.message.length + '/' + MAX_MESSAGE_LEN + ' ký tự';
    }

    if (previewNote) {
      previewNote.textContent = state.message ? '“' + state.message + '”' : '(Chưa có lời nhắn cá nhân)';
    }

    if (previewItems) {
      var totals = getTotals();
      if (totals.totalItems === 0) {
        previewItems.textContent = 'Chưa chọn món đồ nào.';
      } else {
        var names = [];
        Object.keys(state.items).forEach(function (id) {
          var qty = state.items[id];
          if (qty > 0 && productsCatalog[id]) {
            names.push(productsCatalog[id].name + ' (' + qty + ')');
          }
        });
        previewItems.textContent = names.join(', ');
      }
    }
  }

  // Add to Demo Cart & navigate to /cart-demo/
  function addToCartAndProceed() {
    var totals = getTotals();
    if (totals.totalItems === 0) return;

    var itemsList = [];
    Object.keys(state.items).forEach(function (id) {
      var qty = state.items[id];
      if (qty > 0 && productsCatalog[id]) {
        var prod = productsCatalog[id];
        itemsList.push({
          id: prod.id,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          image: prod.image,
          variant: prod.variant,
          qty: qty,
          subtotal: prod.price * qty
        });
      }
    });

    var cartPayload = {
      level: currentLevel(),
      category: window.KitRecommend ? window.KitRecommend.getCategory() : 'exam',
      categoryName: currentReco && currentReco.category ? currentReco.category.name : '',
      message: state.message,
      items: itemsList,
      total: totals.totalPrice,
      totalItems: totals.totalItems
    };

    // Giữ lại các kit đã thêm bằng nút "Add to cart" (source: 'product').
    try {
      var prev = JSON.parse(sessionStorage.getItem(CART_KEY) || 'null');
      if (prev && Array.isArray(prev.items)) {
        prev.items.forEach(function (it) {
          if (it && it.source === 'product') {
            cartPayload.items.push(it);
            cartPayload.total += (Number(it.price) || 0) * (Number(it.qty) || 0);
            cartPayload.totalItems += Number(it.qty) || 0;
          }
        });
      }
    } catch (e) {}

    try {
      sessionStorage.setItem(CART_KEY, JSON.stringify(cartPayload));
    } catch (e) {
      // Storage quota or disabled
    }

    var cartEl = document.querySelector('[data-cart-url]');
    var cartUrl = (cartEl && cartEl.getAttribute('data-cart-url')) || '/cart-demo/';
    window.location.href = cartUrl;
  }

  // Setup DOM event listeners
  function setupListeners() {
    // Quantity minus button
    document.addEventListener('click', function (e) {
      var imageChoice = e.target.closest('.js-product-image-choice');
      if (imageChoice) {
        var imageCard = imageChoice.closest('.js-byok-card');
        var productImage = imageCard && imageCard.querySelector('.js-product-image');
        if (productImage) {
          productImage.src = imageChoice.getAttribute('data-image-src');
          productImage.alt = imageChoice.getAttribute('data-image-alt') || '';
          var productId = imageCard.getAttribute('data-id');
          if (productsCatalog[productId]) {
            var choiceImg = imageChoice.querySelector('img');
            var choiceSrc = (choiceImg && (choiceImg.currentSrc || choiceImg.src)) || imageChoice.getAttribute('data-image-src') || '';
            productsCatalog[productId].image = choiceSrc;
            productsCatalog[productId].variant = imageChoice.getAttribute('data-variant-label') || '';
          }
          imageCard.querySelectorAll('.js-product-image-choice').forEach(function (choice) {
            choice.setAttribute('aria-pressed', choice === imageChoice ? 'true' : 'false');
          });
        }
        return;
      }

      var minusBtn = e.target.closest('.js-qty-minus');
      if (minusBtn) {
        var card = minusBtn.closest('.js-byok-card');
        if (!card) return;
        var id = card.getAttribute('data-id');
        var current = state.items[id] || 0;
        updateItemQty(id, current - 1);
        return;
      }

      // Quantity plus button
      var plusBtn = e.target.closest('.js-qty-plus');
      if (plusBtn) {
        var cardPlus = plusBtn.closest('.js-byok-card');
        if (!cardPlus) return;
        var idPlus = cardPlus.getAttribute('data-id');
        var currentPlus = state.items[idPlus] || 0;
        updateItemQty(idPlus, currentPlus + 1);
        return;
      }

      // Apply recommendation button
      var applyBtn = e.target.closest('.js-apply-reco');
      if (applyBtn) {
        applyReco();
        return;
      }

      // Add to cart button
      var addBtn = e.target.closest('.js-btn-add-to-cart');
      if (addBtn) {
        addToCartAndProceed();
        return;
      }
    });

    // Quantity manual input change
    document.addEventListener('change', function (e) {
      if (e.target.classList.contains('js-qty-input')) {
        var card = e.target.closest('.js-byok-card');
        if (!card) return;
        var id = card.getAttribute('data-id');
        updateItemQty(id, e.target.value);
      }
    });

    // Message input change & live typing
    var msgInput = document.querySelector('.js-kit-message-input');
    if (msgInput) {
      msgInput.addEventListener('input', function () {
        state.message = msgInput.value.slice(0, MAX_MESSAGE_LEN);
        renderPreview();
      });
    }

    // Listen to Panic Level & Category changes
    document.addEventListener('paniclevelchange', refreshReco);
    document.addEventListener('kitcategorychange', refreshReco);
  }

  // Initialization
  function init() {
    initCatalog();
    restoreSavedCart();
    setupListeners();

    // Populate inputs from restored state
    Object.keys(state.items).forEach(function (id) {
      var qty = state.items[id];
      var card = document.querySelector('.js-byok-card[data-id="' + id + '"]');
      if (card) {
        var input = card.querySelector('.js-qty-input');
        var minusBtn = card.querySelector('.js-qty-minus');
        var plusBtn = card.querySelector('.js-qty-plus');
        if (input) input.value = qty;
        if (minusBtn) minusBtn.disabled = (qty <= 0);
        if (plusBtn) plusBtn.disabled = (qty >= MAX_QTY);
      }
    });

    var msgInput = document.querySelector('.js-kit-message-input');
    if (msgInput && state.message) {
      msgInput.value = state.message;
    }

    refreshReco();
    renderSummary();
    renderPreview();
    handleApplyParam();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
