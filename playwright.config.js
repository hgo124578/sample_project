const { defineConfig, devices } = require('@playwright/test')

// 本番モードで計測するかどうか（環境変数で切り替え可能）
// true: npm run build && npm run start（本番ビルド、キャッシュなし）
// false: npm run dev（開発サーバー、ホットリロード有効）
const USE_PRODUCTION_BUILD = process.env.USE_DEV_SERVER !== 'true'

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: USE_PRODUCTION_BUILD
    ? {
        // 本番ビルド: より正確なパフォーマンス計測が可能
        command: 'npm run build && npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000, // ビルドに時間がかかるため長めに設定
      }
    : {
        // 開発サーバー: 高速な起動、ホットリロード対応
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
      },
})
