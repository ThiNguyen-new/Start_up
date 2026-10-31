// Preloader js    
$(window).on('load', function () {
  $('.preloader').fadeOut(100);
});

(function ($) {
  'use strict';

  // navigation
  $(window).scroll(function () {
    if ($('.navigation').offset().top > 1) {
      $('.navigation').addClass('nav-bg');
    } else {
      $('.navigation').removeClass('nav-bg');
    }
  });


  // video modal popup
  var $videoSrc;
  $('.video-modal').click(function () {
    $videoSrc = $(this).data("src");
  });
  $('#videoModal').on('shown.bs.modal', function (e) {
    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
  })
  $('#videoModal').on('hide.bs.modal', function (e) {
    $("#video").attr('src', $videoSrc);
  })
  $('#videoModal2').on('shown.bs.modal', function (e) {
    $("#video2").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
  })
  $('#videoModal2').on('hide.bs.modal', function (e) {
    $("#video2").attr('src', $videoSrc);
  })


  // testimonial slider
  $('.testimonial-slider').slick({
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: '<button type=\'button\' class=\'prevArrow\'><i class=\'ti-arrow-left\'></i></button>',
    nextArrow: '<button type=\'button\' class=\'nextArrow\'><i class=\'ti-arrow-right\'></i></button>',
    autoplay: true,
    responsive: [{
        breakpoint: 1024,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 401,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });


  // product Slider
  $('.product-slider').slick({
    autoplay: false,
    infinite: true,
    arrows: false,
    dots: true,
    customPaging: function (slider, i) {
      var image = $(slider.$slides[i]).data('image');
      return '<img class="img-fluid" src="' + image + '" alt="product-img">';
    }
  });


  // Accordions
  $('.collapse').on('shown.bs.collapse', function () {
    $(this).parent().find('.ti-plus').removeClass('ti-plus').addClass('ti-minus');
  }).on('hidden.bs.collapse', function () {
    $(this).parent().find('.ti-minus').removeClass('ti-minus').addClass('ti-plus');
  });


  // Survival Kit — Panic Level, product filters, schedule & gifting (MVP, no backend)

  var PRICE_BANDS = {
    mini: { min: 39000, max: 59000 },
    standard: { min: 79000, max: 129000 },
    premium: { min: 149000, max: 229000 }
  };

  function attrOrData($el, name) {
    var attr = $el.attr(name);
    if (attr !== undefined && attr !== '') {
      return String(attr);
    }
    var camel = name.replace(/^data-/, '').replace(/-([a-z])/g, function (_, c) {
      return c.toUpperCase();
    });
    var value = $el.data(camel);
    if (value === undefined || value === null || value === '') {
      return '';
    }
    return String(value);
  }

  function parsePrice($card) {
    var raw = attrOrData($card, 'data-price');
    if (!raw) {
      return NaN;
    }
    return Number(String(raw).replace(/[^\d.]/g, ''));
  }

  function priceBandOf($card) {
    var band = attrOrData($card, 'data-price-band').toLowerCase();
    if (band) {
      return band;
    }
    var price = parsePrice($card);
    if (isNaN(price)) {
      return '';
    }
    var key;
    for (key in PRICE_BANDS) {
      if (price >= PRICE_BANDS[key].min && price <= PRICE_BANDS[key].max) {
        return key;
      }
    }
    return '';
  }

  function selectedPanicLevel() {
    var $pressed = $('.js-panic-level[aria-pressed="true"]');
    if (!$pressed.length) {
      return '';
    }
    return attrOrData($pressed.first(), 'data-panic-level') || attrOrData($pressed.first(), 'data-level');
  }

  function applyKitFilters() {
    var $cards = $('.js-kit-card');
    if (!$cards.length) {
      return;
    }

    var level = selectedPanicLevel();
    var kitType = ($('.js-kit-filter-type').val() || '').toString().toLowerCase();
    var priceBand = ($('.js-kit-filter-price').val() || '').toString().toLowerCase();
    var visible = 0;

    $cards.each(function () {
      var $card = $(this);
      var match = true;
      var cardLevel = attrOrData($card, 'data-panic-level');
      var cardType = attrOrData($card, 'data-kit-type').toLowerCase();
      var cardBand = priceBandOf($card);

      if (level && cardLevel !== level) {
        match = false;
      }
      if (kitType && cardType !== kitType) {
        match = false;
      }
      if (priceBand && cardBand !== priceBand) {
        match = false;
      }

      $card.toggle(match);
      if (match) {
        visible += 1;
      }
    });

    if (visible === 0) { $('.js-kit-empty').removeAttr('hidden').show(); } else { $('.js-kit-empty').attr('hidden', 'hidden').hide(); }
  }

  $(document).on('click', '.js-panic-level', function (event) {
    event.preventDefault();
    var $btn = $(this);
    var wasPressed = $btn.attr('aria-pressed') === 'true';
    $('.js-panic-level').attr('aria-pressed', 'false').removeClass('is-active');
    if (!wasPressed) {
      $btn.attr('aria-pressed', 'true').addClass('is-active');
    }
    applyKitFilters();
  });

  $(document).on('change', '.js-kit-filter-type, .js-kit-filter-price', applyKitFilters);

  applyKitFilters();

  function dayDiff(deadlineStr, receiveStr) {
    var deadline = new Date(deadlineStr);
    var receive = new Date(receiveStr);
    if (isNaN(deadline.getTime()) || isNaN(receive.getTime())) {
      return NaN;
    }
    deadline.setHours(0, 0, 0, 0);
    receive.setHours(0, 0, 0, 0);
    return Math.round((deadline.getTime() - receive.getTime()) / 86400000);
  }

  $(document).on('submit', '#schedule form, form.js-schedule-form', function (event) {
    event.preventDefault();
    var $form = $(this);
    var deadline = $form.find('[name="deadline"], #deadline, .js-deadline').val();
    var receive = $form.find('[name="receive"], [name="delivery"], #receive, .js-receive').val();
    var $status = $form.find('.js-schedule-status');
    if (!$status.length) {
      $status = $('#schedule .js-schedule-status');
    }
    var diff = dayDiff(deadline, receive);
    var ok = diff === 1 || diff === 2;
    var message = ok
      ? 'Rescue scheduled: kit arrives 1–2 days before your deadline. (Demo only — nothing was sent.)'
      : 'Pick a receive date 1 or 2 days before the deadline.';
    if ($status.length) {
      $status.text(message).attr('role', 'status');
    } else {
      window.alert(message);
    }
  });

  $(document).on('submit', '#gifting form, form.js-gifting-form', function (event) {
    event.preventDefault();
    var $form = $(this);
    var recipient = $form.find('[name="recipient"], #recipient, .js-gift-recipient').val() || '';
    var kind = $form.find('[name="gift_type"], [name="kind"], #gift-type, .js-gift-type').val() || '';
    var note = $form.find('[name="message"], [name="note"], #gift-message, .js-gift-message').val() || '';
    var preview = 'Rescue for ' + (recipient || 'your person');
    if (kind) {
      preview += ' · ' + kind;
    }
    if (note) {
      preview += ': “' + note + '”';
    }
    preview += ' (Demo only — nothing was sent.)';
    var $preview = $form.find('.js-gift-preview');
    if (!$preview.length) {
      $preview = $('#gifting .js-gift-preview');
    }
    if ($preview.length) {
      $preview.text(preview).attr('role', 'status');
    } else {
      window.alert(preview);
    }
  });

})(jQuery);
