/**
 * Page Object Model - 関数スタイル
 * Playwright公式が推奨するアプローチ
 */

function createDemoPage(page) {
  // セレクタを定義
  const counter = page.locator('text=/^\\d+$/').first()
  const incrementButton = page.getByRole('button', { name: '+1' })
  const resetButton = page.getByRole('button', { name: 'リセット' })
  const redButton = page.getByRole('button', { name: '赤', exact: true })
  const greenButton = page.getByRole('button', { name: '緑', exact: true })
  const blueButton = page.getByRole('button', { name: '青', exact: true })

  // 操作メソッドを返す
  return {
    // セレクタを公開（テストで直接アクセス可能）
    counter,
    incrementButton,
    resetButton,

    // ページ操作
    goto: async () => {
      await page.goto('/demo')
    },

    incrementCounter: async (times = 1) => {
      for (let i = 0; i < times; i++) {
        await incrementButton.click()
      }
    },

    resetCounter: async () => {
      await resetButton.click()
    },

    selectColor: async (color) => {
      const colorMap = {
        '赤': redButton,
        '緑': greenButton,
        '青': blueButton,
      }
      await colorMap[color].click()
    },

    getCounterValue: async () => {
      return await counter.textContent()
    },
  }
}

module.exports = { createDemoPage }
