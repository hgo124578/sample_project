const { test, expect } = require('@playwright/test')

/**
 * より良いテストの書き方の例
 * - テストの独立性
 * - 明確なセクション分け
 * - ヘルパー関数の使用
 */

test.describe('デモページ - カウンター機能', () => {
  // 各テストの前に実行される（テストの独立性を保つ）
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
  })

  test('初期値は0である', async ({ page }) => {
    // Arrange（準備）- beforeEachで実行済み

    // Act（実行）- なし（初期状態を確認）

    // Assert（検証）
    const counter = page.locator('text=/^\\d+$/').first()
    await expect(counter).toHaveText('0')
  })

  test('インクリメントボタンでカウンターが増加する', async ({ page }) => {
    // Arrange
    const counter = page.locator('text=/^\\d+$/').first()
    const incrementButton = page.getByRole('button', { name: '+1' })

    // Act
    await incrementButton.click()

    // Assert
    await expect(counter).toHaveText('1')
  })

  test('複数回クリックで正しく累積される', async ({ page }) => {
    // Arrange
    const counter = page.locator('text=/^\\d+$/').first()
    const incrementButton = page.getByRole('button', { name: '+1' })

    // Act
    await incrementButton.click()
    await incrementButton.click()
    await incrementButton.click()

    // Assert
    await expect(counter).toHaveText('3')
  })

  test('リセットボタンでカウンターが0に戻る', async ({ page }) => {
    // Arrange
    const counter = page.locator('text=/^\\d+$/').first()
    const incrementButton = page.getByRole('button', { name: '+1' })
    const resetButton = page.getByRole('button', { name: 'リセット' })

    // カウンターを5にする
    for (let i = 0; i < 5; i++) {
      await incrementButton.click()
    }
    await expect(counter).toHaveText('5')

    // Act
    await resetButton.click()

    // Assert
    await expect(counter).toHaveText('0')
  })
})

test.describe('デモページ - シャローローティング', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo')
  })

  test('カラー選択でURLパラメータが変更される', async ({ page }) => {
    // Arrange
    const redButton = page.getByRole('button', { name: '赤', exact: true })

    // Act
    await redButton.click()

    // Assert
    await expect(page).toHaveURL(/color=red/)
  })

  test('タブ切り替えでURLパラメータが変更される', async ({ page }) => {
    // Arrange
    const settingsTab = page.getByRole('button', { name: '設定' })

    // Act
    await settingsTab.click()

    // Assert
    await expect(page).toHaveURL(/tab=settings/)
    await expect(page.getByText('URLに ?tab=settings が追加されました')).toBeVisible()
  })

  test('URLパラメータ変更後もステートが保持される（シャローローティング）', async ({ page }) => {
    // Arrange
    const counter = page.locator('text=/^\\d+$/').first()
    const incrementButton = page.getByRole('button', { name: '+1' })
    const redButton = page.getByRole('button', { name: '赤', exact: true })
    const settingsTab = page.getByRole('button', { name: '設定' })

    // カウンターを3にする
    await incrementButton.click()
    await incrementButton.click()
    await incrementButton.click()
    await expect(counter).toHaveText('3')

    // Act & Assert 1: 色変更後もカウンター保持
    await redButton.click()
    await expect(counter).toHaveText('3')
    await expect(page).toHaveURL(/color=red/)

    // Act & Assert 2: タブ変更後もカウンター保持
    await settingsTab.click()
    await expect(counter).toHaveText('3')
    await expect(page).toHaveURL(/tab=settings/)
  })
})
