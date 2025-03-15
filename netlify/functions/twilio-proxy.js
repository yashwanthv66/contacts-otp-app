const axios = require('axios');

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Proxy-Source',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const params = new URLSearchParams(event.body);
    
    // Enhanced logging for debugging
    console.log('Twilio request params:', Object.fromEntries(params));
    console.log('Using Twilio Account SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set (hidden for security)' : 'NOT SET');
    console.log('Using Twilio Auth Token:', process.env.TWILIO_AUTH_TOKEN ? 'Set (hidden for security)' : 'NOT SET');
    console.log('Using Twilio Phone Number:', process.env.TWILIO_PHONE_NUMBER || 'NOT SET');
    
    // Prepare the request to Twilio
    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
    
    // Make the request to Twilio API
    const response = await axios.post(twilioEndpoint, params, {
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Twilio API success response:', response.data);
    
    // Return the Twilio response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    // Enhanced error logging
    console.error('Twilio API Error:', error.response?.data || error.message);
    
    if (error.response?.data?.code) {
      console.error('Twilio Error Code:', error.response.data.code);
      
      // Check for trial account limitations
      if (error.response.data.code === 21608) {
        console.error('Trial account limitation detected');
      }
      
      // Check for daily limit exceeded
      if (error.response.data.code === 14101) {
        console.error('Daily limit exceeded');
      }
    }
    
    // Return the error from Twilio
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: true,
        message: error.response?.data?.message || error.message,
        code: error.response?.data?.code || 'UNKNOWN_ERROR',
        moreInfo: error.response?.data?.more_info || null
      })
    };
  }
};