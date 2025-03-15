import axios from 'axios';

// In a real app, this would be stored in a database
const getSavedMessages = () => JSON.parse(localStorage.getItem('sentMessages')) || [];

// Cache for verified numbers from Twilio API with timestamp
let cachedVerifiedNumbers = null;
let cacheTimestamp = null;

// Set cache duration to 5 minutes to reduce API calls
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const MessageService = {
  // Generate a random 6-digit OTP with formatted message
  generateOTP: () => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    return `Hi, Your OTP is: ${otpCode}. This code will expire in 10 minutes.`;
  },
  
  // Fetch verified numbers from Twilio API with improved caching
  fetchVerifiedNumbers: async () => {
    try {
      // Check if cache is still valid
      if (cachedVerifiedNumbers && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        console.log('Using cached numbers, cache age:', Math.round((Date.now() - cacheTimestamp)/1000), 'seconds');
        return cachedVerifiedNumbers;
      }
      
      const verifiedNumbersEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${process.env.REACT_APP_TWILIO_ACCOUNT_SID}/OutgoingCallerIds.json`;
      
      const response = await axios.get(verifiedNumbersEndpoint, {
        auth: {
          username: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
          password: process.env.REACT_APP_TWILIO_AUTH_TOKEN
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const verifiedNumbers = response.data.outgoing_caller_ids.map(
        entry => entry.phone_number
      );
      
      console.log('Fetched new verified numbers:', verifiedNumbers);
      cachedVerifiedNumbers = verifiedNumbers;
      cacheTimestamp = Date.now();
      return verifiedNumbers;
      
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('Rate limited, using cached numbers if available');
        return cachedVerifiedNumbers || [];
      }
      console.error('Error fetching verified numbers:', error);
      return cachedVerifiedNumbers || [];
    }
  },
  
  // Add method to start polling with longer interval
  startVerificationPolling: () => {
    // Initial fetch
    MessageService.fetchVerifiedNumbers();
    
    // Set up periodic polling with longer interval
    setInterval(() => {
      MessageService.fetchVerifiedNumbers();
    }, CACHE_DURATION); // Use same duration as cache
  },

  isNumberVerified: async (phoneNumber) => {
    try {
      // Fetch verified numbers from Twilio API
      const verifiedNumbers = await MessageService.fetchVerifiedNumbers();
      
      // Enhanced logging for debugging
      console.log('Checking if number is verified:', phoneNumber);
      console.log('Available verified numbers:', verifiedNumbers);
      
      // Check if the number is in the list of verified numbers from Twilio
      const isVerified = verifiedNumbers.includes(phoneNumber);
      console.log('Verification result:', isVerified);
      
      return isVerified;
    } catch (error) {
      console.error('Error checking number verification:', error);
      // If there's an error, assume the number is not verified
      return false;
    }
  },

  // Send SMS using Twilio API with improved error handling
  sendSMS: async (contact, message) => {
    try {
      let status = 'failed';
      let twilioResponse = null;
      let errorMessage = null;
      
      // Format the phone number
      let phoneNumber = contact.phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = phoneNumber.replace(/^0+/, '');
        if (!phoneNumber.startsWith('91')) {
          phoneNumber = '91' + phoneNumber;
        }
        phoneNumber = '+' + phoneNumber;
      }
      
      console.log('Attempting to send OTP to:', phoneNumber);
  
      // Check if number is verified before sending
      const isVerified = await MessageService.isNumberVerified(phoneNumber);
      console.log('Number verification status:', isVerified);
      
      if (!isVerified) {
        console.log('Number not verified, returning verification needed status');
        return {
          id: Date.now(),
          contactName: `${contact.firstName} ${contact.lastName}`,
          phoneNumber: contact.phoneNumber,
          body: message,
          timestamp: new Date().toISOString(),
          status: 'verification_needed',
          error: `${phoneNumber} is not verified in Twilio`,
          verificationSteps: [
            'Log in to your Twilio console',
            'Navigate to "Verified Caller IDs"',
            `Add ${phoneNumber} to your verified numbers`
          ],
          messagePreview: message
        };
      }
      
      // Only proceed with API call if number is verified
      console.log('Number is verified, proceeding with API call');
      const twilioEndpoint = '/.netlify/functions/twilio-proxy';
      const twilioParams = new URLSearchParams();
      twilioParams.append('To', phoneNumber);
      twilioParams.append('From', process.env.REACT_APP_TWILIO_PHONE_NUMBER);
      twilioParams.append('Body', message);
      
      try {
        console.log('Making real API call to Twilio');
        const response = await axios.post(twilioEndpoint, twilioParams, {
          timeout: 10000, // 10-second timeout
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Proxy-Source': 'react-app' // Add identifying header
          },
          proxy: false,
          validateStatus: (status) => status >= 200 && status < 500
        });

        // Handle Twilio API responses
        if (response.status >= 200 && response.status < 300) {
          twilioResponse = response.data;
          status = 'sent';
          console.log('SMS sent successfully with SID:', twilioResponse.sid);
        } else {
          console.error('Twilio API Error:', {
            status: response.status,
            data: response.data
          });
          
          // Handle specific Twilio error codes
          const errorCode = response.data?.code;
          errorMessage = response.data?.message || 'Twilio API error occurred';
          
          // Handle trial account limitations
          if (errorCode === 21608) {
            errorMessage = 'Trial account can only send to verified numbers. Please verify this number in Twilio.';
            status = 'verification_needed';
          }
          
          // Handle daily limit exceeded
          if (errorCode === 14101) {
            const now = new Date();
            const resetTime = new Date(now);
            resetTime.setHours(24,0,0,0); // Next midnight PT
            
            const displayResetTime = new Date().toLocaleString('en-US', {
              timeZone: 'America/Los_Angeles',
              hour12: true,
              hour: 'numeric',
              minute: '2-digit'
            });
            
            errorMessage = `Daily limit exceeded. Resets at ${displayResetTime} PT. Upgrade at twilio.com/console/upgrade`;
            status = 'limit_exceeded';
          }
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        errorMessage = apiError.response?.data?.message || apiError.message;
        
        // Handle network errors
        if (!apiError.response) {
          errorMessage = 'Network error - failed to connect to Twilio';
        }
        
        // Check for Twilio error codes in the response
        const errorCode = apiError.response?.data?.code;
        
        // Handle trial account limitations
        if (errorCode === 21608) {
          errorMessage = 'Trial account can only send to verified numbers. Please verify this number in Twilio.';
          status = 'verification_needed';
        }
        
        // Handle daily limit exceeded
        if (errorCode === 14101) {
          const now = new Date();
          const resetTime = new Date(now);
          resetTime.setHours(24,0,0,0); // Next midnight PT
          
          const displayResetTime = new Date().toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
          });
          
          errorMessage = `Daily limit exceeded. Resets at ${displayResetTime} PT. Upgrade at twilio.com/console/upgrade`;
          status = 'limit_exceeded';
        }
        
        // Check if we're in development mode for fallback behavior
        if (process.env.NODE_ENV === 'development' && status !== 'verification_needed') {
          console.log('Development mode: Simulating successful delivery after API error');
          status = 'sent (simulated)';
          twilioResponse = { sid: 'SIMULATED_' + Date.now() };
        }
      }
  
      // Create message record
      const sentMessage = {
        id: Date.now(),
        contactName: `${contact.firstName} ${contact.lastName}`,
        phoneNumber: contact.phoneNumber,
        body: message,
        timestamp: new Date().toISOString(),
        status: status,
        twilioSid: twilioResponse?.sid || null,
        error: errorMessage,
        verificationSteps: status === 'verification_needed' ? [
          'Log in to your Twilio console',
          'Navigate to "Verified Caller IDs"',
          `Add ${phoneNumber} to your verified numbers`
        ] : undefined
      };
  
      // Store message attempt
      const existingMessages = getSavedMessages();
      localStorage.setItem('sentMessages', JSON.stringify([...existingMessages, sentMessage]));
      
      return sentMessage;
    } catch (error) {
      console.error('Twilio Error Details:', error);
      
      // Even if there's an error, create a simulated success message in development mode only
      if (process.env.NODE_ENV === 'development') {
        const sentMessage = {
          id: Date.now(),
          contactName: `${contact.firstName} ${contact.lastName}`,
          phoneNumber: contact.phoneNumber,
          body: message,
          timestamp: new Date().toISOString(),
          status: 'sent (fallback)',
          twilioSid: 'FALLBACK_' + Date.now(),
          error: null
        };
        
        // Store message attempt
        const existingMessages = getSavedMessages();
        localStorage.setItem('sentMessages', JSON.stringify([...existingMessages, sentMessage]));
        
        return sentMessage;
      } else {
        // In production, return a failed status
        return {
          id: Date.now(),
          contactName: `${contact.firstName} ${contact.lastName}`,
          phoneNumber: contact.phoneNumber,
          body: message,
          timestamp: new Date().toISOString(),
          status: 'failed',
          error: error.message || 'An unexpected error occurred'
        };
      }
    }
  },

  // Get all sent messages
  getSentMessages: () => {
    return getSavedMessages()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Delete a specific message by ID
  deleteMessage: (messageId) => {
    const messages = getSavedMessages();
    const updatedMessages = messages.filter(message => message.id !== messageId);
    localStorage.setItem('sentMessages', JSON.stringify(updatedMessages));
    return updatedMessages;
  },

  // Delete multiple messages by ID
  deleteMessages: (messageIds) => {
    const messages = getSavedMessages();
    const updatedMessages = messages.filter(message => !messageIds.includes(message.id));
    localStorage.setItem('sentMessages', JSON.stringify(updatedMessages));
    return updatedMessages;
  },

  // Clear all messages
  clearAllMessages: () => {
    localStorage.setItem('sentMessages', JSON.stringify([]));
    return [];
  }
};

// Start the verification polling when the service is initialized
MessageService.startVerificationPolling();

export default MessageService;