import 'styles/globals.css'
import Layout from '@components/Layout'
import { ThemeProvider } from '../lib/ThemeContext'

function Application({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  )
}

export default Application
