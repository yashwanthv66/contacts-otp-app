import React, { useState } from 'react';
import MessageService from '../services/MessageService';

const ContactDetails = ({ contact }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSendOTP = async () => {
    console.log('Button clicked - Starting OTP send process');
    setSending(true);
    setError(null);
    
    try {
      const otpMessage = MessageService.generateOTP();
      console.log('OTP Generated, attempting to send to:', contact.phoneNumber);
      
      const result = await MessageService.sendSMS(contact, otpMessage);
      console.log('Send SMS Result:', result);
      
    } catch (err) {
      console.error('Error in handleSendOTP:', err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // ... rest of your component code