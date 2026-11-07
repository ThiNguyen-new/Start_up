/**
 * Send a Rescue Controller
 * 5-Step client-side wizard for sending a care kit with greeting card.
 * Integrates with RescueCommon, KitRecommend, PanicLevel, and survivalKitCart.
 * Pure client-side simulation: no backend, no database, no real payment.
 */
(function () {
  'use strict';

  var form = document.getElementById('rescue-send-form');
  if (!form) return;

  var DRAFT_KEY = 'survivalKitGift';
  var CART_KEY = 'survivalKitCart';

  var rules = {
    minLeadDays: 1,
    maxLeadDays: 2,
    prepDays: 1,
    changeWindowHours: 24,
    blackoutDates: ['2027-01-01'],
    slots: [
      { id: 'morning', label: 'Sáng (8:00–11:00)' },
      { id: 'afternoon', label: 'Chiều (13:00–17:00)' },
      { id: 'evening', label: 'Tối (18:00–21:00)' }
    ]
  };

  var giftTypes = [
    {
      id: 'bestie',
      name: 'Bestie Rescue',
      tone: 'Ấm áp, chia sẻ, gần gũi',
      defaultCategory: 'care',
      allowAnonymous: false,
      samples: [
        'Deadline này để tụi mình cùng gánh. Cố lên bạn thân!',
        'Nạp miếng năng lượng rồi chiến tiếp nào bạn ơi!'
      ],
      cards: [
        { id: 'bestie-warm', name: 'Ấm áp', accent: '--color-primary' },
        { id: 'bestie-fun', name: 'Vui vẻ', accent: '--color-accent' }
      ]
    },
    {
      id: 'love',
      name: 'Love Rescue',
      tone: 'Ngọt ngào, quan tâm, yêu thương',
      defaultCategory: 'care',
      allowAnonymous: false,
      samples: [
        'Có anh/em luôn ở đây cổ vũ. Đừng thức khuya quá nhé!',
        'Gửi ngàn cái ôm tiếp sức cho người thương vượt ải deadline.'
      ],
      cards: [
        { id: 'love-heart', name: 'Trái tim', accent: '--color-primary' },
        { id: 'love-sweet', name: 'Ngọt ngào', accent: '--color-accent' }
      ]
    },
    {
      id: 'crush',
      name: 'Secret Crush Rescue',
      tone: 'Nhẹ nhàng, dễ thương, bí mật',
      defaultCategory: 'care',
      allowAnonymous: true,
      samples: [
        'Cố lên nhé, có người đang âm thầm cổ vũ cậu đó.',
        'Uống chút trà cho đỡ căng thẳng nhé crush ơi!'
      ],
      cards: [
        { id: 'crush-night', name: 'Đêm sao', accent: '--color-info' },
        { id: 'crush-blush', name: 'Bẽn lẽn', accent: '--color-accent' }
      ]
    },
    {
      id: 'team',
      name: 'Team Rescue',
      tone: 'Khí thế, đồng lòng, bùng nổ',
      defaultCategory: 'club',
      allowAnonymous: false,
      samples: [
        'Cả nhóm cùng gánh, không ai bị bỏ lại phía sau!',
        'Tập trung cao độ chốt hạ dự án nào cả team!'
      ],
      cards: [
        { id: 'team-power', name: 'Chiến binh', accent: '--color-secondary' },
        { id: 'team-fire', name: 'Bùng cháy', accent: '--color-warning' }
      ]
    }
  ];

  var state = {
    step: 1,
    giftType: 'bestie',
    selectedKitType: 'reco', // 'reco' | 'custom'
    kit: null,
    recipient: {
      name: '',
      phone: '',
      address: '',
      deadline: '',
      receive: '',
      slot: 'morning',
      note: ''
    },
    card: {
      format: 'physical_box',
      templateId: 'bestie-warm',
      senderName: '',
      isAnonymous: false,
      privatePhone: '',
      message: ''
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

  function loadData() {
    var rulesEl = document.getElementById('rescue-schedule-rules');
    if (rulesEl) {
      try {
        var parsedRules = JSON.parse(rulesEl.textContent);
        if (parsedRules && typeof parsedRules === 'object') {
          rules = Object.assign(rules, parsedRules);
        }
      } catch (e) {}
    }

    var giftsEl = document.getElementById('rescue-gift-types');
    if (giftsEl) {
      try {
        var parsedGifts = JSON.parse(giftsEl.textContent);
        if (Array.isArray(parsedGifts) && parsedGifts.length > 0) {
          giftTypes = parsedGifts;
        }
      } catch (e) {}
    }
  }

  function getActiveGiftTypeObj() {
    var found = giftTypes.find(function (g) { return g.id === state.giftType; });
    return found || giftTypes[0];
  }

  function currentLevel() {
    return window.PanicLevel ? window.PanicLevel.get() : 3;
  }

  function currentCategory() {
    return window.KitRecommend ? window.KitRecommend.getCategory() : (getActiveGiftTypeObj().defaultCategory || 'care');
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

    var recoCard = document.querySelector('.js-reco-card');
    if (recoCard) {
      recoCard.removeAttribute('hidden');
      var nameEl = recoCard.querySelector('.js-reco-name');
      var tagEl = recoCard.querySelector('.js-reco-tagline');
      var totalEl = recoCard.querySelector('.js-reco-total');
      var headingEl = recoCard.querySelector('.js-reco-heading');
      var itemsList = recoCard.querySelector('.js-reco-items');

      if (headingEl) headingEl.textContent = 'Kit gợi ý cho người nhận (Level ' + (kit.level || currentLevel()) + ')';
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
    if (summaryCatBadge) summaryCatBadge.textContent = 'Loại kit: ' + (kit.categoryName || 'Tiếp sức');
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

  function renderCardTemplates() {
    var container = document.querySelector('.js-card-templates-container');
    if (!container) return;

    var activeGift = getActiveGiftTypeObj();
    var cards = activeGift.cards || [];

    // If current templateId doesn't exist in cards, pick the first one
    if (!cards.some(function (c) { return c.id === state.card.templateId; })) {
      state.card.templateId = cards[0] ? cards[0].id : '';
    }

    container.textContent = '';
    cards.forEach(function (c) {
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'rescue-card-template-pill js-btn-select-template' + (c.id === state.card.templateId ? ' is-selected' : '');
      pill.setAttribute('data-template-id', c.id);

      var dot = document.createElement('span');
      dot.className = 'rescue-template-color-dot';
      dot.style.backgroundColor = 'var(' + c.accent + ', var(--color-primary))';

      var txt = document.createElement('span');
      txt.textContent = c.name;

      pill.appendChild(dot);
      pill.appendChild(txt);
      container.appendChild(pill);
    });

    updateCardPreview();
  }

  function renderSampleMessages() {
    var container = document.querySelector('.js-sample-messages-container');
    if (!container) return;

    var activeGift = getActiveGiftTypeObj();
    var samples = activeGift.samples || [];

    container.textContent = '';
    samples.forEach(function (s) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rescue-sample-msg-btn js-btn-insert-sample';
      btn.textContent = s;
      container.appendChild(btn);
    });
  }

  function updateAnonymousVisibility() {
    var wrapper = document.querySelector('.js-anonymous-wrapper');
    var privateFields = document.querySelector('.js-anonymous-private-fields');
    var chk = document.querySelector('.js-input-anonymous');
    var activeGift = getActiveGiftTypeObj();

    if (activeGift.allowAnonymous) {
      if (wrapper) wrapper.removeAttribute('hidden');
      if (chk) {
        chk.disabled = false;
        chk.checked = state.card.isAnonymous;
      }
      if (privateFields) {
        if (state.card.isAnonymous) {
          privateFields.removeAttribute('hidden');
        } else {
          privateFields.setAttribute('hidden', 'hidden');
        }
      }
    } else {
      if (wrapper) wrapper.setAttribute('hidden', 'hidden');
      if (chk) {
        chk.checked = false;
        chk.disabled = true;
      }
      state.card.isAnonymous = false;
      if (privateFields) privateFields.setAttribute('hidden', 'hidden');
    }
  }

  function updateCardPreview() {
    var activeGift = getActiveGiftTypeObj();
    var activeCard = (activeGift.cards || []).find(function (c) { return c.id === state.card.templateId; }) || (activeGift.cards ? activeGift.cards[0] : null);

    var cardBoxes = document.querySelectorAll('.js-card-preview-box, .js-success-card-preview');
    cardBoxes.forEach(function (box) {
      if (activeCard && activeCard.accent) {
        box.style.borderColor = 'var(' + activeCard.accent + ', var(--color-primary))';
      }
    });

    var tmplName = activeCard ? activeCard.name : 'Tiêu chuẩn';
    var previewTmplEl = document.querySelector('.js-card-preview-template-name');
    var previewToEl = document.querySelector('.js-card-preview-recipient');
    var previewBodyEl = document.querySelector('.js-card-preview-text');
    var previewFromEl = document.querySelector('.js-card-preview-sender');

    if (previewTmplEl) previewTmplEl.textContent = 'Mẫu thiệp: ' + tmplName;
    if (previewToEl) previewToEl.textContent = state.recipient.name ? state.recipient.name : 'Người nhận';
    if (previewBodyEl) {
      previewBodyEl.textContent = state.card.message ? state.card.message : '(Chưa có lời nhắn. Hãy nhập lời nhắn ở trên hoặc chọn gợi ý.)';
    }
    if (previewFromEl) {
      if (state.card.isAnonymous) {
        previewFromEl.textContent = 'Một người bạn ẩn danh 💌';
      } else {
        previewFromEl.textContent = state.card.senderName ? state.card.senderName : 'Bạn của bạn';
      }
    }

    renderReviewView();
  }

  function updateCharCount() {
    var msgInput = document.querySelector('.js-input-message');
    var countEl = document.querySelector('.js-message-char-count');
    if (!msgInput || !countEl) return;

    var count = window.RescueCommon ? window.RescueCommon.countChars(msgInput.value) : msgInput.value.length;
    countEl.textContent = count;
  }

  function validateStep(stepNumber) {
    if (stepNumber === 1) {
      var validTypes = giftTypes.map(function (g) { return g.id; });
      return validTypes.includes(state.giftType);
    }

    if (stepNumber === 2) {
      return state.kit !== null && Array.isArray(state.kit.items) && state.kit.items.length > 0;
    }

    if (stepNumber === 3) {
      var valid = true;
      var nameVal = state.recipient.name ? state.recipient.name.trim() : '';
      var phoneVal = state.recipient.phone ? state.recipient.phone.trim() : '';
      var addrVal = state.recipient.address ? state.recipient.address.trim() : '';
      var dVal = state.recipient.deadline;
      var rVal = state.recipient.receive;

      var nameErr = document.querySelector('.js-error-recipient-name');
      var phoneErr = document.querySelector('.js-error-recipient-phone');
      var addrErr = document.querySelector('.js-error-recipient-address');
      var deadErr = document.querySelector('.js-error-recipient-deadline');
      var delivErr = document.querySelector('.js-error-delivery-date');

      if (!nameVal || nameVal.length < 2 || nameVal.length > 60) {
        if (nameErr) { nameErr.textContent = 'Vui lòng nhập tên người nhận (2–60 ký tự).'; nameErr.removeAttribute('hidden'); }
        valid = false;
      } else {
        if (nameErr) nameErr.setAttribute('hidden', 'hidden');
      }

      if (!window.RescueCommon.isValidPhone(phoneVal)) {
        if (phoneErr) { phoneErr.textContent = 'Số điện thoại người nhận chưa đúng định dạng (ví dụ: 0901 234 567).'; phoneErr.removeAttribute('hidden'); }
        valid = false;
      } else {
        if (phoneErr) phoneErr.setAttribute('hidden', 'hidden');
      }

      if (!addrVal || addrVal.length < 10 || addrVal.length > 200) {
        if (addrErr) { addrErr.textContent = 'Địa chỉ nhận hàng cần cụ thể (tối thiểu 10 ký tự, tại TP. Hồ Chí Minh).'; addrErr.removeAttribute('hidden'); }
        valid = false;
      } else {
        if (addrErr) addrErr.setAttribute('hidden', 'hidden');
      }

      if (dVal && window.RescueCommon) {
        var today = window.RescueCommon.todayVN();
        var diff = window.RescueCommon.diffDays(dVal, today);
        if (diff < 1) {
          if (deadErr) { deadErr.textContent = 'Deadline của người nhận phải từ ngày mai trở đi.'; deadErr.removeAttribute('hidden'); }
          valid = false;
        } else {
          if (deadErr) deadErr.setAttribute('hidden', 'hidden');
        }
      } else {
        if (deadErr) deadErr.setAttribute('hidden', 'hidden');
      }

      var giftDateCheck = window.RescueCommon.validateGiftDate(rVal, dVal, rules);
      if (!giftDateCheck.isValid) {
        if (delivErr) { delivErr.textContent = giftDateCheck.error; delivErr.removeAttribute('hidden'); }
        valid = false;
      } else {
        if (delivErr) delivErr.setAttribute('hidden', 'hidden');
      }

      return valid;
    }

    if (stepNumber === 4) {
      var valid4 = true;
      var senderErr = document.querySelector('.js-error-sender-name');
      var privPhoneErr = document.querySelector('.js-error-private-phone');
      var msgErr = document.querySelector('.js-error-message');

      if (!state.card.isAnonymous) {
        var sName = state.card.senderName ? state.card.senderName.trim() : '';
        if (!sName || sName.length < 2 || sName.length > 60) {
          if (senderErr) { senderErr.textContent = 'Vui lòng nhập tên người gửi (2–60 ký tự).'; senderErr.removeAttribute('hidden'); }
          valid4 = false;
        } else {
          if (senderErr) senderErr.setAttribute('hidden', 'hidden');
        }
      } else {
        if (senderErr) senderErr.setAttribute('hidden', 'hidden');
        var privPhone = state.card.privatePhone ? state.card.privatePhone.trim() : '';
        if (!window.RescueCommon.isValidPhone(privPhone)) {
          if (privPhoneErr) { privPhoneErr.textContent = 'Khi gửi ẩn danh, vui lòng cung cấp SĐT thật của bạn để cửa hàng liên hệ khi cần.'; privPhoneErr.removeAttribute('hidden'); }
          valid4 = false;
        } else {
          if (privPhoneErr) privPhoneErr.setAttribute('hidden', 'hidden');
        }
      }

      var msgLen = window.RescueCommon ? window.RescueCommon.countChars(state.card.message) : state.card.message.length;
      if (msgLen < 2 || msgLen > 200) {
        if (msgErr) { msgErr.textContent = 'Vui lòng nhập lời nhắn từ 2 đến 200 ký tự.'; msgErr.removeAttribute('hidden'); }
        valid4 = false;
      } else {
        if (msgErr) msgErr.setAttribute('hidden', 'hidden');
      }

      return valid4;
    }

    if (stepNumber === 5) {
      var harassmentChk = document.querySelector('.js-input-agree-harassment');
      var termsChk = document.querySelector('.js-input-agree-terms');
      var harassmentErr = document.querySelector('.js-error-agree-harassment');
      var termsErr = document.querySelector('.js-error-agree-terms');

      var valid5 = true;
      if (harassmentChk && !harassmentChk.checked) {
        if (harassmentErr) harassmentErr.removeAttribute('hidden');
        valid5 = false;
      } else {
        if (harassmentErr) harassmentErr.setAttribute('hidden', 'hidden');
      }

      if (termsChk && !termsChk.checked) {
        if (termsErr) termsErr.removeAttribute('hidden');
        valid5 = false;
      } else {
        if (termsErr) termsErr.setAttribute('hidden', 'hidden');
      }

      return valid5;
    }

    return true;
  }

  function goToStep(targetStep) {
    if (targetStep < 1) targetStep = 1;
    if (targetStep > 5) targetStep = 5;

    if (targetStep > state.step) {
      for (var s = state.step; s < targetStep; s++) {
        if (!validateStep(s)) return;
      }
    }

    state.step = targetStep;

    var fieldsets = document.querySelectorAll('.js-rescue-step');
    fieldsets.forEach(function (fs) {
      var s = Number(fs.getAttribute('data-step'));
      if (s === state.step) {
        fs.removeAttribute('hidden');
      } else {
        fs.setAttribute('hidden', 'hidden');
      }
    });

    var tabs = document.querySelectorAll('.js-stepper-tab');
    tabs.forEach(function (tab) {
      var s = Number(tab.getAttribute('data-step'));
      tab.classList.remove('is-active', 'is-completed');
      if (s === state.step) {
        tab.classList.add('is-active');
        tab.setAttribute('aria-current', 'step');
      } else if (s < state.step) {
        tab.classList.add('is-completed');
        tab.removeAttribute('aria-current');
      } else {
        tab.removeAttribute('aria-current');
      }
    });

    var nextBtns = document.querySelectorAll('.js-btn-next-step');
    var prevBtn = document.querySelector('.js-btn-prev-step');
    var mobileBar = document.querySelector('.rescue-mobile-bar');

    if (prevBtn) {
      if (state.step === 1) {
        prevBtn.setAttribute('hidden', 'hidden');
      } else {
        prevBtn.removeAttribute('hidden');
      }
    }

    nextBtns.forEach(function (btn) {
      if (state.step === 5) {
        btn.innerHTML = '<i class="ti-gift mr-1"></i> Gửi quà ngay';
      } else {
        btn.innerHTML = 'Tiếp tục <i class="ti-arrow-right ml-1" aria-hidden="true"></i>';
      }
    });

    var stepLabel = document.querySelector('.js-summary-current-step-label');
    if (stepLabel) stepLabel.textContent = 'Bước ' + state.step + '/5';

    renderReviewView();
    saveCurrentDraft();

    try {
      window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
    } catch (e) {}
  }

  function renderReviewView() {
    var activeGift = getActiveGiftTypeObj();
    var activeCard = (activeGift.cards || []).find(function (c) { return c.id === state.card.templateId; }) || (activeGift.cards ? activeGift.cards[0] : null);

    var rGiftType = document.querySelector('.js-review-gift-type');
    var rKitName = document.querySelector('.js-review-kit-name');
    var rRecipient = document.querySelector('.js-review-recipient');
    var rDeliveryTime = document.querySelector('.js-review-delivery-time');
    var rCardInfo = document.querySelector('.js-review-card-info');
    var rTotal = document.querySelector('.js-review-total');

    if (rGiftType) {
      rGiftType.textContent = activeGift.name + ' (' + activeGift.tone + ')';
    }

    if (rKitName && state.kit) {
      rKitName.textContent = state.kit.name + ' (' + state.kit.count + ' món)';
    }

    if (rRecipient) {
      var recText = (state.recipient.name || 'Chưa điền tên') + ' · ' + (state.recipient.phone || 'Chưa điền SĐT');
      if (state.recipient.address) recText += ' · ' + state.recipient.address;
      rRecipient.textContent = recText;
    }

    if (rDeliveryTime) {
      var slotObj = rules.slots.find(function (s) { return s.id === state.recipient.slot; });
      var slotLabel = slotObj ? slotObj.label : 'Trong ngày';
      var dText = state.recipient.receive ? ('Ngày ' + state.recipient.receive + ' (' + slotLabel + ')') : 'Chưa chọn ngày giao';
      if (state.recipient.deadline) dText += ' · Deadline: ' + state.recipient.deadline;
      rDeliveryTime.textContent = dText;
    }

    if (rCardInfo) {
      var cardTxt = (activeCard ? activeCard.name : 'Tiêu chuẩn');
      cardTxt += ' · ' + (state.card.isAnonymous ? 'Từ: Ẩn danh' : ('Từ: ' + (state.card.senderName || 'Bạn')));
      if (state.card.message) {
        cardTxt += ' · "' + (state.card.message.length > 30 ? state.card.message.slice(0, 30) + '...' : state.card.message) + '"';
      }
      rCardInfo.textContent = cardTxt;
    }

    if (rTotal && state.kit) {
      rTotal.textContent = formatVND(state.kit.total);
    }

    // Sidebar context box
    var ctxBox = document.querySelector('.js-summary-context-box');
    var ctxDetails = document.querySelector('.js-summary-context-details');
    if (ctxBox && ctxDetails) {
      if (state.recipient.name || state.recipient.receive) {
        ctxBox.removeAttribute('hidden');
        var summaryHtml = '<strong>' + activeGift.name + '</strong>';
        if (state.recipient.name) summaryHtml += '<br>Tặng: ' + state.recipient.name;
        if (state.recipient.receive) summaryHtml += '<br>Giao: ' + state.recipient.receive;
        ctxDetails.innerHTML = summaryHtml;
      }
    }
  }

  function saveCurrentDraft() {
    if (!window.RescueCommon) return;
    window.RescueCommon.saveDraft(DRAFT_KEY, {
      giftType: state.giftType,
      selectedKitType: state.selectedKitType,
      recipient: state.recipient,
      card: state.card
    });
  }

  function restoreDraft() {
    if (!window.RescueCommon) return;
    var draft = window.RescueCommon.loadDraft(DRAFT_KEY);
    if (!draft) return;

    if (draft.giftType) state.giftType = draft.giftType;
    if (draft.selectedKitType) state.selectedKitType = draft.selectedKitType;
    if (draft.recipient) state.recipient = Object.assign({}, state.recipient, draft.recipient);
    if (draft.card) state.card = Object.assign({}, state.card, draft.card);

    // Sync input values
    var rTypeRadio = document.querySelector('input[name="giftType"][value="' + state.giftType + '"]');
    if (rTypeRadio) {
      rTypeRadio.checked = true;
      document.querySelectorAll('.js-gift-type-card').forEach(function (c) { c.classList.remove('is-selected'); });
      var cardLabel = rTypeRadio.closest('.js-gift-type-card');
      if (cardLabel) cardLabel.classList.add('is-selected');
    }

    var rName = document.querySelector('.js-input-recipient-name');
    var rPhone = document.querySelector('.js-input-recipient-phone');
    var rAddr = document.querySelector('.js-input-recipient-address');
    var rDead = document.querySelector('.js-input-recipient-deadline');
    var rDeliv = document.querySelector('.js-input-delivery-date');
    var rSlot = document.querySelector('.js-input-slot');
    var rNote = document.querySelector('.js-input-delivery-note');

    if (rName && state.recipient.name) rName.value = state.recipient.name;
    if (rPhone && state.recipient.phone) rPhone.value = state.recipient.phone;
    if (rAddr && state.recipient.address) rAddr.value = state.recipient.address;
    if (rDead && state.recipient.deadline) {
      rDead.value = state.recipient.deadline;
      var qk = document.querySelector('.js-quick-dates-container');
      if (qk) qk.removeAttribute('hidden');
    }
    if (rDeliv && state.recipient.receive) rDeliv.value = state.recipient.receive;
    if (rSlot && state.recipient.slot) rSlot.value = state.recipient.slot;
    if (rNote && state.recipient.note) rNote.value = state.recipient.note;

    var sName = document.querySelector('.js-input-sender-name');
    var sAnon = document.querySelector('.js-input-anonymous');
    var sPrivPhone = document.querySelector('.js-input-private-phone');
    var sMsg = document.querySelector('.js-input-message');
    var sFmt = document.querySelector('input[name="cardFormat"][value="' + state.card.format + '"]');

    if (sName && state.card.senderName) sName.value = state.card.senderName;
    if (sAnon) sAnon.checked = state.card.isAnonymous;
    if (sPrivPhone && state.card.privatePhone) sPrivPhone.value = state.card.privatePhone;
    if (sMsg && state.card.message) sMsg.value = state.card.message;
    if (sFmt) sFmt.checked = true;

    renderCardTemplates();
    renderSampleMessages();
    updateAnonymousVisibility();
    updateCharCount();
    updateCardPreview();
  }

  function handleQueryPrefill() {
    if (!window.RescueCommon) return;
    var params = new URLSearchParams(window.location.search);
    var q = {
      type: params.get('type'),
      recipient: params.get('recipient'),
      message: params.get('message'),
      category: params.get('category'),
      level: params.get('level')
    };

    var sanitized = window.RescueCommon.sanitizeQuery(q);

    if (sanitized.type) {
      state.giftType = sanitized.type;
      var rRadio = document.querySelector('input[name="giftType"][value="' + sanitized.type + '"]');
      if (rRadio) {
        rRadio.checked = true;
        document.querySelectorAll('.js-gift-type-card').forEach(function (c) { c.classList.remove('is-selected'); });
        var cardLabel = rRadio.closest('.js-gift-type-card');
        if (cardLabel) cardLabel.classList.add('is-selected');
      }
    }

    if (sanitized.recipient) {
      state.recipient.name = sanitized.recipient;
      var rName = document.querySelector('.js-input-recipient-name');
      if (rName) rName.value = sanitized.recipient;
    }

    if (sanitized.message) {
      state.card.message = sanitized.message;
      var sMsg = document.querySelector('.js-input-message');
      if (sMsg) sMsg.value = sanitized.message;
    }

    if (sanitized.category && window.KitRecommend) {
      window.KitRecommend.setCategory(sanitized.category);
    }

    if (sanitized.level && window.PanicLevel) {
      window.PanicLevel.set(sanitized.level);
    }

    renderCardTemplates();
    renderSampleMessages();
    updateAnonymousVisibility();
    updateCharCount();
    updateCardPreview();
  }

  function submitSendOrder() {
    for (var s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        goToStep(s);
        return;
      }
    }

    var orderCode = window.RescueCommon ? window.RescueCommon.makeOrderCode('SK', state.recipient.receive) : 'SK-20261103-DEMO';
    state.orderCode = orderCode;

    var activeGift = getActiveGiftTypeObj();
    var activeCard = (activeGift.cards || []).find(function (c) { return c.id === state.card.templateId; }) || (activeGift.cards ? activeGift.cards[0] : null);

    var giftPayload = {
      orderCode: orderCode,
      giftType: state.giftType,
      giftTypeName: activeGift.name,
      recipient: Object.assign({}, state.recipient),
      card: {
        format: state.card.format,
        templateId: state.card.templateId,
        templateName: activeCard ? activeCard.name : 'Tiêu chuẩn',
        senderName: state.card.isAnonymous ? 'Một người bạn ẩn danh' : state.card.senderName,
        isAnonymous: state.card.isAnonymous,
        privateSenderPhone: state.card.isAnonymous ? state.card.privatePhone : '',
        message: state.card.message
      },
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
      gift: giftPayload
    };

    if (window.RescueCommon) {
      window.RescueCommon.mergeIntoCart(fullCartPayload);
      window.RescueCommon.clearDraft(DRAFT_KEY);
    }

    // Success Screen
    var reviewView = document.querySelector('.js-rescue-review-view');
    var successView = document.querySelector('.js-rescue-success-view');
    var codeEl = document.querySelector('.js-success-order-code');

    if (reviewView) reviewView.setAttribute('hidden', 'hidden');
    if (successView) successView.removeAttribute('hidden');
    if (codeEl) codeEl.textContent = orderCode;

    var succTmpl = document.querySelector('.js-success-preview-template-name');
    var succTo = document.querySelector('.js-success-preview-recipient');
    var succBody = document.querySelector('.js-success-preview-text');
    var succFrom = document.querySelector('.js-success-preview-sender');
    var succBox = document.querySelector('.js-success-card-preview');

    if (succTmpl) succTmpl.textContent = 'Mẫu: ' + (activeCard ? activeCard.name : 'Tiêu chuẩn');
    if (succTo) succTo.textContent = state.recipient.name;
    if (succBody) succBody.textContent = state.card.message;
    if (succFrom) succFrom.textContent = state.card.isAnonymous ? 'Một người bạn ẩn danh 💌' : state.card.senderName;
    if (succBox && activeCard && activeCard.accent) {
      succBox.style.borderColor = 'var(' + activeCard.accent + ', var(--color-primary))';
    }

    var prevBtn = document.querySelector('.js-btn-prev-step');
    var nextBtns = document.querySelectorAll('.js-btn-next-step');
    if (prevBtn) prevBtn.setAttribute('hidden', 'hidden');
    nextBtns.forEach(function (btn) { btn.setAttribute('hidden', 'hidden'); });

    try {
      window.scrollTo({ top: successView.offsetTop - 80, behavior: 'smooth' });
    } catch (e) {}
  }

  function copyMessageToClipboard() {
    if (!state.card.message) return;
    var copyBtnText = document.querySelector('.js-copy-text');
    var textToCopy = 'Gửi ' + (state.recipient.name || 'bạn') + ',\n\n' +
                     state.card.message + '\n\n' +
                     'Từ: ' + (state.card.isAnonymous ? 'Một người bạn ẩn danh 💌' : (state.card.senderName || 'Bạn thân'));

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(function () {
        if (copyBtnText) copyBtnText.textContent = 'Đã sao chép!';
        setTimeout(function () {
          if (copyBtnText) copyBtnText.textContent = 'Sao chép lời nhắn';
        }, 2000);
      });
    }
  }

  function resetWizard() {
    if (window.RescueCommon) {
      window.RescueCommon.clearDraft(DRAFT_KEY);
    }
    window.location.reload();
  }

  function setupListeners() {
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
        if (state.step === 5) {
          submitSendOrder();
        } else {
          goToStep(state.step + 1);
        }
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

      var tmplBtn = e.target.closest('.js-btn-select-template');
      if (tmplBtn) {
        state.card.templateId = tmplBtn.getAttribute('data-template-id');
        document.querySelectorAll('.js-btn-select-template').forEach(function (b) { b.classList.remove('is-selected'); });
        tmplBtn.classList.add('is-selected');
        updateCardPreview();
        saveCurrentDraft();
        return;
      }

      var sampleBtn = e.target.closest('.js-btn-insert-sample');
      if (sampleBtn) {
        var sampleText = sampleBtn.textContent.trim();
        var msgInput = document.querySelector('.js-input-message');
        if (msgInput) {
          if (msgInput.value && msgInput.value.trim().length > 0) {
            if (!confirm('Bạn có muốn thay thế lời nhắn hiện tại bằng gợi ý này không?')) {
              return;
            }
          }
          msgInput.value = sampleText;
          state.card.message = sampleText;
          updateCharCount();
          updateCardPreview();
          saveCurrentDraft();
        }
        return;
      }

      var quickGiftBtn = e.target.closest('.js-btn-quick-gift-date');
      if (quickGiftBtn) {
        var offset = Number(quickGiftBtn.getAttribute('data-offset')) || 1;
        var dInput = document.querySelector('.js-input-recipient-deadline');
        var rInput = document.querySelector('.js-input-delivery-date');
        if (dInput && dInput.value && window.RescueCommon) {
          var calcReceive = window.RescueCommon.addDays(dInput.value, -offset);
          if (rInput && calcReceive) {
            rInput.value = calcReceive;
            state.recipient.receive = calcReceive;
            validateStep(3);
            updateCardPreview();
            saveCurrentDraft();
          }
        }
        return;
      }

      var confirmSendBtn = e.target.closest('.js-btn-confirm-send');
      if (confirmSendBtn) {
        submitSendOrder();
        return;
      }

      var copyBtn = e.target.closest('.js-btn-copy-message');
      if (copyBtn) {
        copyMessageToClipboard();
        return;
      }

      var resetBtn = e.target.closest('.js-btn-reset-wizard');
      if (resetBtn) {
        resetWizard();
        return;
      }
    });

    // Inputs listener
    document.addEventListener('input', function (e) {
      if (e.target.classList.contains('js-input-recipient-name')) {
        state.recipient.name = e.target.value.trim();
        updateCardPreview();
      }
      if (e.target.classList.contains('js-input-recipient-phone')) {
        state.recipient.phone = e.target.value.trim();
      }
      if (e.target.classList.contains('js-input-recipient-address')) {
        state.recipient.address = e.target.value.trim();
      }
      if (e.target.classList.contains('js-input-delivery-note')) {
        state.recipient.note = e.target.value.trim();
      }
      if (e.target.classList.contains('js-input-sender-name')) {
        state.card.senderName = e.target.value.trim();
        updateCardPreview();
      }
      if (e.target.classList.contains('js-input-private-phone')) {
        state.card.privatePhone = e.target.value.trim();
      }
      if (e.target.classList.contains('js-input-message')) {
        state.card.message = e.target.value;
        updateCharCount();
        updateCardPreview();
      }
    });

    document.addEventListener('change', function (e) {
      if (e.target.name === 'giftType') {
        state.giftType = e.target.value;
        document.querySelectorAll('.js-gift-type-card').forEach(function (c) { c.classList.remove('is-selected'); });
        var cardLabel = e.target.closest('.js-gift-type-card');
        if (cardLabel) cardLabel.classList.add('is-selected');

        var activeGt = getActiveGiftTypeObj();
        if (activeGt && activeGt.defaultCategory && window.KitRecommend) {
          window.KitRecommend.setCategory(activeGt.defaultCategory);
        }

        renderCardTemplates();
        renderSampleMessages();
        updateAnonymousVisibility();
        updateCardPreview();
        saveCurrentDraft();
      }

      if (e.target.classList.contains('js-input-recipient-deadline')) {
        state.recipient.deadline = e.target.value;
        var qk = document.querySelector('.js-quick-dates-container');
        if (qk) {
          if (state.recipient.deadline) qk.removeAttribute('hidden');
          else qk.setAttribute('hidden', 'hidden');
        }
        validateStep(3);
        updateCardPreview();
        saveCurrentDraft();
      }

      if (e.target.classList.contains('js-input-delivery-date')) {
        state.recipient.receive = e.target.value;
        validateStep(3);
        updateCardPreview();
        saveCurrentDraft();
      }

      if (e.target.classList.contains('js-input-slot')) {
        state.recipient.slot = e.target.value;
        saveCurrentDraft();
      }

      if (e.target.classList.contains('js-input-card-format')) {
        state.card.format = e.target.value;
        saveCurrentDraft();
      }

      if (e.target.classList.contains('js-input-anonymous')) {
        state.card.isAnonymous = e.target.checked;
        var priv = document.querySelector('.js-anonymous-private-fields');
        if (priv) {
          if (state.card.isAnonymous) priv.removeAttribute('hidden');
          else priv.setAttribute('hidden', 'hidden');
        }
        updateCardPreview();
        saveCurrentDraft();
      }

      if (e.target.classList.contains('js-input-recipient-name') ||
          e.target.classList.contains('js-input-recipient-phone') ||
          e.target.classList.contains('js-input-recipient-address') ||
          e.target.classList.contains('js-input-sender-name') ||
          e.target.classList.contains('js-input-message')) {
        saveCurrentDraft();
      }
    });

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

    var dInput = document.querySelector('.js-input-recipient-deadline');
    var rInput = document.querySelector('.js-input-delivery-date');

    if (dInput) dInput.min = minDeadline;
    if (rInput) rInput.min = minReceive;
  }

  function init() {
    loadData();
    initMinDates();
    checkCustomKitInCart();
    renderCardTemplates();
    renderSampleMessages();
    updateAnonymousVisibility();
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
