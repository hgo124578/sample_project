import './globals.css'

export const metadata = {
  title: 'Next.js v15 Sample Project',
  description: 'Hello World学習用プロジェクト',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
