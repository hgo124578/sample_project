const { test, expect } = require('@playwright/test')

test.describe('ホームページのテスト', () => {
  test('ホームページが正しく表示される', async ({ page }) => {
    // ホームページにアクセス
    await page.goto('/')

    // タイトルに「Next.js」が含まれることを確認
    await expect(page).toHaveTitle(/Next.js/)

    // 「Hello World!」という見出しが表示されることを確認
    const heading = page.getByRole('heading', { name: 'Hello World!' })
    await expect(heading).toBeVisible()

    // 説明文が表示されることを確認
    const description = page.getByText('Next.js v15 基礎学習用プロジェクトへようこそ')
    await expect(description).toBeVisible()
  })

  test('アバウトページへのリンクが機能する', async ({ page }) => {
    await page.goto('/')

    // 「アバウトページへ」ボタンをクリック
    await page.getByRole('link', { name: 'アバウトページへ' }).click()

    // URLが/aboutに変わることを確認
    await expect(page).toHaveURL('/about')

    // アバウトページの見出しが表示されることを確認
    const heading = page.getByRole('heading', { name: 'アバウトページ' })
    await expect(heading).toBeVisible()
  })

  test('デモページへのリンクが機能する', async ({ page }) => {
    await page.goto('/')

    // 「デモページへ」ボタンをクリック
    await page.getByRole('link', { name: /デモページへ/ }).click()

    // URLが/demoに変わることを確認
    await expect(page).toHaveURL('/demo')

    // デモページの見出しが表示されることを確認
    const heading = page.getByRole('heading', { name: 'シャローローティング デモ' })
    await expect(heading).toBeVisible()
  })
})
