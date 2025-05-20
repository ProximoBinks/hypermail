import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { isAuthenticated } from '../lib/auth'
import { useTheme } from '../lib/ThemeContext'

export default function Home() {
  const router = useRouter()
  const { theme } = useTheme()
  const [logoSrc, setLogoSrc] = useState('/logo-light.png') // Default fallback

  useEffect(() => {
    // Redirect to dashboard if authenticated, otherwise to login page
    if (isAuthenticated()) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])

  // Update logo source when theme changes
  useEffect(() => {
    setLogoSrc(theme === 'dark' ? '/logo-dark.png' : '/logo-light.png')
  }, [theme])

  return (
    <>
      <Head>
        <title>HyperMail - Email Sender</title>
      </Head>

      <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}`}>
        <div className="text-center">
          <img 
            src={logoSrc}
            alt="HyperMail Logo" 
            className="h-16 mx-auto mb-4"
          />
          <h2 className={`text-xl mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Loading...</h2>
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${theme === 'dark' ? 'border-purple-500' : 'border-blue-500'}`}></div>
        </div>
      </div>
    </>
  )
}