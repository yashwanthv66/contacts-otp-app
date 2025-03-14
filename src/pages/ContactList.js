import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid,
  Card,
  Avatar,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import contactsData from '../data/contacts.json';
// Completely remove any SendOTPButton imports

const ContactList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    contactId: null,
    contactName: ''
  });
  
  // Load contacts from localStorage or use the default data
  useEffect(() => {
    const savedContacts = localStorage.getItem('contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      setContacts(contactsData);
      localStorage.setItem('contacts', JSON.stringify(contactsData));
    }
  }, []);

  const handleViewDetails = (id) => {
    navigate(`/contact/${id}`);
  };

  const handleComposeClick = (id) => {
    navigate(`/compose/${id}`);
  };

  // Add delete contact handlers
  const handleDeleteClick = (contact) => {
    setDeleteDialog({
      open: true,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      contactId: null,
      contactName: ''
    });
  };

  const handleConfirmDelete = () => {
    const updatedContacts = contacts.filter(contact => contact.id !== deleteDialog.contactId);
    setContacts(updatedContacts);
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
    handleCloseDeleteDialog();
  };

  // Sort contacts alphabetically by firstName
  const sortedContacts = [...contacts].sort((a, b) => 
    a.firstName.localeCompare(b.firstName)
  );

  // Filter contacts based on search query
  const filteredContacts = sortedContacts.filter(contact => 
    contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ 
        textAlign: 'center', 
        mb: 5,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '4px',
          backgroundColor: 'primary.main',
          borderRadius: '2px'
        }
      }}>
        <Typography variant="h3" component="h1" sx={{ 
          fontWeight: 'bold',
          color: 'text.primary',
          mb: 1
        }}>
          Contacts
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your contacts and send messages
        </Typography>
      </Box>
      
      {/* Search Box - remove Add Contact Button */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search contacts by name or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            sx: { 
              borderRadius: 2,
              bgcolor: 'white',
              '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }
            }
          }}
        />
      </Box>
      
      {/* Display message when no contacts match search */}
      {filteredContacts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No contacts found matching "{searchQuery}"
          </Typography>
        </Box>
      )}
      
      {/* Contact cards in vertical layout */}
      <Grid container spacing={3}>
        {filteredContacts.map((contact) => (
          <Grid item xs={12} key={contact.id}>
            <Card 
              elevation={3} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'row',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                },
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                bgcolor: 'primary.light', 
                p: 2, 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '80px'
              }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold',
                    width: 50,
                    height: 50
                  }}
                >
                  {contact.firstName.charAt(0)}
                </Avatar>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                flexGrow: 1,
                p: 2
              }}>
                <Typography variant="h6" sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
                  {contact.firstName} {contact.lastName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', width: 60 }}>
                    Phone:
                  </Typography>
                  <Chip 
                    label={contact.phoneNumber} 
                    variant="outlined" 
                    size="small" 
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Box>
              
              {/* In the contact card actions section: */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 2,
                gap: 1
              }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<MessageIcon />}
                  onClick={() => handleComposeClick(contact.id)}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
                  }}
                >
                  Compose
                </Button>
                
                {/* Remove the SendOTPButton component */}
                
                <IconButton 
                  color="primary" 
                  onClick={() => handleViewDetails(contact.id)}
                  sx={{ 
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                  }}
                >
                  <InfoIcon />
                </IconButton>
                
                <IconButton 
                  color="error" 
                  onClick={() => handleDeleteClick(contact)}
                  sx={{ 
                    bgcolor: 'rgba(211, 47, 47, 0.1)',
                    '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.2)' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Delete Contact
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteDialog.contactName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContactList;