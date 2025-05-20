import Cookies from 'js-cookie';

// Cookie name for storing authentication state
const AUTH_COOKIE = 'hypermail_auth';

// Set authentication cookie with a 24-hour expiry
export function login(username, password) {
  const expectedUsername = process.env.NEXT_PUBLIC_MAIL_USERNAME;
  const expectedPassword = process.env.NEXT_PUBLIC_MAIL_PASSWORD;

  if (username === expectedUsername && password === expectedPassword) {
    // Simple encoding, not secure for production in a real-world app
    const encodedAuth = btoa(`${username}:${password}`);
    Cookies.set(AUTH_COOKIE, encodedAuth, { expires: 1 }); // 1 day
    return true;
  }
  return false;
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!Cookies.get(AUTH_COOKIE);
}

// Get stored auth credentials
export function getAuthCredentials() {
  const encodedAuth = Cookies.get(AUTH_COOKIE);
  if (!encodedAuth) return null;
  
  try {
    const decoded = atob(encodedAuth);
    const [username, password] = decoded.split(':');
    return { username, password };
  } catch (e) {
    return null;
  }
}

// Logout by removing the cookie
export function logout() {
  Cookies.remove(AUTH_COOKIE);
} 