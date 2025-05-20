import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Header */}
      <Header title="HyperMail" />

      {/* Main content wrapper with proper mobile scrolling */}
      <div className="flex-grow flex flex-col mt-16 relative">
        {/* Actual content area that child pages render into */}
        <main className="flex-grow flex flex-col w-full">
        {children}
      </main>
      </div>
      
      {/* Footer always visible at the bottom */}
      <Footer />
    </div>
  )
}