import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { login, isAuthenticated } from '../lib/auth'
import { useTheme } from '../lib/ThemeContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoSrc, setLogoSrc] = useState('/logo-light.png') // Default fallback
  const router = useRouter()
  const { theme } = useTheme()

  // Check if already authenticated on mount
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard')
    }
  }, [router])

  // Update logo source when theme changes
  useEffect(() => {
    setLogoSrc(theme === 'dark' ? '/logo-dark.png' : '/logo-light.png')
  }, [theme])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple validation
    if (!username || !password) {
      setError('Username and password are required')
      setLoading(false)
      return
    }

    // Attempt login
    const success = login(username, password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Invalid username or password')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - HyperMail</title>
      </Head>

      <div className={`flex items-center justify-center w-full flex-grow ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}`}>
        <div className={`w-full max-w-md p-8 space-y-8 rounded-lg shadow-md mx-auto ${
          theme === 'dark' 
            ? 'bg-gray-800 text-white' 
            : 'bg-white text-gray-900'
        }`}>
          <div className="text-center">
            <img 
              src={logoSrc}
              alt="HyperMail Logo" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold">HyperMail</h1>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <div className={`p-4 text-sm rounded-md ${
              theme === 'dark' 
                ? 'bg-red-900 text-red-200' 
                : 'bg-red-100 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className={`block w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={`block w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  theme === 'dark'
                    ? 'bg-theme-dark hover:bg-dark-accent focus:ring-purple-500'
                    : 'bg-theme-light hover:bg-light-accent focus:ring-blue-500'
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
} 