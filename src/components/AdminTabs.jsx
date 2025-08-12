import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import AdminDashboard from '../pages/AdminDashboard'; // <-- Keep this import
import AccountTab from '../pages/AccountTab'; // <-- Import the AccountTab component
import UserManagementTab from '../pages/UserManagementTab'; // <-- Import the UserManagementTab component

const TabPanel = ({ children, value, index }) => {
  return value === index ? <Box p={3}>{children}</Box> : null;
};

const AdminTabs = () => {
  const [value, setValue] = useState(0);

  return (
    <Box>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
  <Tab label="Account" />
  <Tab label="TIN Management" />
  <Tab label="User Management" />
  <Tab label="Settings" />
</Tabs>

<TabPanel value={value} index={0}>
  <AccountTab />
</TabPanel>

<TabPanel value={value} index={1}>
  <AdminDashboard />  {/* Your TIN Management */}
</TabPanel>

<TabPanel value={value} index={2}>
  <UserManagementTab />
</TabPanel>

<TabPanel value={value} index={3}>
  Settings content
</TabPanel>

    </Box>
  );
};

export default AdminTabs;
