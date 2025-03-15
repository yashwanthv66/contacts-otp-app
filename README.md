# Contacts OTP App

A React application for managing contacts and sending OTP messages via Twilio.

## Live Demo

The application is deployed and available at: [https://contacts-otp-app-new.netlify.app](https://contacts-otp-app-new.netlify.app)

## Features

- Contact management
- OTP generation and sending via Twilio
- Message history tracking
- Secure API handling with Netlify Functions

## About the App

This application allows users to manage contacts and send one-time passwords (OTPs) via SMS using Twilio's messaging service. The app demonstrates modern web development practices including:

- React-based frontend with responsive design
- State management for contacts and message history
- Integration with Twilio API for SMS delivery
- Serverless functions for secure API handling
- Error handling and user feedback

## Important Notes on Twilio Integration

- **Trial Account Limitations**: This app uses a Twilio trial account which has certain restrictions:
  - Messages can only be sent to verified phone numbers
  - To verify a number in Twilio, you need to add it to your verified numbers list in the Twilio console
  - Attempting to send messages to unverified numbers will result in an error
  - Once you upgrade to a paid Twilio account, you can send messages to any number without verification

- **Costs**: After the trial period or when using a paid account, Twilio will charge for each SMS sent. Please refer to [Twilio's pricing page](https://www.twilio.com/sms/pricing) for current rates.

## How to Use

1. Browse the contacts list on the main page
2. Select a contact to view their details
3. Click "Send OTP" to generate and send a one-time password
4. View sent messages history in the "Sent Messages" section

## Technologies Used

- React.js
- Bootstrap for UI components
- Netlify for hosting and serverless functions
- Twilio API for SMS delivery