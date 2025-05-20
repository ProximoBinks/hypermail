import { useState, useEffect, useRef } from 'react'
import { getAuthCredentials } from '../lib/auth'
import dynamic from 'next/dynamic'
import { useTheme } from '../lib/ThemeContext'

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="loading">Loading editor...</div>
})

// Import Quill styles
import 'react-quill/dist/quill.snow.css'

export default function EmailForm() {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSending, setIsSending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const { theme } = useTheme()
  const dropdownRef = useRef(null)

  // Signature templates
  const signatures = {
    elliot: `
      <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc;">
        <p><strong>Elliot Koh</strong><br>
        Co-Founder & Developer · HyperStake<br>
        🌐 <a href="https://hyperstake.bet" target="_blank">hyperstake.bet</a><br>
        📩 <a href="mailto:contact@hyperstake.bet">contact@hyperstake.bet</a></p>
      </div>
    `,
    james: `
      <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc;">
        <p><strong>James Lim</strong><br>
        Co-Founder & Developer · HyperStake<br>
        🌐 <a href="https://hyperstake.bet" target="_blank">hyperstake.bet</a><br>
        📩 <a href="mailto:contact@hyperstake.bet">contact@hyperstake.bet</a></p>
      </div>
    `
  }

  // Quill editor modules and formats configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  }
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link'
  ]

  // Set mounted state once component mounts
  useEffect(() => {
    setMounted(true)
    
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const toggleDropdown = () => {
    setShowDropdown(prevState => !prevState)
  }

  const addSignature = (type) => {
    setMessage(currentMessage => {
      // Only add signature if it's not already there (check for both signatures)
      if (!currentMessage.includes(signatures.elliot.trim()) && 
          !currentMessage.includes(signatures.james.trim())) {
        return currentMessage + signatures[type]
      }
      // If a different signature is already there, replace it
      if (type === 'elliot' && currentMessage.includes(signatures.james.trim())) {
        return currentMessage.replace(signatures.james.trim(), signatures.elliot.trim())
      }
      if (type === 'james' && currentMessage.includes(signatures.elliot.trim())) {
        return currentMessage.replace(signatures.elliot.trim(), signatures.james.trim())
      }
      return currentMessage
    })
    setShowDropdown(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Reset status
    setStatus({ type: '', message: '' })
    
    // Validate fields
    if (!to || !subject || !message) {
      setStatus({
        type: 'error',
        message: 'All fields are required'
      })
      return
    }

    if (!validateEmail(to)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address'
      })
      return
    }

    setIsSending(true)

    try {
      // Get auth credentials from cookie
      const credentials = getAuthCredentials()
      if (!credentials) {
        throw new Error('Not authenticated')
      }

      // Make API request to send email
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          message,
          username: credentials.username,
          password: credentials.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email')
      }

      // Success! Clear form and show success message
      setTo('')
      setSubject('')
      setMessage('')
      setStatus({
        type: 'success',
        message: 'Email sent successfully!'
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'An error occurred while sending the email'
      })
    } finally {
      setIsSending(false)
    }
  }

  // Don't render React Quill until component has mounted
  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className={`shadow-md rounded px-8 pt-6 pb-8 mb-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <h2 className="text-xl font-bold mb-6">Send Email</h2>
        
        {status.message && (
          <div 
            className={`mb-4 p-4 rounded-md ${
              status.type === 'error' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="to">
            To:
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-700'
            }`}
            id="to"
            type="email"
            placeholder="recipient@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="subject">
            Subject:
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-700'
            }`}
            id="subject"
            type="text"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className={`block text-sm font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="message">
              Message:
            </label>
            <div className="signature-dropdown" ref={dropdownRef}>
              <button
                type="button"
                onClick={toggleDropdown}
                className={`text-sm py-1 px-3 rounded text-white ${theme === 'dark' ? 'bg-theme-dark hover:bg-dark-accent' : 'bg-[#3aa6f5] hover:bg-light-accent'}`}
              >
                Add Signature ▼
              </button>
              <div className={`signature-dropdown-content ${showDropdown ? 'show' : ''} ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                  type="button"
                  onClick={() => addSignature('elliot')}
                  className={`text-sm ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Elliot's Signature
                </button>
                <button
                  type="button"
                  onClick={() => addSignature('james')}
                  className={`text-sm ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  James's Signature
                </button>
              </div>
            </div>
          </div>
          <div className={`${theme === 'dark' ? 'quill-dark' : ''}`}>
            <ReactQuill
              theme="snow"
              value={message}
              onChange={setMessage}
              modules={modules}
              formats={formats}
              placeholder="Your message here..."
              className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'} rounded shadow`}
            />
          </div>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Use the toolbar to format your message
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 text-white ${
              theme === 'dark' 
                ? 'bg-theme-dark hover:bg-dark-accent' 
                : 'bg-[#3aa6f5] hover:bg-light-accent'
            }`}
            type="submit"
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>
    </div>
  )
} 