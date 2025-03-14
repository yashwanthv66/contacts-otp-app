import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Container,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  Checkbox
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ContactDetails from './pages/ContactDetails';
import ComposeMessage from './pages/ComposeMessage';
import ThemeProvider, { useColorMode } from './theme/ThemeProvider';
import contactsData from './data/contacts.json';

// Create a navbar component with theme toggle
const Navbar = () => {
  const { mode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={() => navigate('/')}
        >
          Contacts OTP App
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Contacts
        </Button>
        <Button color="inherit" component={Link} to="/messages">
          Sent Messages
        </Button>
        <IconButton 
          sx={{ ml: 1 }} 
          onClick={toggleColorMode} 
          color="inherit"
          aria-label="toggle dark mode"
          title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

// Move ContactsList inside the Router context
const ContactsListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort contacts alphabetically by first name
  const sortedContacts = [...contactsData].sort((a, b) => 
    a.firstName.localeCompare(b.firstName)
  );
  
  // Filter contacts based on search query
  const filteredContacts = sortedContacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const phone = contact.phoneNumber.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || phone.includes(query);
  });
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>Contacts</Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search contacts"
          placeholder="Search by name or phone number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchQuery('')} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
      </Box>
      
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact, index) => (
              <React.Fragment key={contact.id}>
                <ListItem 
                  alignItems="flex-start" 
                  button 
                  onClick={() => navigate(`/contact/${contact.id}`)}
                  sx={{ py: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {contact.firstName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {contact.firstName} {contact.lastName}
                      </Typography>
                    }
                    secondary={contact.phoneNumber}
                  />
                </ListItem>
                {index < filteredContacts.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary="No contacts found" 
                secondary="Try a different search term"
                sx={{ textAlign: 'center', py: 3 }}
              />
            </ListItem>
          )}
        </List>
      </Card>
    </Container>
  );
};

const MessagesList = () => {
  const [messages, setMessages] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMessages, setSelectedMessages] = useState([]);
  
  useEffect(() => {
    // Fetch sent messages from localStorage
    const storedMessages = JSON.parse(localStorage.getItem('sentMessages')) || [];
    setMessages(storedMessages);
  }, [refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
    setSelectedMessages([]);
  };
  
  const handleToggleSelect = (messageId) => {
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
      setSelectedMessages(messages.map(message => message.id));
    }
  };
  
  const handleDeleteSelected = () => {
    if (selectedMessages.length === 0) return;
    
    // Filter out selected messages
    const updatedMessages = messages.filter(message => !selectedMessages.includes(message.id));
    
    // Update localStorage
    localStorage.setItem('sentMessages', JSON.stringify(updatedMessages));
    
    // Update state
    setMessages(updatedMessages);
    setSelectedMessages([]);
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Sent Messages</Typography>
        <Box>
          {selectedMessages.length > 0 && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleDeleteSelected}
              sx={{ mr: 2 }}
            >
              Delete Selected ({selectedMessages.length})
            </Button>
          )}
          <Button variant="outlined" onClick={handleRefresh}>Refresh</Button>
        </Box>
      </Box>
      
      {messages.length > 0 ? (
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Checkbox
              checked={selectedMessages.length === messages.length && messages.length > 0}
              indeterminate={selectedMessages.length > 0 && selectedMessages.length < messages.length}
              onChange={handleSelectAll}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {selectedMessages.length > 0 
                ? `${selectedMessages.length} selected` 
                : 'Select all'}
            </Typography>
          </Box>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {messages.map((message, index) => (
              <React.Fragment key={message.id || index}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ py: 2 }}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => handleToggleSelect(message.id)}
                    />
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          To: {message.contactName || 'Unknown Contact'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(message.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {message.body || message.text || 'No message content'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Status: {message.status || 'unknown'}
                        </Typography>
                        {message.phoneNumber && (
                          <Typography variant="body2" color="text.secondary">
                            Phone: {message.phoneNumber}
                          </Typography>
                        )}
                        {message.error && (
                          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            Error: {message.error}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < messages.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      ) : (
        <Card elevation={3} sx={{ borderRadius: 2, p: 4, textAlign: 'center' }}>
          <Typography variant="body1">No messages sent yet</Typography>
        </Card>
      )}
    </Container>
  );
};

function AppContent() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<ContactsListPage />} />
          <Route path="/contact/:id" element={<ContactDetails />} />
          <Route path="/compose/:id" element={<ComposeMessage />} />
          <Route path="/messages" element={<MessagesList />} />
        </Routes>
      </Box>
    </Router>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContactsList from './components/ContactsList';
import ContactDetails from './components/ContactDetails';
import MessageHistory from './components/MessageHistory';

import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<ContactsList />} />
        <Route path="/contact/:id" element={<ContactDetails />} />
        <Route path="/messages" element={<MessageHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
