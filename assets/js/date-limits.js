/*
 * Giới hạn mọi ô chọn ngày (input[type=date]) trên site:
 *   min = hôm nay + prepDays (mặc định 1), max = hôm nay + maxAdvanceDays (mặc định 60 ~ 2 tháng).
 * Trình duyệt sẽ chặn gửi form với ngày ngoài khoảng (vd 5555-05-05) và làm mờ ngày đó trong lịch.
 * Giá trị lấy từ data/survival_kit/schedule-rules.json (gắn vào thẻ script bởi footer.html).
 * Các wizard Schedule/Send vẫn tự kiểm tra lại trong rescue-common.js.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var prepDays = Number(script && script.getAttribute('data-prep-days')) || 1;
  var maxDays = Number(script && script.getAttribute('data-max-advance-days')) || 60;

  // Ngày theo giờ Việt Nam (UTC+7), dạng YYYY-MM-DD.
  function isoVN(offsetDays) {
    var d = new Date(Date.now() + 7 * 3600 * 1000);
    d.setUTCDate(d.getUTCDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  function apply(root) {
    var min = isoVN(prepDays);
    var max = isoVN(maxDays);
    (root || document).querySelectorAll('input[type="date"]').forEach(function (input) {
      if (!input.hasAttribute('data-no-date-limit')) {
        input.min = min;
        input.max = max;
        if (!input.title) input.title = 'Chọn ngày trong vòng ' + maxDays + ' ngày tới';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(); });
  } else {
    apply();
  }

  window.SkDateLimits = { apply: apply, min: function () { return isoVN(prepDays); }, max: function () { return isoVN(maxDays); } };
})();
