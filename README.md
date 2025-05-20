# HyperMail

A minimal web application for sending transactional or outreach emails via Postmark.

## Features

- Simple web interface for sending emails
- Basic login protection for authorized users
- Secure server-side API calls to Postmark
- Form validation for email fields
- Responsive UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 14+ 
- A Postmark account with an API key

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Used for basic frontend auth
NEXT_PUBLIC_MAIL_USERNAME=your_username
NEXT_PUBLIC_MAIL_PASSWORD=your_secure_password

# Server-side secret (never exposed to client)
POSTMARK_API_KEY=your-postmark-api-key
POSTMARK_FROM_EMAIL=your-from-email@example.com
```

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Login with the credentials specified in your environment variables
2. Fill out the email form with recipient, subject, and message
3. Click "Send Email" to send the message through Postmark

## Deployment

This project is set up to be deployed on Netlify. Make sure to set up the environment variables in your Netlify dashboard.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/hypermail)

## License

MIT
