import React from 'react';
import { Button, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const SocialAuthButtons = () => {
    const handleGoogleAuth = () => {
        window.location.href = 'http://localhost:3001/auth/google';
    };

    const handleLinkedInAuth = () => {
        window.location.href = 'http://localhost:3001/auth/linkedin';
    };

    return (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleAuth}
            >
                Connexion avec Google
            </Button>
            <Button
                fullWidth
                variant="outlined"
                startIcon={<LinkedInIcon />}
                onClick={handleLinkedInAuth}
            >
                Connexion avec LinkedIn
            </Button>
        </Box>
    );
};

export default SocialAuthButtons;