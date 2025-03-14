import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(location.pathname === '/messages' ? 1 : 0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 0) {
      navigate('/');
    } else {
      navigate('/messages');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Contacts OTP App
        </Typography>
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit"
            indicatorColor="secondary"
            centered
          >
            <Tab label="Contacts" />
            <Tab label="Sent Messages" />
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;