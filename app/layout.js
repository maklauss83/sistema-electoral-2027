import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'Sistema Electoral 2027',
  description: 'Gestión de estructura electoral',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-gray-50 antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
