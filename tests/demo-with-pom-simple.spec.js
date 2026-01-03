const { test, expect } = require('@playwright/test')
const { demoPage } = require('./pages/demo-page-simple')

/**
 * シンプルなオブジェクトリテラルのPage Objectを使用した例
 */

test.describe('デモページ - POM（シンプル）', () => {
  test('カウンターを増やす', async ({ page }) => {
    // Arrange
    await demoPage.goto(page)

    // Act
    await demoPage.incrementCounter(page, 3)

    // Assert
    const counter = demoPage.selectors.counter(page)
    await expect(counter).toHaveText('3')
  })

  test('カラー選択後もカウンターが保持される', async ({ page }) => {
    // Arrange
    await demoPage.goto(page)
    await demoPage.incrementCounter(page, 5)

    const counter = demoPage.selectors.counter(page)
    await expect(counter).toHaveText('5')

    // Act
    await demoPage.selectColor(page, '赤')

    // Assert
    await expect(counter).toHaveText('5')
    await expect(page).toHaveURL(/color=red/)
  })

  test('リセット機能', async ({ page }) => {
    // Arrange
    await demoPage.goto(page)
    await demoPage.incrementCounter(page, 10)

    // Act
    await demoPage.resetCounter(page)

    // Assert
    const counter = demoPage.selectors.counter(page)
    await expect(counter).toHaveText('0')
  })
})
