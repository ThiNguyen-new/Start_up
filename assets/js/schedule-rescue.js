/**
 * Survival Kit — Schedule a Rescue Controller
 * 4-step wizard for scheduling kit delivery before student deadlines.
 * Validates dates against schedule-rules.json, manages draft in sessionStorage,
 * produces .ics calendar file, and stores payload into survivalKitCart.
 */
(function () {
  'use strict';

  var DRAFT_KEY = 'survivalKitSchedule';
  var CART_KEY = 'survivalKitCart';

  var rules = {
    minLeadDays: 1,
    maxLeadDays: 2,
    prepDays: 1,
    changeWindowHours: 24,
    blackoutDates: [],
    slots: []
  };

  var state = {
    step: 1,
    selectedKitType: 'reco', // 'reco' or 'custom'
    kit: null,
    deadlineLabel: '',
    deadlineDate: '',
    receiveDate: '',
    slot: 'morning',
    contact: {
      name: '',
      phone: '',
      address: '',
      note: ''
    },
    orderCode: null
  };

  function formatVND(amount) {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    } catch (e) {
      return (amount || 0).toLocaleString('vi-VN') + ' ₫';
    }
  }

  function loadRules() {
    var el = document.getElementById('rescue-schedule-rules');
    if (!el) return;
    try {
      var parsed = JSON.parse(el.textContent);
      if (parsed && typeof parsed === 'object') {
        rules = Object.assign(rules, parsed);
      }
    } catch (e) {}
  }

  function currentLevel() {
    return window.PanicLevel ? window.PanicLevel.get() : 3;
  }

  function currentCategory() {
    return window.KitRecommend ? window.KitRecommend.getCategory() : 'exam';
  }

  function updateSelectedKit() {
    if (state.selectedKitType === 'custom') {
      var cartDraft = window.RescueCommon ? window.RescueCommon.loadDraft(CART_KEY) : null;
      if (cartDraft && Array.isArray(cartDraft.items) && cartDraft.items.length > 0) {
        state.kit = {
          name: 'Bộ kit tự phối',
          tagline: 'Cấu hình sản phẩm theo sở thích cá nhân của bạn',
          items: cartDraft.items,
          total: cartDraft.total || 0,
          count: cartDraft.totalItems || cartDraft.items.length
        };
        renderKitDetails();
        return;
      }
    }

    if (window.KitRecommend) {
      var reco = window.KitRecommend.recommend(currentCategory(), currentLevel());
      if (reco) {
        state.kit = {
          name: reco.kit.name,
          tagline: reco.kit.tagline,
          categoryName: reco.category.name,
          items: reco.items,
          total: reco.total,
          count: reco.count,
          level: reco.level
        };
      }
    }
    renderKitDetails();
  }

  function renderKitDetails() {
    var kit = state.kit;
    if (!kit) return;

    // Reco card in step 1
    var recoCard = document.querySelector('.js-reco-card');
    if (recoCard) {
      recoCard.removeAttribute('hidden');
      var nameEl = recoCard.querySelector('.js-reco-name');
      var tagEl = recoCard.querySelector('.js-reco-tagline');
      var totalEl = recoCard.querySelector('.js-reco-total');
      var headingEl = recoCard.querySelector('.js-reco-heading');
      var itemsList = recoCard.querySelector('.js-reco-items');

      if (headingEl) headingEl.textContent = 'Kit gợi ý cho Level ' + (kit.level || currentLevel());
      if (nameEl) nameEl.textContent = kit.name;
      if (tagEl) tagEl.textContent = kit.tagline;
      if (totalEl) totalEl.textContent = formatVND(kit.total) + ' · ' + kit.count + ' món';

      if (itemsList && Array.isArray(kit.items)) {
        itemsList.textContent = '';
        kit.items.forEach(function (it) {
          var li = document.createElement('li');
          li.className = 'sk-kit-chip';
          if (it.image) {
            var img = document.createElement('img');
            img.src = it.image;
            img.alt = '';
            img.width = 32;
            img.height = 32;
            img.loading = 'lazy';
            li.appendChild(img);
          }
          var txt = document.createElement('span');
          txt.textContent = it.name + ' × ' + (it.qty || 1);
          li.appendChild(txt);
          itemsList.appendChild(li);
        });
      }
    }

    // Sidebar summary
    var summaryKitName = document.querySelector('.js-summary-kit-name');
    var summaryCatBadge = document.querySelector('.js-summary-category-badge');
    var summaryPanicBadge = document.querySelector('.js-summary-panic-badge');
    var summaryItemsCount = document.querySelectorAll('.js-summary-items-count');
    var summaryTotalPrices = document.querySelectorAll('.js-summary-total-price');
    var summaryItemsList = document.querySelector('.js-summary-items-list');

    if (summaryKitName) summaryKitName.textContent = kit.name;
    if (summaryCatBadge) summaryCatBadge.textContent = 'Loại kit: ' + (kit.categoryName || 'Mùa thi');
    if (summaryPanicBadge) summaryPanicBadge.textContent = 'Level ' + (kit.level || currentLevel());
    summaryItemsCount.forEach(function (el) { el.textContent = kit.count || 0; });
    summaryTotalPrices.forEach(function (el) { el.textContent = formatVND(kit.total); });

    if (summaryItemsList && Array.isArray(kit.items)) {
      summaryItemsList.textContent = '';
      kit.items.forEach(function (it) {
        var row = document.createElement('div');
        row.className = 'sk-summary-item-row';
        var nameSpan = document.createElement('span');
        nameSpan.className = 'font-weight-medium text-dark';
        nameSpan.textContent = it.name + ' × ' + (it.qty || 1);
        var priceSpan = document.createElement('span');
        priceSpan.className = 'text-primary font-weight-bold';
        priceSpan.textContent = formatVND(it.price * (it.qty || 1));
        row.appendChild(nameSpan);
        row.appendChild(priceSpan);
        summaryItemsList.appendChild(row);
      });
    }

    renderReviewView();
  }

  function checkCustomKitInCart() {
    if (!window.RescueCommon) return;
    var cart = window.RescueCommon.loadDraft(CART_KEY);
    var banner = document.querySelector('.js-custom-kit-banner');
    if (banner && cart && Array.isArray(cart.items) && cart.items.length > 0) {
      banner.removeAttribute('hidden');
      var detailsEl = banner.querySelector('.js-custom-kit-details');
      if (detailsEl) {
        detailsEl.textContent = (cart.totalItems || cart.items.length) + ' món · ' + formatVND(cart.total);
      }
    }
  }

  function updateTimeline() {
    var todayStr = window.RescueCommon ? window.RescueCommon.todayVN() : '';
    var timelineToday = document.querySelector('.js-timeline-today');
    var timelineReceive = document.querySelector('.js-timeline-receive');
    var timelineDeadline = document.querySelector('.js-timeline-deadline');
    var timelineSummary = document.querySelector('.js-timeline-summary');

    if (timelineToday) timelineToday.textContent = todayStr ? 'Hôm nay (' + todayStr + ')' : 'Hôm nay';
    if (timelineReceive) {
      timelineReceive.textContent = state.receiveDate ? 'Nhận (' + state.receiveDate + ')' : 'Ngày nhận';
    }
    if (timelineDeadline) {
      timelineDeadline.textContent = state.deadlineDate ? 'Hạn chót (' + state.deadlineDate + ')' : 'Hạn chót';
    }

    if (timelineSummary && state.deadlineDate && state.receiveDate && window.RescueCommon) {
      var lead = window.RescueCommon.diffDays(state.deadlineDate, state.receiveDate);
      if (lead >= 1 && lead <= 2) {
        timelineSummary.textContent = 'Bạn sẽ nhận kit trước hạn chót đúng ' + lead + ' ngày. Đủ thời gian tiếp sức tối ưu!';
        timelineSummary.className = 'text-success small text-center mb-0 mt-3 font-weight-bold js-timeline-summary';
      } else {
        timelineSummary.textContent = 'Nhận kit trước deadline 1–2 ngày giúp bạn có trọn vẹn năng lượng trước giờ G.';
        timelineSummary.className = 'text-muted small text-center mb-0 mt-3 font-italic js-timeline-summary';
      }
    }
  }

  function validateStep(stepNum) {
    if (stepNum === 1) {
      return state.kit !== null;
    }

    if (stepNum === 2) {
      if (!window.RescueCommon) return true;
      var dInput = document.querySelector('.js-input-deadline-date');
      var rInput = document.querySelector('.js-input-receive-date');
      var dErr = document.querySelector('.js-error-deadline');
      var rErr = document.querySelector('.js-error-receive');

      state.deadlineDate = dInput ? dInput.value : '';
      state.receiveDate = rInput ? rInput.value : '';

      var valRes = window.RescueCommon.validateSchedule(state.deadlineDate, state.receiveDate, rules);

      if (!state.deadlineDate) {
        if (dErr) { dErr.textContent = 'Vui lòng chọn ngày deadline.'; dErr.removeAttribute('hidden'); }
        return false;
      } else {
        if (dErr) dErr.setAttribute('hidden', 'hidden');
      }

      if (!state.receiveDate) {
        if (rErr) { rErr.textContent = 'Vui lòng chọn ngày nhận.'; rErr.removeAttribute('hidden'); }
        return false;
      }

      if (!valRes.isValid) {
        if (rErr) { rErr.textContent = valRes.error; rErr.removeAttribute('hidden'); }
        return false;
      } else {
        if (rErr) rErr.setAttribute('hidden', 'hidden');
      }
      return true;
    }

    if (stepNum === 3) {
      var nameInput = document.querySelector('.js-input-name');
      var phoneInput = document.querySelector('.js-input-phone');
      var addrInput = document.querySelector('.js-input-address');
      var agreeInput = document.querySelector('.js-input-agree');

      var nameErr = document.querySelector('.js-error-name');
      var phoneErr = document.querySelector('.js-error-phone');
      var addrErr = document.querySelector('.js-error-address');
      var agreeErr = document.querySelector('.js-error-agree');

      var valid = true;
      var nameVal = (nameInput ? nameInput.value : '').trim();
      var phoneVal = (phoneInput ? phoneInput.value : '').trim();
      var addrVal = (addrInput ? addrInput.value : '').trim();
      var agreed = agreeInput ? agreeInput.checked : false;

      state.contact.name = nameVal;
      state.contact.phone = phoneVal;
      state.contact.address = addrVal;

      if (!nameVal || nameVal.length < 2 || nameVal.length > 60) {
        if (nameErr) { nameErr.textContent = 'Nhập tên từ 2 đến 60 ký tự.'; nameErr.removeAttribute('hidden'); }
        valid = false;
      } else {
        if (nameErr) nameErr.setAttribute('hidden', 'hidden');
      }

      if (!window.RescueCommon.isValidPhone(phoneVal)) {
        if (phoneErr) { phoneErr.textContent = 'Số điện thoại chưa đúng định dạng (ví dụ: 0901 234 567).'; phoneErr.removeAttribute('hidden'); }
        valid = false;
      } else {
        if (phoneErr) phoneErr.setAttribute('hidden', 'hidden');
      }

      if (!addrVal || addrVal.length < 10 || addrVal.length > 200) {
        if (addrErr) { addrErr.textContent = 'Địa chỉ cần đầy đủ số nhà, đường, quận/huyện (tối thiểu 10 ký tự).'; addrErr.removeAttribute('hidden'); }
        valid = false;
      } else {
        if (addrErr) addrErr.setAttribute('hidden', 'hidden');
      }

      if (!agreed) {
        if (agreeErr) agreeErr.removeAttribute('hidden');
        valid = false;
      } else {
        if (agreeErr) agreeErr.setAttribute('hidden', 'hidden');
      }

      return valid;
    }

    return true;
  }

  function goToStep(targetStep) {
    if (targetStep < 1) targetStep = 1;
    if (targetStep > 4) targetStep = 4;

    // Validate if moving forward
    if (targetStep > state.step) {
      for (var s = state.step; s < targetStep; s++) {
        if (!validateStep(s)) return;
      }
    }

    state.step = targetStep;

    // Toggle fieldsets
    document.querySelectorAll('.js-rescue-step').forEach(function (fset) {
      var num = Number(fset.getAttribute('data-step'));
      if (num === targetStep) {
        fset.removeAttribute('hidden');
        var legend = fset.querySelector('legend');
        if (legend) {
          legend.setAttribute('tabindex', '-1');
          legend.focus();
        }
      } else {
        fset.setAttribute('hidden', 'hidden');
      }
    });

    // Update stepper tabs
    document.querySelectorAll('.js-stepper-tab').forEach(function (tab) {
      var num = Number(tab.getAttribute('data-step'));
      tab.classList.toggle('is-active', num === targetStep);
      tab.classList.toggle('is-completed', num < targetStep);
      if (num === targetStep) {
        tab.setAttribute('aria-current', 'step');
      } else {
        tab.removeAttribute('aria-current');
      }
    });

    // Update actions in summary
    var nextBtns = document.querySelectorAll('.js-btn-next-step');
    var prevBtn = document.querySelector('.js-btn-prev-step');
    var stepLabel = document.querySelector('.js-summary-current-step-label');

    if (stepLabel) stepLabel.textContent = 'Bước ' + targetStep + '/4';

    nextBtns.forEach(function (btn) {
      if (targetStep === 4) {
        btn.setAttribute('hidden', 'hidden');
      } else {
        btn.removeAttribute('hidden');
        btn.textContent = 'Tiếp tục bước ' + (targetStep + 1);
      }
    });

    if (prevBtn) {
      if (targetStep > 1 && !state.orderCode) {
        prevBtn.removeAttribute('hidden');
      } else {
        prevBtn.setAttribute('hidden', 'hidden');
      }
    }

    // Context details in sidebar
    var contextBox = document.querySelector('.js-summary-context-box');
    var contextDetails = document.querySelector('.js-summary-context-details');
    if (contextBox && contextDetails) {
      if (state.receiveDate && state.deadlineDate) {
        contextBox.removeAttribute('hidden');
        contextDetails.textContent = 'Nhận: ' + state.receiveDate + ' (' + state.slot + ') · Hạn: ' + state.deadlineDate;
      } else {
        contextBox.setAttribute('hidden', 'hidden');
      }
    }

    renderReviewView();
    saveCurrentDraft();
  }

  function renderReviewView() {
    var kitName = document.querySelector('.js-review-kit-name');
    var deadline = document.querySelector('.js-review-deadline');
    var receive = document.querySelector('.js-review-receive');
    var contact = document.querySelector('.js-review-contact');
    var total = document.querySelector('.js-review-total');

    if (kitName && state.kit) {
      kitName.textContent = state.kit.name + ' (' + formatVND(state.kit.total) + ')';
    }
    if (deadline) {
      deadline.textContent = (state.deadlineLabel ? state.deadlineLabel + ': ' : '') + (state.deadlineDate || 'Chưa chọn');
    }
    if (receive) {
      var slotLabel = state.slot;
      if (Array.isArray(rules.slots)) {
        var found = rules.slots.find(function (s) { return s.id === state.slot; });
        if (found) slotLabel = found.label;
      }
      receive.textContent = (state.receiveDate || 'Chưa chọn') + ' (' + slotLabel + ')';
    }
    if (contact) {
      contact.textContent = (state.contact.name || '') + ' · ' + (state.contact.phone || '') + '\n' + (state.contact.address || '');
    }
    if (total && state.kit) {
      total.textContent = formatVND(state.kit.total);
    }
  }

  function saveCurrentDraft() {
    if (!window.RescueCommon) return;
    window.RescueCommon.saveDraft(DRAFT_KEY, {
      step: state.step,
      selectedKitType: state.selectedKitType,
      deadlineLabel: state.deadlineLabel,
      deadlineDate: state.deadlineDate,
      receiveDate: state.receiveDate,
      slot: state.slot,
      contact: state.contact
    });
  }

  function restoreDraft() {
    if (!window.RescueCommon) return;
    var draft = window.RescueCommon.loadDraft(DRAFT_KEY);
    if (!draft) return;

    if (draft.deadlineLabel) state.deadlineLabel = draft.deadlineLabel;
    if (draft.deadlineDate) state.deadlineDate = draft.deadlineDate;
    if (draft.receiveDate) state.receiveDate = draft.receiveDate;
    if (draft.slot) state.slot = draft.slot;
    if (draft.contact) state.contact = draft.contact;
    if (draft.selectedKitType) state.selectedKitType = draft.selectedKitType;

    // Repopulate form inputs
    var dLabel = document.querySelector('.js-input-deadline-label');
    var dDate = document.querySelector('.js-input-deadline-date');
    var rDate = document.querySelector('.js-input-receive-date');
    var slotSelect = document.querySelector('.js-input-slot');
    var nameInput = document.querySelector('.js-input-name');
    var phoneInput = document.querySelector('.js-input-phone');
    var addrInput = document.querySelector('.js-input-address');
    var noteInput = document.querySelector('.js-input-note');

    if (dLabel && state.deadlineLabel) dLabel.value = state.deadlineLabel;
    if (dDate && state.deadlineDate) dDate.value = state.deadlineDate;
    if (rDate && state.receiveDate) rDate.value = state.receiveDate;
    if (slotSelect && state.slot) slotSelect.value = state.slot;
    if (nameInput && state.contact.name) nameInput.value = state.contact.name;
    if (phoneInput && state.contact.phone) phoneInput.value = state.contact.phone;
    if (addrInput && state.contact.address) addrInput.value = state.contact.address;
    if (noteInput && state.contact.note) noteInput.value = state.contact.note;

    updateTimeline();
  }

  function handleQueryPrefill() {
    if (!window.RescueCommon) return;
    var params = new URLSearchParams(window.location.search);
    var q = {
      deadline: params.get('deadline'),
      receive: params.get('receive'),
      category: params.get('category'),
      level: params.get('level')
    };
    var sanitized = window.RescueCommon.sanitizeQuery(q);

    if (sanitized.category && window.KitRecommend) {
      window.KitRecommend.setCategory(sanitized.category);
    }
    if (sanitized.level && window.PanicLevel) {
      window.PanicLevel.set(sanitized.level);
    }
    if (sanitized.deadline) {
      state.deadlineDate = sanitized.deadline;
      var dInput = document.querySelector('.js-input-deadline-date');
      if (dInput) dInput.value = sanitized.deadline;
    }
    if (sanitized.receive) {
      state.receiveDate = sanitized.receive;
      var rInput = document.querySelector('.js-input-receive-date');
      if (rInput) rInput.value = sanitized.receive;
    }
    updateTimeline();
  }

  function submitScheduleOrder() {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      goToStep(1);
      return;
    }

    var orderCode = window.RescueCommon ? window.RescueCommon.makeOrderCode('SK', state.receiveDate) : 'SK-20261103-DEMO';
    state.orderCode = orderCode;

    var schedulePayload = {
      orderCode: orderCode,
      deadline: state.deadlineDate,
      deadlineLabel: state.deadlineLabel || 'Kỳ thi / Deadline',
      receive: state.receiveDate,
      slot: state.slot,
      contact: Object.assign({}, state.contact),
      createdAt: new Date().toISOString()
    };

    var cartItems = [];
    if (state.kit && Array.isArray(state.kit.items)) {
      cartItems = state.kit.items.map(function (it) {
        return {
          id: it.id,
          name: it.name,
          category: it.category || 'Survival Kit',
          price: it.price,
          image: it.image || '',
          qty: it.qty || 1,
          subtotal: it.subtotal || (it.price * (it.qty || 1))
        };
      });
    }

    var fullCartPayload = {
      level: state.kit ? (state.kit.level || currentLevel()) : currentLevel(),
      category: currentCategory(),
      categoryName: state.kit ? state.kit.categoryName : '',
      items: cartItems,
      total: state.kit ? state.kit.total : 0,
      totalItems: state.kit ? state.kit.count : 0,
      schedule: schedulePayload
    };

    if (window.RescueCommon) {
      window.RescueCommon.mergeIntoCart(fullCartPayload);
      window.RescueCommon.clearDraft(DRAFT_KEY);
    }

    // Display success view
    var reviewView = document.querySelector('.js-rescue-review-view');
    var successView = document.querySelector('.js-rescue-success-view');
    var orderCodeEl = document.querySelector('.js-success-order-code');
    var prevBtn = document.querySelector('.js-btn-prev-step');
    var nextBtns = document.querySelectorAll('.js-btn-next-step');

    if (reviewView) reviewView.setAttribute('hidden', 'hidden');
    if (successView) successView.removeAttribute('hidden');
    if (orderCodeEl) orderCodeEl.textContent = orderCode;
    if (prevBtn) prevBtn.setAttribute('hidden', 'hidden');
    nextBtns.forEach(function (btn) { btn.setAttribute('hidden', 'hidden'); });
  }

  function downloadCalendarFile() {
    if (!window.RescueCommon || !state.receiveDate) return;
    var icsContent = window.RescueCommon.buildICS({
      title: state.deadlineLabel || 'Kỳ thi / Deadline',
      receiveDate: state.receiveDate,
      deadlineDate: state.deadlineDate,
      orderCode: state.orderCode
    });

    var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (state.orderCode || 'schedule') + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function setupListeners() {
    // Stepper Tab Clicks
    document.addEventListener('click', function (e) {
      var tab = e.target.closest('.js-stepper-tab');
      if (tab) {
        var target = Number(tab.getAttribute('data-step'));
        if (target <= state.step || validateStep(state.step)) {
          goToStep(target);
        }
        return;
      }

      var nextBtn = e.target.closest('.js-btn-next-step');
      if (nextBtn) {
        goToStep(state.step + 1);
        return;
      }

      var prevBtn = e.target.closest('.js-btn-prev-step');
      if (prevBtn) {
        goToStep(state.step - 1);
        return;
      }

      var editBtn = e.target.closest('.js-btn-edit-step');
      if (editBtn) {
        var targetStep = Number(editBtn.getAttribute('data-target-step')) || 1;
        var reviewView = document.querySelector('.js-rescue-review-view');
        var successView = document.querySelector('.js-rescue-success-view');
        if (reviewView) reviewView.removeAttribute('hidden');
        if (successView) successView.setAttribute('hidden', 'hidden');
        goToStep(targetStep);
        return;
      }

      var useCustomBtn = e.target.closest('.js-btn-use-custom');
      if (useCustomBtn) {
        state.selectedKitType = 'custom';
        updateSelectedKit();
        return;
      }

      var quickBtn = e.target.closest('.js-btn-quick-date');
      if (quickBtn) {
        var offset = Number(quickBtn.getAttribute('data-offset')) || 1;
        var dInput = document.querySelector('.js-input-deadline-date');
        var rInput = document.querySelector('.js-input-receive-date');
        if (dInput && dInput.value && window.RescueCommon) {
          var calcReceive = window.RescueCommon.addDays(dInput.value, -offset);
          if (rInput && calcReceive) {
            rInput.value = calcReceive;
            state.receiveDate = calcReceive;
            validateStep(2);
            updateTimeline();
          }
        }
        return;
      }

      var confirmBtn = e.target.closest('.js-btn-confirm-schedule');
      if (confirmBtn) {
        submitScheduleOrder();
        return;
      }

      var icsBtn = e.target.closest('.js-btn-download-ics');
      if (icsBtn) {
        downloadCalendarFile();
        return;
      }
    });

    // Real-time Inputs
    document.addEventListener('input', function (e) {
      if (e.target.classList.contains('js-input-deadline-date') ||
          e.target.classList.contains('js-input-receive-date')) {
        updateTimeline();
      }
      if (e.target.classList.contains('js-input-deadline-label')) {
        state.deadlineLabel = e.target.value.trim();
        renderReviewView();
      }
    });

    document.addEventListener('change', function (e) {
      if (e.target.classList.contains('js-input-deadline-date') ||
          e.target.classList.contains('js-input-receive-date')) {
        validateStep(2);
        updateTimeline();
        saveCurrentDraft();
      }
      if (e.target.classList.contains('js-input-slot')) {
        state.slot = e.target.value;
        renderReviewView();
        saveCurrentDraft();
      }
      if (e.target.classList.contains('js-input-name') ||
          e.target.classList.contains('js-input-phone') ||
          e.target.classList.contains('js-input-address') ||
          e.target.classList.contains('js-input-note')) {
        saveCurrentDraft();
      }
    });

    // External Kit events
    document.addEventListener('paniclevelchange', function () {
      if (state.selectedKitType === 'reco') {
        updateSelectedKit();
      }
    });

    document.addEventListener('kitcategorychange', function () {
      if (state.selectedKitType === 'reco') {
        updateSelectedKit();
      }
    });
  }

  function initMinDates() {
    if (!window.RescueCommon) return;
    var today = window.RescueCommon.todayVN();
    var minReceive = window.RescueCommon.addDays(today, rules.prepDays || 1);
    var minDeadline = window.RescueCommon.addDays(today, (rules.prepDays || 1) + (rules.minLeadDays || 1));

    var dInput = document.querySelector('.js-input-deadline-date');
    var rInput = document.querySelector('.js-input-receive-date');

    if (dInput) dInput.min = minDeadline;
    if (rInput) rInput.min = minReceive;
  }

  function init() {
    loadRules();
    initMinDates();
    checkCustomKitInCart();
    restoreDraft();
    handleQueryPrefill();
    updateSelectedKit();
    setupListeners();
    goToStep(state.step || 1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

