import axios from 'axios';

// In a real app, this would be stored in a database
const getSavedMessages = () => JSON.parse(localStorage.getItem('sentMessages')) || [];

// Replace hardcoded credentials with environment variables
const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.REACT_APP_TWILIO_PHONE_NUMBER;

// Cache for verified numbers from Twilio API
let cachedVerifiedNumbers = null;

const MessageService = {
  // Generate a random 6-digit OTP with formatted message
  generateOTP: () => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    return `Your OTP is: ${otpCode}. This code will expire in 10 minutes.`;
  },
  
  // Fetch verified numbers from Twilio API
  fetchVerifiedNumbers: async () => {
    try {
      // If we already have cached numbers, return them
      if (cachedVerifiedNumbers) {
        return cachedVerifiedNumbers;
      }
      
      // Fetch verified numbers from Twilio API
      const verifiedNumbersEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${process.env.REACT_APP_TWILIO_ACCOUNT_SID}/OutgoingCallerIds.json`;
      
      const response = await axios.get(verifiedNumbersEndpoint, {
        auth: {
          username: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
          password: process.env.REACT_APP_TWILIO_AUTH_TOKEN
        }
      });
      
      // Extract phone numbers from response
      const verifiedNumbers = response.data.outgoing_caller_ids.map(
        entry => entry.phone_number
      );
      
      // Cache the result
      cachedVerifiedNumbers = verifiedNumbers;
      
      return verifiedNumbers;
    } catch (error) {
      console.error('Error fetching verified numbers:', error);
      // Fall back to empty array if API call fails
      return [];
    }
  },
  
  // Update the isNumberVerified method to properly use the Twilio API
  isNumberVerified: async (phoneNumber) => {
    try {
      // Fetch verified numbers from Twilio API
      const verifiedNumbers = await MessageService.fetchVerifiedNumbers();
      
      // Check if the number is in the list of verified numbers from Twilio
      return verifiedNumbers.includes(phoneNumber);
    } catch (error) {
      console.error('Error checking number verification:', error);
      // If there's an error, assume the number is not verified
      return false;
    }
  },
  
  // Send SMS using Twilio API
  // In the sendSMS function
  sendSMS: async (contact, message) => {
      try {
        console.log('Starting SMS send attempt...');
        
        // Format the phone number
        let phoneNumber = contact.phoneNumber;
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = phoneNumber.replace(/^0+/, '');
          if (!phoneNumber.startsWith('91')) {
            phoneNumber = '91' + phoneNumber;
          }
          phoneNumber = '+' + phoneNumber;
        }
        
        // Log the API request details
        const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${process.env.REACT_APP_TWILIO_ACCOUNT_SID}/Messages.json`;
        console.log('Attempting to call Twilio API:', {
          endpoint: twilioEndpoint,
          to: phoneNumber,
          from: process.env.REACT_APP_TWILIO_PHONE_NUMBER,
          hasAuth: !!process.env.REACT_APP_TWILIO_AUTH_TOKEN
        });
  
        const twilioParams = new URLSearchParams();
        twilioParams.append('To', phoneNumber);
        twilioParams.append('From', process.env.REACT_APP_TWILIO_PHONE_NUMBER);
        twilioParams.append('Body', message);
        
        // Add CORS headers
        const response = await axios.post(twilioEndpoint, twilioParams, {
          auth: {
            username: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
            password: process.env.REACT_APP_TWILIO_AUTH_TOKEN
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*'
          }
        });
        
        let status = 'failed';
        let twilioResponse = null;
        let errorMessage = null;
        
        // For testing purposes, let's store all message attempts
        const sentMessage = {
          id: Date.now(),
          contactName: `${contact.firstName} ${contact.lastName}`,
          phoneNumber: contact.phoneNumber,
          body: message,
          timestamp: new Date().toISOString(),
          status: 'processing',
        };
        
        // Check if number is verified using the API
        // For demo purposes, set this to false to trigger verification dialog
        // Change this line to enable real Twilio API calls
        const isVerified = true; // Enable actual SMS sending
        
        // Add debug logging to verify environment variables
        console.log('Twilio Config:', {
          hasAccountSid: !!process.env.REACT_APP_TWILIO_ACCOUNT_SID,
          hasAuthToken: !!process.env.REACT_APP_TWILIO_AUTH_TOKEN,
          hasPhoneNumber: !!process.env.REACT_APP_TWILIO_PHONE_NUMBER
        });
        
        if (isVerified) {
          try {
            // Use Twilio API to send the actual message
            const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${process.env.REACT_APP_TWILIO_ACCOUNT_SID}/Messages.json`;
            
            const twilioParams = new URLSearchParams();
            twilioParams.append('To', phoneNumber);
            twilioParams.append('From', process.env.REACT_APP_TWILIO_PHONE_NUMBER);
            twilioParams.append('Body', message);
            
            const response = await axios.post(twilioEndpoint, twilioParams, {
              auth: {
                username: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
                password: process.env.REACT_APP_TWILIO_AUTH_TOKEN
              }
            });
            
            twilioResponse = response.data;
            status = 'sent';
            console.log('Message sent successfully via Twilio:', twilioResponse.sid);
          } catch (twilioError) {
            console.error('Error sending via Twilio:', twilioError.response?.data || twilioError.message);
            
            // Check for daily limit exceeded error
            if (twilioError.response?.data?.message?.includes('daily messages limit')) {
              status = 'failed (Daily Limit Exceeded)';
              errorMessage = 'Your Twilio trial account has reached its daily message limit. Please try again tomorrow or upgrade your account.';
            } else {
              status = 'failed (Twilio error)';
              errorMessage = twilioError.response?.data?.message || twilioError.message;
            }
            
            // Simulate successful sending for testing purposes
            // Remove this in production
            if (process.env.NODE_ENV === 'development') {
              console.log('Development mode: Simulating successful message delivery');
              status = 'sent (simulated)';
              sentMessage.simulatedDelivery = true;
            }
          }
        } else {
          status = 'verification_needed';
          errorMessage = `Number ${phoneNumber} needs to be verified with Twilio`;
        }
        
        // Update the message with final status
        sentMessage.status = status;
        sentMessage.twilioSid = twilioResponse?.sid || null;
        sentMessage.isVerified = isVerified;
        if (errorMessage) {
          sentMessage.error = errorMessage;
        }
        
        // Store all message attempts for debugging
        const existingMessages = getSavedMessages();
        localStorage.setItem('sentMessages', JSON.stringify([...existingMessages, sentMessage]));
        
        return sentMessage;
      } catch (error) {
        // At the start of your sendMessage function
        console.log('Twilio Environment Variables:', {
          accountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID?.substring(0, 8) + '...',
          hasAuthToken: !!process.env.REACT_APP_TWILIO_AUTH_TOKEN,
          phoneNumber: process.env.REACT_APP_TWILIO_PHONE_NUMBER
        });
        
        // In your catch block where you handle errors
        catch (error) {
          console.error('Twilio Error Details:', {
            message: error.message,
            code: error.code,
            status: error.status
          });
          // ... rest of your error handling
        }
        throw error;
      }
    }
    
    // Get all sent messages
    getSentMessages: () => {
      return getSavedMessages()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp descending
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

export default MessageService;