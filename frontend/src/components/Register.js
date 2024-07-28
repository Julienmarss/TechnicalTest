import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SocialAuthButtons from './SocialAuthButtons';

function Register({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:3001/auth/register', { email, password });
            setUser(response.data);
            navigate('/chat');
        } catch (error) {
            console.error('Registration failed:', error);
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = () => {
        if (error) setError('');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4">Register</Typography>
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                <Box component="form" onSubmit={handleRegister} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); handleInputChange(); }}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
                        margin="normal"
                        required
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Register'}
                    </Button>
                    <SocialAuthButtons />
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleLoginClick}
                        sx={{ mt: 2 }}
                    >
                        Back to Login
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default Register;