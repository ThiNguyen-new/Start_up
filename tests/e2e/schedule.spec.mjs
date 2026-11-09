// QA_PLAN mục 5: Schedule Rescue (S1–S7)
import { readFile } from 'node:fs/promises';
import { test, expect, freshSession, isoDate } from './helpers.mjs';

const next = (page) => page.locator('.js-btn-next-step:visible').first();
const step = (page, n) => page.locator(`.js-rescue-step[data-step="${n}"]`);

async function fillStep2(page, deadline = isoDate(6), receive = isoDate(5)) {
  await page.locator('.js-input-deadline-date').fill(deadline);
  await page.locator('.js-input-receive-date').fill(receive);
  const slot = page.locator('.js-input-slot').first();
  if ((await slot.getAttribute('type')) === 'radio') await slot.check({ force: true });
  else await slot.selectOption({ index: 1 }).catch(() => {});
}

async function fillStep3(page) {
  await page.locator('.js-input-name').fill('Nguyễn Văn Demo');
  await page.locator('.js-input-phone').fill('0987654321');
  await page.locator('.js-input-address').fill('123 Đường Mẫu, Phường Sài Gòn, TP. Hồ Chí Minh');
  await page.locator('#rescue-agree-terms').check({ force: true });
}

async function toReview(page) {
  await expect(step(page, 1)).toBeVisible();
  await next(page).click();
  await fillStep2(page);
  await next(page).click();
  await expect(step(page, 3)).toBeVisible();
  await fillStep3(page);
  await next(page).click();
  await expect(step(page, 4)).toBeVisible();
}

test.describe('S — Schedule Rescue', () => {
  test.beforeEach(async ({ page }) => { await freshSession(page, 'schedule-rescue/'); });

  test('[S1] Nhận ngày từ URL', async ({ page }) => {
    await page.goto(`schedule-rescue/?deadline=${isoDate(6)}&receive=${isoDate(5)}`);
    await expect(page.locator('.js-input-deadline-date')).toHaveValue(isoDate(6));
    await expect(page.locator('.js-input-receive-date')).toHaveValue(isoDate(5));
  });

  test('[S2] Bước 1 có kit và đi tiếp được', async ({ page }) => {
    await expect(step(page, 1)).toContainText(/\d/);
    await next(page).click();
    await expect(step(page, 2)).toBeVisible();
  });

  test('[S3] Bước 2: báo lỗi ngày sai; nút "Nhận trước 1/2 ngày"', async ({ page }) => {
    await next(page).click();
    await next(page).click();
    await expect(page.locator('.js-error-deadline')).toBeVisible();
    await page.locator('.js-input-deadline-date').fill(isoDate(6));
    await page.locator('.js-input-receive-date').fill(isoDate(10)); // sau deadline
    await next(page).click();
    await expect(page.locator('.js-error-receive')).toBeVisible();
    await page.locator('.js-btn-quick-date[data-offset="1"]').click();
    await expect(page.locator('.js-input-receive-date')).toHaveValue(isoDate(5));
    await page.locator('.js-btn-quick-date[data-offset="2"]').click();
    await expect(page.locator('.js-input-receive-date')).toHaveValue(isoDate(4));
    await page.locator('.js-input-deadline-date').fill(isoDate(-1)); // quá khứ
    await page.locator('.js-input-receive-date').fill(isoDate(-2));
    await next(page).click();
    await expect(page.locator('.js-error-receive')).toBeVisible();
    await expect(step(page, 2)).toBeVisible();
  });

  test('[S3b] Chặn ngày quá xa (QA web-error 1.1: tối đa ~2 tháng, vd 5555-05-05)', async ({ page }) => {
    await expect(page.locator('.js-input-deadline-date')).toHaveAttribute('max', isoDate(60));
    await expect(page.locator('.js-input-deadline-date')).toHaveAttribute('min', isoDate(1));
    await next(page).click();
    await page.locator('.js-input-deadline-date').fill('5555-05-05');
    await page.locator('.js-input-receive-date').fill('5555-05-04');
    await next(page).click();
    await expect(page.locator('.js-error-receive')).toContainText('tối đa 60 ngày');
    await expect(step(page, 2)).toBeVisible();
    await fillStep2(page, isoDate(61), isoDate(60)); // ngày nhận vẫn trong 60 nhưng deadline vượt
    await next(page).click();
    await expect(page.locator('.js-error-receive')).toContainText('tối đa 60 ngày');
    await fillStep2(page, isoDate(60), isoDate(59)); // đúng giới hạn: hợp lệ
    await next(page).click();
    await expect(step(page, 3)).toBeVisible();
  });

  test('[S3c] Form "Lên lịch" ở trang chủ không gửi được ngày 5555-05-05', async ({ page }) => {
    await page.goto('');
    const d = page.locator('#deadline');
    await expect(d).toHaveAttribute('max', isoDate(60));
    await d.fill('5555-05-05');
    await page.locator('#receive').fill(isoDate(5));
    await page.locator('#schedule button[type="submit"]').click();
    await expect(page).not.toHaveURL(/schedule-rescue/);
    expect(await d.evaluate((el) => el.validity.rangeOverflow)).toBe(true);
  });

  test('[S4] Bước 3: validate tên, SĐT, địa chỉ, cam kết', async ({ page }) => {
    await next(page).click();
    await fillStep2(page);
    await next(page).click();
    await next(page).click();
    for (const e of ['.js-error-name', '.js-error-phone', '.js-error-address', '.js-error-agree']) {
      await expect(page.locator(e), e).toBeVisible();
    }
    await fillStep3(page);
    await page.locator('.js-input-phone').fill('12345');
    await next(page).click();
    await expect(page.locator('.js-error-phone')).toBeVisible();
    await expect(step(page, 3)).toBeVisible();
  });

  test('[S5] Sửa bước giữ dữ liệu', async ({ page }) => {
    await toReview(page);
    await page.locator('.js-rescue-review-view .js-btn-edit-step[data-target-step="3"]').click();
    await expect(step(page, 3)).toBeVisible();
    await expect(page.locator('.js-input-name')).toHaveValue('Nguyễn Văn Demo');
  });

  test('[S6] Xác nhận: màn thành công và giỏ có lịch giao', async ({ page }) => {
    await toReview(page);
    await expect(page.locator('.js-review-contact')).toContainText('Nguyễn Văn Demo');
    await page.locator('.js-btn-confirm-schedule').click();
    await expect(page.locator('.js-rescue-success-view')).toBeVisible();
    await expect(page.locator('.js-rescue-success-view')).toContainText('Đặt Lịch Tiếp Sức Thành Công');
    await expect(page.locator('.js-success-order-code')).not.toBeEmpty();
    await page.goto('cart-demo/');
    await expect(page.locator('.js-cart-schedule-box')).toBeVisible();
  });

  test('[S7] Tải file .ics đúng ngày nhận', async ({ page }) => {
    await toReview(page);
    await page.locator('.js-btn-confirm-schedule').click();
    const code = (await page.locator('.js-success-order-code').textContent()).trim();
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.js-btn-download-ics').click()]);
    expect(download.suggestedFilename()).toBe(`${code}.ics`);
    const ics = await readFile(await download.path(), 'utf8');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain(isoDate(5).replace(/-/g, ''));
  });
});
