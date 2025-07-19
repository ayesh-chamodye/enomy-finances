import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CurrencyExchange as CurrencyIcon,
  Savings as SavingsIcon,
  AccountCircle as AccountIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  requireAuth: boolean;
}

interface AuthItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => Promise<void>;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', requireAuth: true },
    { text: 'Currency Converter', icon: <CurrencyIcon />, path: '/currency-converter', requireAuth: false },
    { text: 'Savings Calculator', icon: <SavingsIcon />, path: '/savings-calculator', requireAuth: false },
    { text: 'Profile', icon: <AccountIcon />, path: '/profile', requireAuth: true },
  ];

  const authItems: AuthItem[] = currentUser
    ? [{ text: 'Logout', icon: <LoginIcon />, action: handleLogout }]
    : [
        { text: 'Login', icon: <LoginIcon />, path: '/login' },
        { text: 'Register', icon: <RegisterIcon />, path: '/register' },
      ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" component="div">
          Enomy Finances
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems
          .filter(item => !item.requireAuth || (item.requireAuth && currentUser))
          .map((item) => (
            <ListItem 
              key={item.text} 
              component={RouterLink} 
              to={item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
      </List>
      <Divider />
      <List>
        {authItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={item.path ? RouterLink : 'div'}
            to={item.path}
            onClick={item.action}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            Enomy Finances
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              {menuItems
                .filter(item => !item.requireAuth || (item.requireAuth && currentUser))
                .map((item) => (
                  <Button 
                    key={item.text} 
                    color="inherit" 
                    component={RouterLink} 
                    to={item.path}
                    sx={{ 
                      mx: 1,
                      borderBottom: location.pathname === item.path ? '2px solid white' : 'none'
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              
              {currentUser ? (
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/login">
                    Login
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    component={RouterLink} 
                    to="/register"
                    sx={{ ml: 1 }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawer}
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto', 
          backgroundColor: (theme) => theme.palette.grey[200]
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Enomy Finances. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
