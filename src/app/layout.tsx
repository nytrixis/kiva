import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '@/providers/auth-provider'
import { ToastProvider } from '@/hooks/use-toast'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${giaza.variable}`}>
      <head>
        {/* Google Translate script should be added using Next.js Script component */}
      </head>
      <body className="bg-background text-foreground">
        <AuthProvider>
          <ToastProvider>
        {/* This div is needed for Google Translate - moved to body */}
        <div id="google_translate_element" className="hidden"></div>
        {children}
        
        {/* Add Google Translate script properly using Next.js Script component */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,bn,te,mr,ta,ur,gu,kn,ml,pa',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}