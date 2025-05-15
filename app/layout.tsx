import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Nav'

export const metadata: Metadata = {
  title: 'RallyKat',
  description: 'Track your rally times and climb the leaderboards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="body">
        <div className="app">
          <Navbar />  
          {children}
        </div>
      </body>
    </html>
  )
} 