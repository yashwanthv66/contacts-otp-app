import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Link
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import PhoneIcon from '@mui/icons-material/Phone';

const VerificationDialog = ({ open, onClose, phoneNumber, message }) => {
  // Format phone number for display - hide middle digits
  const formattedNumber = phoneNumber ? 
    phoneNumber.replace(/(\+\d{2})\d{6}(\d{4})/, '$1XXXX$2') : '';
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center' }}>
        <WarningIcon sx={{ mr: 1 }} /> Verification Required
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PhoneIcon sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="subtitle1">{formattedNumber} is not verified in Twilio</Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          Due to Twilio trial account restrictions, you can only send SMS messages to verified phone numbers.
        </Typography>
        
        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Message that would be sent:
          </Typography>
          <Typography variant="body2">{message}</Typography>
        </Box>
        
        <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
            To send actual SMS messages to this number:
          </Typography>
          <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>Log in to your Twilio console</li>
            <li>Navigate to "Verified Caller IDs"</li>
            <li>Add {formattedNumber} to your verified numbers</li>
          </ol>
          <Button 
            variant="outlined" 
            size="small" 
            color="primary" 
            sx={{ mt: 2 }}
            component={Link}
            href="https://www.twilio.com/console"
            target="_blank"
          >
            Open Twilio Console
          </Button>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">OK</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerificationDialog;