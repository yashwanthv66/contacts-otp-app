import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Box, 
  Card, 
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import contactsData from '../data/contacts.json';
import MessageService from '../services/MessageService';
import VerificationDialog from '../components/VerificationDialog';

const ComposeMessage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);

  useEffect(() => {
    const foundContact = contactsData.find(c => c.id === parseInt(id));
    if (foundContact) {
      setContact(foundContact);
    }
  }, [id]);

  // Add a function to generate OTP message
  const generateOTPMessage = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setMessage(`Hi. Your OTP is: ${otp}. This code will expire in 10 minutes.`);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setResult({
        success: false,
        message: 'Please enter a message'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const result = await MessageService.sendSMS(contact, message);
      
      // Set appropriate result based on the response status
      if (result.status === 'sent') {
        setResult({
          success: true,
          message: 'Message sent successfully'
        });
        // Clear the message input after successful send
        setMessage('');
      } else if (result.status === 'verification_needed') {
        // Show verification dialog instead of error message
        setVerificationDialogOpen(true);
      } else {
        setResult({
          success: false,
          message: result.error || 'Failed to send message'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setResult({
        success: false,
        message: 'Failed to send message: ' + (error.message || 'Unknown error')
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contact) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5">Contact not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(`/contact/${id}`)}
          sx={{ mr: 2 }}
        >
          Back to Contact
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Compose Message
        </Typography>
      </Box>
      
      <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            To: {contact.firstName} {contact.lastName} ({contact.phoneNumber})
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="outlined" 
              onClick={generateOTPMessage}
              size="small"
            >
              Generate OTP
            </Button>
          </Box>
          
          <TextField
            label="Message"
            multiline
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 3 }}
            placeholder="Type your message here..."
          />
          
          {result && (
            <Alert 
              severity={result.success ? "success" : "error"} 
              sx={{ mb: 3 }}
            >
              {result.message}
            </Alert>
          )}
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleSendMessage}
            disabled={loading}
            fullWidth
            sx={{ py: 1.5 }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>
      
      {/* Add the verification dialog */}
      <VerificationDialog
        open={verificationDialogOpen}
        onClose={() => setVerificationDialogOpen(false)}
        phoneNumber={contact?.phoneNumber}
        message={message}
      />
    </Container>
  );
};

export default ComposeMessage;