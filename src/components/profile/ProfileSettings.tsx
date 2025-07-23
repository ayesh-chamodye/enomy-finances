import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';

interface UserProfile {
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: string;
}

const ProfileSettings: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        let profileData: UserProfile;
        
        if (userSnap.exists()) {
          profileData = userSnap.data() as UserProfile;
        } else {
          // Create a basic profile if none exists
          profileData = {
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            phoneNumber: currentUser.phoneNumber || '',
            createdAt: new Date().toISOString()
          };
        }
        
        setUserProfile(profileData);
        setFormData({
          displayName: profileData.displayName || '',
          email: profileData.email || '',
          phoneNumber: profileData.phoneNumber || ''
        });
        
        if (profileData.photoURL) {
          setPreviewUrl(profileData.photoURL);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        showNotification('Error loading profile data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (): Promise<string | undefined> => {
    if (!selectedFile || !currentUser) return undefined;
    
    try {
      setUploadingImage(true);
      // Using ImgBB free API for image uploads
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Note: In a production app, you would want to use environment variables for the API key
      // This is a free API key with limited usage
      const response = await fetch('https://api.imgbb.com/1/upload?key=80087d0b833fae000f242439638b5b66', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Get current photoURL or undefined
      let photoURL: string | undefined = userProfile?.photoURL;
      
      // Upload new profile picture if selected
      if (selectedFile) {
        try {
          photoURL = await uploadProfilePicture();
        } catch (error) {
          showNotification('Failed to upload profile picture. Using previous image.', 'error');
          // Continue with the update even if image upload fails
        }
      }
      
      // Update profile in Firestore
      await updateDoc(userRef, {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        ...(photoURL ? { photoURL } : {})
      });
      
      // Update email if changed
      if (formData.email !== currentUser.email && currentPassword) {
        const credential = EmailAuthProvider.credential(
          currentUser.email!,
          currentPassword
        );
        
        await reauthenticateWithCredential(currentUser, credential);
        await updateEmail(currentUser, formData.email);
      }
      
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentUser || !currentPassword || !newPassword) return;
    
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      showNotification('Password updated successfully', 'success');
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification('Error updating password. Please check your current password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          color="primary" 
          onClick={() => navigate('/profile')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Profile Settings
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={4}>
          {/* Profile Picture Section */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={previewUrl || ''} 
                alt={formData.displayName || 'User'} 
                sx={{ width: 150, height: 150, mb: 2, bgcolor: 'primary.main' }}
              >
                {!previewUrl && <PersonIcon sx={{ fontSize: 80 }} />}
              </Avatar>
              <Tooltip title="Upload profile picture (uses free ImgBB service)">
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 10, 
                    right: 0, 
                    backgroundColor: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.dark' },
                    color: 'white'
                  }}
                  component="label"
                  disabled={uploadingImage}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleFileChange}
                  />
                  {uploadingImage ? <CircularProgress size={24} color="inherit" /> : <PhotoCameraIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click the camera icon to change your profile picture
            </Typography>
          </Grid>
          
          {/* Profile Information Section */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  helperText="Changing email requires your current password"
                />
              </Grid>
              
              {formData.email !== userProfile?.email && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    variant="outlined"
                    required
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  fullWidth
                >
                  {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
            
            {/* Password Change Section */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleChangePassword}
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                  fullWidth
                >
                  {saving ? <CircularProgress size={24} /> : 'Update Password'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfileSettings;
