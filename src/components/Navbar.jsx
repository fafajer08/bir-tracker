import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Layout, Button, Typography, Drawer, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

import logo from '../assets/law-office-logo.png';

const { Header } = Layout;
const { Title } = Typography;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerVisible(false);
  };

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  // Menu items as antd Menu items for Drawer on mobile
  const menuItems = [];

  if (!user) {
    menuItems.push(
      { key: 'login', label: <Link to="/login">Login</Link> },
      { key: 'register', label: <Link to="/register">Register</Link> }
    );
  } else {
    if (user.role === 'admin') {
      menuItems.push({ key: 'admin', label: <Link to="/admin">Admin Dashboard</Link> });
    }
    if (user.role === 'user') {
      menuItems.push({ key: 'user', label: <Link to="/user">User Dashboard</Link> });
    }
    menuItems.push({
      key: 'logout',
      label: <span onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</span>,
    });
  }

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#001529',
        padding: '0 16px',
      }}
    >
      {/* Logo + Title */}
      <Link
        to="/"
        aria-label="R.B Evangelista Law Office Home"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          textDecoration: 'none',
        }}
      >
        <img
          src={logo}
          alt="Law Office Logo"
          style={{ height: 40, marginRight: 12, backgroundColor: 'white', borderRadius: 4 }}
        />
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          R.B Evangelista Law Office
        </Title>
      </Link>

      {/* Desktop menu buttons (hidden on mobile) */}
      <div className="desktop-menu" style={{ display: 'flex', gap: 12 }}>
        {!user && (
          <>
            <Button type="link" style={{ color: 'white' }}>
              <Link to="/login" style={{ color: 'inherit' }}>Login</Link>
            </Button>
            <Button type="link" style={{ color: 'white' }}>
              <Link to="/register" style={{ color: 'inherit' }}>Register</Link>
            </Button>
          </>
        )}

        {user && (
          <>
            {user.role === 'admin' && (
              <Button type="link" style={{ color: 'white' }}>
                <Link to="/admin" style={{ color: 'inherit' }}>Dashboard</Link>
              </Button>
            )}
            {user.role === 'user' && (
              <Button type="link" style={{ color: 'white' }}>
                <Link to="/user" style={{ color: 'inherit' }}>User Dashboard</Link>
              </Button>
            )}
            <Button type="link" onClick={handleLogout} style={{ color: 'white' }}>
              Logout
            </Button>
          </>
        )}
      </div>

      {/* Mobile hamburger menu button (shown on mobile only) */}
      <Button
        className="mobile-menu-button"
        type="text"
        icon={<MenuOutlined style={{ color: 'white', fontSize: 24 }} />}
        onClick={showDrawer}
        style={{ display: 'none' }} // Initially hidden, CSS below will show on mobile
        aria-label="Open menu"
      />

      {/* Drawer menu for mobile */}
      <Drawer
        title={
          <Link to="/" onClick={closeDrawer} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <img
              src={logo}
              alt="Law Office Logo"
              style={{ height: 30, marginRight: 8, backgroundColor: 'white', padding: 2, borderRadius: 3 }}
            />
            <span>R.B Evangelista Law Office</span>
          </Link>
        }
        placement="right"
        onClose={closeDrawer}
        visible={drawerVisible}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          onClick={() => setDrawerVisible(false)}
        />
      </Drawer>

      {/* Responsive CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-menu {
              display: none !important;
            }
            .mobile-menu-button {
              display: inline-block !important;
            }
          }
        `}
      </style>
    </Header>
  );
};

export default Navbar;
