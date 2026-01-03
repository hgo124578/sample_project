const { test, expect } = require('@playwright/test')
const { DemoPage } = require('./pages/DemoPage')

/**
 * Page Object Model を使用したテストの例
 */

test.describe('デモページ - POM使用', () => {
  let demoPage

  test.beforeEach(async ({ page }) => {
    demoPage = new DemoPage(page)
    await demoPage.goto()
  })

  test('カウンターを増やす', async ({ page }) => {
    // Arrange
    // (beforeEachで準備済み)

    // Act
    await demoPage.incrementCounter(3)

    // Assert
    await expect(demoPage.counter).toHaveText('3')
  })

  test('カラー選択後もカウンターが保持される', async ({ page }) => {
    // Arrange
    await demoPage.incrementCounter(5)
    await expect(demoPage.counter).toHaveText('5')

    // Act
    await demoPage.selectColor('赤')

    // Assert
    await expect(demoPage.counter).toHaveText('5')
    await expect(page).toHaveURL(/color=red/)
  })

  test('リセット機能', async ({ page }) => {
    // Arrange
    await demoPage.incrementCounter(10)
    await expect(demoPage.counter).toHaveText('10')

    // Act
    await demoPage.resetCounter()

    // Assert
    await expect(demoPage.counter).toHaveText('0')
  })
})
