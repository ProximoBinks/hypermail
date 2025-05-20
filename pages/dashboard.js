import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import EmailForm from '../components/EmailForm'
import { isAuthenticated, logout } from '../lib/auth'
import { useTheme } from '../lib/ThemeContext'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [logoSrc, setLogoSrc] = useState('/logo-light.png') // Default fallback
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.replace('/login')
    }
  }, [router])

  // Update logo source when theme changes
  useEffect(() => {
    setLogoSrc(theme === 'dark' ? '/logo-dark.png' : '/logo-light.png')
  }, [theme])

  // Handle logout button click
  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Don't render anything until we've checked authentication
  if (!mounted) return null

  return (
    <>
      <Head>
        <title>Dashboard - HyperMail</title>
      </Head>

      <div className={`w-full flex-grow ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">HyperMail Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-white ${
                theme === 'dark' 
                  ? 'bg-theme-dark hover:bg-dark-accent' 
                  : 'bg-[#3aa6f5] hover:bg-light-accent'
              }`}
            >
              Logout
            </button>
          </div>

          <div className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
            <EmailForm />
          </div>
        </div>
      </div>
    </>
  )
} 