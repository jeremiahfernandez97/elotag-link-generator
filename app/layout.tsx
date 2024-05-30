import { Providers } from './providers'

type RootLayoutProps = {
  children: React.ReactNode
}

export const metadata = {
  title: 'Elo Tag',
  description: 'Link Generator',
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
