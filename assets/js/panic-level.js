(function () {
  const KEY = "survivalKitPanicLevel";
  const MIN = 1, MAX = 7, DEFAULT = 3;

  function messageFor(n) {
    if (n <= 2) return "Bình tĩnh: kit nhẹ nhàng, tạo động lực.";
    if (n <= 4) return "Bắt đầu căng: gợi ý đồ uống, snack, dụng cụ tập trung.";
    if (n <= 6) return "Deadline sát: gợi ý bộ hỗ trợ làm việc, bạn tự chọn.";
    return "Cứu deadline!";
  }

  function get() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLevel = Number(urlParams.get("level") || urlParams.get("panic"));
      if (Number.isInteger(urlLevel) && urlLevel >= MIN && urlLevel <= MAX) {
        sessionStorage.setItem(KEY, urlLevel);
        return urlLevel;
      }
      const n = Number(sessionStorage.getItem(KEY));
      return Number.isInteger(n) && n >= MIN && n <= MAX ? n : DEFAULT;
    } catch (e) {
      return DEFAULT;
    }
  }

  function render(n) {
    document.documentElement.dataset.panic = n;
    document.querySelectorAll('input[name="panic-level"]')
      .forEach(function (r) {
        r.checked = Number(r.value) === n;
      });
    document.querySelectorAll("[data-panic-level-text]")
      .forEach(function (el) {
        el.textContent = "Level " + n;
      });
    document.querySelectorAll("[data-panic-level-message]")
      .forEach(function (el) {
        el.textContent = messageFor(n);
      });
  }

  function set(n) {
    n = Math.min(MAX, Math.max(MIN, Number(n) || DEFAULT));
    try {
      sessionStorage.setItem(KEY, n);
    } catch (e) {}
    render(n);
    document.dispatchEvent(new CustomEvent("paniclevelchange", { detail: { level: n } }));
  }

  document.addEventListener("change", function (e) {
    if (e.target && e.target.name === "panic-level") {
      set(e.target.value);
    }
  });

  window.PanicLevel = { get: get, set: set, messageFor: messageFor };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      render(get());
    });
  } else {
    render(get());
  }
})();
