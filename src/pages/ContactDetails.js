import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Card, 
  CardContent,
  Avatar,
  // Removed unused Chip import
  Divider,
  // Removed unused IconButton import
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MessageIcon from '@mui/icons-material/Message';
import contactsData from '../data/contacts.json';

const ContactDetails = () => {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const foundContact = contactsData.find(c => c.id === parseInt(id));
    if (foundContact) {
      setContact(foundContact);
    }
  }, [id]);

  // Remove the handleSendOTP function since we're not using it anymore

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
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Contacts
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Contact Details
        </Typography>
      </Box>
      
      <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', p: 3, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'white', 
                color: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold',
                mr: 3
              }}
            >
              {contact.firstName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {contact.firstName} {contact.lastName}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', width: 100 }}>
                  Phone:
                </Typography>
                <Typography variant="body1">
                  {contact.phoneNumber}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<MessageIcon />}
                  onClick={() => navigate(`/compose/${id}`)}
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
                  }}
                >
                  Compose Message
                </Button>
                
                {/* Remove the SendOTPButton component if it exists */}
                
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ContactDetails;