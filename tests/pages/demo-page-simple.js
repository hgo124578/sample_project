/**
 * Page Object - シンプルなオブジェクトリテラル
 * 最もシンプルで軽量なアプローチ
 */

const demoPage = {
  // セレクタ定義用のヘルパー
  selectors: {
    counter: (page) => page.locator('text=/^\\d+$/').first(),
    incrementButton: (page) => page.getByRole('button', { name: '+1' }),
    resetButton: (page) => page.getByRole('button', { name: 'リセット' }),
    colorButton: (page, color) => page.getByRole('button', { name: color, exact: true }),
  },

  // ページ操作
  goto: async (page) => {
    await page.goto('/demo')
  },

  incrementCounter: async (page, times = 1) => {
    const button = demoPage.selectors.incrementButton(page)
    for (let i = 0; i < times; i++) {
      await button.click()
    }
  },

  resetCounter: async (page) => {
    await demoPage.selectors.resetButton(page).click()
  },

  selectColor: async (page, color) => {
    await demoPage.selectors.colorButton(page, color).click()
  },

  getCounterValue: async (page) => {
    return await demoPage.selectors.counter(page).textContent()
  },
}

module.exports = { demoPage }
