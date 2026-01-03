const { test, expect } = require('@playwright/test')
const { createDemoPage } = require('./pages/DemoPageFunction')

/**
 * 関数スタイルのPage Object Modelを使用した例
 */

test.describe('デモページ - POM（関数スタイル）', () => {
  test('カウンターを増やす', async ({ page }) => {
    // Page Objectを作成
    const demoPage = createDemoPage(page)

    // Arrange
    await demoPage.goto()

    // Act
    await demoPage.incrementCounter(3)

    // Assert
    await expect(demoPage.counter).toHaveText('3')

    // Act
    await demoPage.resetCounter()

    // Assert
    await expect(demoPage.counter).toHaveText('0')
  })

  test('カラー選択後もカウンターが保持される', async ({ page }) => {
    const demoPage = createDemoPage(page)

    // Arrange
    await demoPage.goto()
    await demoPage.incrementCounter(5)
    await expect(demoPage.counter).toHaveText('5')

    // Act
    await demoPage.selectColor('赤')

    // Assert
    await expect(demoPage.counter).toHaveText('5')
    await expect(page).toHaveURL(/color=red/)
  })

  test('リセット機能', async ({ page }) => {
    const demoPage = createDemoPage(page)

    // Arrange
    await demoPage.goto()
    await demoPage.incrementCounter(10)

    // Act
    await demoPage.resetCounter()

    // Assert
    await expect(demoPage.counter).toHaveText('0')
  })
})
