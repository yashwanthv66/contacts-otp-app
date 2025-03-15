import React, { useState } from 'react';
import MessageService from '../services/MessageService';

const ContactDetails = ({ contact }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [messageResult, setMessageResult] = useState(null);

  const handleSendOTP = async () => {
    console.log('Button clicked - Starting OTP send process');
    setSending(true);
    setError(null);
    setMessageResult(null);
    
    try {
      const otpMessage = MessageService.generateOTP();
      console.log('OTP Generated, attempting to send to:', contact.phoneNumber);
      
      const result = await MessageService.sendSMS(contact, otpMessage);
      console.log('Send SMS Result:', result);
      
      setMessageResult(result);
      
      // Handle specific error statuses from Twilio
      if (result.status === 'failed') {
        setError(result.error || 'Failed to send message');
      } else if (result.status === 'verification_needed') {
        setError('This number needs to be verified in your Twilio account');
      } else if (result.status === 'limit_exceeded') {
        setError('Daily message limit exceeded. Please try again tomorrow.');
      }
    } catch (err) {
      console.error('Error in handleSendOTP:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setSending(false);
    }
  };

  // Add a function to render message status
  const renderMessageStatus = () => {
    if (!messageResult) return null;
    
    if (messageResult.status === 'sent') {
      return <div className="alert alert-success mt-2">OTP sent successfully!</div>;
    } else if (messageResult.status === 'verification_needed') {
      return (
        <div className="alert alert-warning mt-2">
          <p>This number needs to be verified in your Twilio account.</p>
          <small>Trial accounts can only send to verified numbers.</small>
        </div>
      );
    } else if (messageResult.status === 'limit_exceeded') {
      return <div className="alert alert-warning mt-2">Daily message limit exceeded. Please try again tomorrow.</div>;
    } else if (messageResult.status === 'failed') {
      return <div className="alert alert-danger mt-2">Error: {messageResult.error}</div>;
    }
    
    return null;
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{contact.firstName} {contact.lastName}</h5>
        <p className="card-text">{contact.phoneNumber}</p>
        <button 
          className="btn btn-primary" 
          onClick={handleSendOTP}
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Send OTP'}
        </button>
        
        {error && <div className="alert alert-danger mt-2">{error}</div>}
        {renderMessageStatus()}
      </div>
    </div>
  );
};

export default ContactDetails;