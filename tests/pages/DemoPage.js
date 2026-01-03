/**
 * Page Object Model の例
 * ページの操作をクラスにカプセル化
 */
class DemoPage {
  constructor(page) {
    this.page = page

    // セレクタを一箇所で管理
    this.counter = page.locator('text=/^\\d+$/').first()
    this.incrementButton = page.getByRole('button', { name: '+1' })
    this.resetButton = page.getByRole('button', { name: 'リセット' })
    this.redButton = page.getByRole('button', { name: '赤', exact: true })
    this.greenButton = page.getByRole('button', { name: '緑', exact: true })
    this.blueButton = page.getByRole('button', { name: '青', exact: true })
  }

  // ページ固有の操作をメソッドにする
  async goto() {
    await this.page.goto('/demo')
  }

  async incrementCounter(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.incrementButton.click()
    }
  }

  async resetCounter() {
    await this.resetButton.click()
  }

  async selectColor(color) {
    const colorMap = {
      '赤': this.redButton,
      '緑': this.greenButton,
      '青': this.blueButton,
    }
    await colorMap[color].click()
  }

  async getCounterValue() {
    return await this.counter.textContent()
  }

  async expectCounterToBe(value) {
    await this.page.expect(this.counter).toHaveText(value.toString())
  }
}

module.exports = { DemoPage }
