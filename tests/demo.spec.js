const { test, expect } = require('@playwright/test')

test.describe('デモページのテスト', () => {
  test('カウンター機能が動作する', async ({ page }) => {
    await page.goto('/demo')

    // 初期値が0であることを確認
    const counter = page.locator('text=/^\\d+$/').first()
    await expect(counter).toHaveText('0')

    // +1ボタンをクリック
    await page.getByRole('button', { name: '+1' }).click()

    // カウンターが1になることを確認
    await expect(counter).toHaveText('1')

    // もう一度クリック
    await page.getByRole('button', { name: '+1' }).click()
    await expect(counter).toHaveText('2')

    // リセットボタンをクリック
    await page.getByRole('button', { name: 'リセット' }).click()
    await expect(counter).toHaveText('0')
  })

  test('カラー選択でURLパラメータが変更される', async ({ page }) => {
    await page.goto('/demo')

    // 赤ボタンをクリック
    await page.getByRole('button', { name: '赤', exact: true }).click()

    // URLにcolor=redが追加されることを確認
    await expect(page).toHaveURL(/color=red/)

    // 緑ボタンをクリック
    await page.getByRole('button', { name: '緑', exact: true }).click()

    // URLがcolor=greenに変わることを確認
    await expect(page).toHaveURL(/color=green/)
  })

  test('タブ切り替えでURLパラメータが変更される', async ({ page }) => {
    await page.goto('/demo')

    // 設定タブをクリック
    await page.getByRole('button', { name: '設定' }).click()

    // URLにtab=settingsが追加されることを確認
    await expect(page).toHaveURL(/tab=settings/)

    // 設定タブのコンテンツが表示されることを確認
    await expect(page.getByText('URLに ?tab=settings が追加されました')).toBeVisible()

    // 履歴タブをクリック
    await page.getByRole('button', { name: '履歴' }).click()

    // URLがtab=historyに変わることを確認
    await expect(page).toHaveURL(/tab=history/)
  })

  test('カウンターの値がURLパラメータ変更後も保持される', async ({ page }) => {
    await page.goto('/demo')

    // カウンターを3にする
    const counter = page.locator('text=/^\\d+$/').first()
    await page.getByRole('button', { name: '+1' }).click()
    await page.getByRole('button', { name: '+1' }).click()
    await page.getByRole('button', { name: '+1' }).click()
    await expect(counter).toHaveText('3')

    // 色を変更
    await page.getByRole('button', { name: '赤', exact: true }).click()

    // カウンターの値が保持されていることを確認
    await expect(counter).toHaveText('3')

    // タブを変更
    await page.getByRole('button', { name: '設定' }).click()

    // カウンターの値が保持されていることを確認
    await expect(counter).toHaveText('3')
  })
})
