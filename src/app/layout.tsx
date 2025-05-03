import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css' // Add this import

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

// Use the correct path to your font
const giaza = localFont({
  src: '../../public/fonts/Giaza.otf',
  variable: '--font-giaza',
})

export const metadata = {
  title: 'Kiva',
  description: 'Be the Brand.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${giaza.variable}`}>
      <body className="bg-background text-foreground font-sans">{children}</body>
      </html>
  )
}
