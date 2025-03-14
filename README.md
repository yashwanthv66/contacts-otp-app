# 📱 Contacts OTP App

A modern React application for managing contacts and sending secure OTP messages with a clean, responsive UI.

## 🚀 Live Demo

The application is deployed and can be accessed at:
**[https://contacts-otp-app.netlify.app](https://contacts-otp-app.netlify.app)**

### Quick Test Guide:
1. Browse the contacts list on the home page
2. Use the search bar to filter contacts by name or phone number
3. Click on any contact to view their details
4. Try sending a test message with the "Send OTP" button
5. Check the "Sent Messages" page to view message history
6. Toggle between dark/light mode using the icon in the top-right corner

## ✨ Key Features

- **Contact Management**: View and search through your contacts list
- **Contact Details**: View detailed information for each contact
- **OTP Generation**: Automatically generate secure one-time passwords
- **Message History**: Track all sent messages with timestamps
- **Message Management**: Select and delete multiple messages
- **Dark/Light Theme**: Toggle between color modes for comfortable viewing
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technologies Used

- **React 18**: Modern UI library with hooks for state management
- **React Router 6**: For seamless navigation between different views
- **Material UI**: Component library for a polished, professional interface
- **Twilio API**: For secure SMS message delivery
- **LocalStorage**: For persistent message history across sessions
- **CSS-in-JS**: Styled components for maintainable styling

## 🏗️ Architecture & Design Decisions

1. **Component Structure**: 
   - Modular components organized by functionality
   - Reusable UI elements for consistent experience
   - Clear separation between pages and components

2. **State Management**: 
   - React hooks (useState, useEffect) for local state
   - Context API for theme management
   - Prop drilling minimized for better maintainability

3. **Theme Implementation**: 
   - Custom theme provider with Material UI theming
   - Consistent color palette across light and dark modes
   - Smooth transitions between themes

4. **Error Handling**: 
   - Comprehensive validation for user inputs
   - Graceful error states with user feedback
   - Fallback UI for edge cases

5. **Performance Optimization**:
   - Efficient rendering with React best practices
   - Lazy loading for improved initial load time
   - Optimized search functionality

## 🔧 Setup Instructions

1. Clone the repository
   ```bash
   git clone https://github.com/yashwanthv66/contacts-otp-app.git
   cd contacts-otp-app
   ```
2. Run `npm install` to install dependencies
3. Create a `.env` file with your Twilio credentials:
