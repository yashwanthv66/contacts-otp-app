import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Avatar, 
  Divider,
  Grid,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MessageIcon from '@mui/icons-material/Message';
// Completely remove this import
// import SendOTPButton from '../components/SendOTPButton';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  // In the useEffect hook where you fetch the contact:
  useEffect(() => {
    // Get contacts from localStorage
    const savedContacts = localStorage.getItem('contacts');
    if (savedContacts) {
      const contacts = JSON.parse(savedContacts);
      // Find the contact with the matching ID - ensure string comparison
      const foundContact = contacts.find(c => String(c.id) === String(id));
      setContact(foundContact || null);
    } else {
      setContact(null);
    }
    setLoading(false);
  }, [id]);

  const handleBack = () => {
    navigate('/');
  };

  const handleComposeClick = () => {
    navigate(`/compose/${id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Loading contact details...</Typography>
      </Container>
    );
  }

  if (!contact) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back to Contacts
          </Button>
        </Box>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: 'error.light'
          }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 2, color: 'error.dark' }}>
            Contact not found
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The contact you're looking for doesn't exist or may have been deleted.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleBack}
          >
            Return to Contacts List
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to Contacts
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Contact Details
        </Typography>
      </Box>
      
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          bgcolor: 'primary.main', 
          p: 3, 
          display: 'flex', 
          alignItems: 'center',
          gap: 3
        }}>
          <Avatar 
            sx={{ 
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 'bold',
              width: 80,
              height: 80,
              fontSize: '2rem'
            }}
          >
            {contact.firstName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {contact.firstName} {contact.lastName}
            </Typography>
          </Box>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', width: 120 }}>
                  First Name:
                </Typography>
                <Typography variant="body1">
                  {contact.firstName}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', width: 120 }}>
                  Last Name:
                </Typography>
                <Typography variant="body1">
                  {contact.lastName || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', width: 120 }}>
                  Phone:
                </Typography>
                <Typography variant="body1">
                  {contact.phoneNumber}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        
        <Box sx={{ p: 3, bgcolor: 'grey.50', display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<MessageIcon />}
            onClick={handleComposeClick}
          >
            Compose Message
          </Button>
          
          {/* COMPLETELY REMOVE THE SEND OTP BUTTON - NOTHING SHOULD BE HERE */}
        </Box>
      </Card>
    </Container>
  );
};

export default ContactDetail;