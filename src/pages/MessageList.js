import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Card, CardContent, 
  Divider, Chip, Button, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle,
  Checkbox
  // Remove the unused imports: IconButton, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MessageService from '../services/MessageService';

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    const sentMessages = MessageService.getSentMessages();
    setMessages(sentMessages);
    setSelectedMessages([]);
  };

  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(msg => msg.id));
    }
  };

  const handleClearAll = () => {
    setOpenClearDialog(true);
  };

  const confirmClearAll = () => {
    MessageService.clearAllMessages();
    loadMessages();
    setOpenClearDialog(false);
  };

  const handleDeleteSelected = () => {
    if (selectedMessages.length > 0) {
      setOpenDeleteDialog(true);
    }
  };

  const confirmDeleteSelected = () => {
    MessageService.deleteMessages(selectedMessages);
    loadMessages();
    setOpenDeleteDialog(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sent Messages
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          History of OTP messages sent to contacts
        </Typography>
        <Divider sx={{ mt: 2, mb: 3, width: '50%', mx: 'auto' }} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button 
          variant="outlined" 
          onClick={handleSelectAll}
        >
          {selectedMessages.length === messages.length ? 'Deselect All' : 'Select All'}
        </Button>
        <Box>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleDeleteSelected}
            disabled={selectedMessages.length === 0}
            startIcon={<DeleteIcon />}
            sx={{ mr: 1 }}
          >
            Delete Selected
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleClearAll}
            startIcon={<DeleteIcon />}
          >
            Clear All
          </Button>
        </Box>
      </Box>

      {messages.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No messages sent yet
          </Typography>
        </Box>
      ) : (
        messages.map((message) => (
          <Card key={message.id} sx={{ mb: 2, position: 'relative' }}>
            <CardContent>
              <Box sx={{ position: 'absolute', left: 10, top: 10 }}>
                <Checkbox 
                  checked={selectedMessages.includes(message.id)}
                  onChange={() => handleSelectMessage(message.id)}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 5 }}>
                <Typography variant="h6" component="div">
                  {message.contactName}
                </Typography>
                <Chip 
                  label={message.status === 'sent' ? message.body.split(' ').pop() : message.status}
                  color={message.status === 'sent' ? 'primary' : 'error'}
                  variant="outlined"
                />
              </Box>
              <Typography sx={{ mb: 1.5, ml: 5 }} color="text.secondary">
                {message.body}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                {message.phoneNumber}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(message.timestamp)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={openClearDialog}
        onClose={() => setOpenClearDialog(false)}
      >
        <DialogTitle>Clear All Messages</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all messages? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClearDialog(false)}>Cancel</Button>
          <Button onClick={confirmClearAll} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Selected Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Selected Messages</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedMessages.length} selected message(s)? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteSelected} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MessageList;