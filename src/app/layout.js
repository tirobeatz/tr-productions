import './globals.css'
import Cursor from './components/Cursor'

export const metadata = {
  title: 'TR Productions | Music Producer in Trier, Germany',
  description: 'Professional beats, mixing & mastering for Hip-Hop, Rap, and R&B artists.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Cursor />
      </body>
    </html>
  )
}