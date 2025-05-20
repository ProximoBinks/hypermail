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
  const [senderName, setSenderName] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [emailDetails, setEmailDetails] = useState(null)
  const [emailHistory, setEmailHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const { theme } = useTheme()
  const dropdownRef = useRef(null)
  const historyRef = useRef(null)

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

  // Load email history from localStorage on component mount
  useEffect(() => {
    setMounted(true)
    
    // Try to load email history from localStorage
    try {
      const savedHistory = localStorage.getItem('emailHistory')
      if (savedHistory) {
        setEmailHistory(JSON.parse(savedHistory))
      }
    } catch (err) {
      console.error('Error loading email history:', err)
    }
    
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false)
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
    // Set the sender name based on signature type
    setSenderName(type === 'elliot' ? 'Elliot Koh' : 'James Lim')
    
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
    
    // Reset status and details
    setStatus({ type: '', message: '' })
    setEmailDetails(null)
    
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
    console.log('🚀 Preparing to send email...')

    try {
      // Get auth credentials from cookie
      const credentials = getAuthCredentials()
      if (!credentials) {
        throw new Error('Not authenticated')
      }

      console.log(`📧 Sending email to: ${to}`)
      const sendStartTime = Date.now()
      
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
          password: credentials.password,
          senderName
        }),
      })

      const data = await response.json()
      const clientProcessingTime = Date.now() - sendStartTime
      
      console.log(`📧 API response received in ${clientProcessingTime}ms:`, data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email')
      }

      // Success! Clear form and show success message
      setTo('')
      setSubject('')
      setMessage('')
      setSenderName('')
      setStatus({
        type: 'success',
        message: 'Email sent successfully!'
      })
      
      // Store email details for display
      const details = {
        ...data.details,
        clientProcessingTime,
        timestamp: new Date().toISOString(),
        subject: subject
      }
      
      setEmailDetails(details)
      
      // Add to email history
      const updatedHistory = [details, ...emailHistory].slice(0, 10) // Keep last 10 emails
      setEmailHistory(updatedHistory)
      
      // Save to localStorage
      try {
        localStorage.setItem('emailHistory', JSON.stringify(updatedHistory))
      } catch (err) {
        console.error('Error saving email history:', err)
      }
      
      console.log('✅ Email sent successfully!')
    } catch (error) {
      console.error('❌ Error sending email:', error)
      setStatus({
        type: 'error',
        message: error.message || 'An error occurred while sending the email'
      })
    } finally {
      setIsSending(false)
    }
  }

  const toggleHistory = () => {
    setShowHistory(prev => !prev)
  }

  const clearHistory = () => {
    setEmailHistory([])
    localStorage.removeItem('emailHistory')
  }

  // Don't render React Quill until component has mounted
  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className={`shadow-md rounded px-8 pt-6 pb-8 mb-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Send Email</h2>
          <div className="relative" ref={historyRef}>
            <button
              type="button"
              onClick={toggleHistory}
              className={`text-sm py-1 px-3 rounded text-white ${theme === 'dark' ? 'bg-theme-dark hover:bg-dark-accent' : 'bg-[#3aa6f5] hover:bg-light-accent'}`}
            >
              History ({emailHistory.length}) ▼
            </button>
            {showHistory && emailHistory.length > 0 && (
              <div className={`absolute right-0 mt-2 w-80 shadow-lg rounded-md z-50 p-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">Recent Emails</h3>
                  <button 
                    type="button" 
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear History
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {emailHistory.map((email, index) => (
                    <div 
                      key={index} 
                      className={`p-2 mb-1 text-sm rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      <div className="font-semibold truncate">{email.subject || 'No Subject'}</div>
                      <div className="text-xs truncate">To: {email.to}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(email.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {status.message && (
          <div 
            className={`mb-4 p-4 rounded-md ${
              status.type === 'error' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
            }`}
          >
            <div className="font-bold">{status.type === 'error' ? '❌ Error' : '✅ Success'}</div>
            <div>{status.message}</div>
            
            {emailDetails && status.type === 'success' && (
              <div className="mt-2 text-sm border-t pt-2 border-green-200 dark:border-green-700">
                <div><strong>Message ID:</strong> {emailDetails.messageId}</div>
                <div><strong>Recipient:</strong> {emailDetails.to}</div>
                <div><strong>From:</strong> {emailDetails.from}</div>
                <div><strong>Processing time:</strong> {emailDetails.processingTimeMs}ms (server) / {emailDetails.clientProcessingTime}ms (total)</div>
              </div>
            )}
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
            <div className="signature-dropdown relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={toggleDropdown}
                className={`text-sm py-1 px-3 rounded text-white ${theme === 'dark' ? 'bg-theme-dark hover:bg-dark-accent' : 'bg-[#3aa6f5] hover:bg-light-accent'}`}
              >
                Add Signature ▼
              </button>
              {showDropdown && (
                <div className={`absolute right-0 mt-1 w-40 shadow-lg rounded-md z-50 overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <button
                    type="button"
                    onClick={() => addSignature('elliot')}
                    className={`block w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Elliot's Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => addSignature('james')}
                    className={`block w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    James's Signature
                  </button>
                </div>
              )}
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
            {isSending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : 'Send Email'}
          </button>
        </div>
      </form>
      
      <style jsx>{`
        .signature-dropdown-content {
          display: none;
          position: absolute;
          right: 0;
          background-color: #f9f9f9;
          min-width: 160px;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 1;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .signature-dropdown-content.show {
          display: block;
        }
        
        .signature-dropdown-content button {
          color: black;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
          width: 100%;
          text-align: left;
        }
        
        .signature-dropdown-content button:hover {
          background-color: #f1f1f1;
        }
        
        .dark .signature-dropdown-content {
          background-color: #2d3748;
        }
        
        .dark .signature-dropdown-content button {
          color: white;
        }
        
        .dark .signature-dropdown-content button:hover {
          background-color: #4a5568;
        }
        
        /* Style for the Quill editor in dark mode */
        .quill-dark .ql-toolbar {
          background-color: #4a5568;
          border-color: #2d3748;
        }
        
        .quill-dark .ql-editor {
          background-color: #2d3748;
          color: white;
        }
        
        .quill-dark .ql-picker-label {
          color: white;
        }
        
        .quill-dark .ql-stroke {
          stroke: white;
        }
        
        .quill-dark .ql-fill {
          fill: white;
        }
      `}</style>
    </div>
  )
}