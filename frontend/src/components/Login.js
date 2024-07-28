import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SocialAuthButtons from './SocialAuthButtons';

function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:3001/auth/login', { email, password });
            setUser(response.data);
            navigate('/chat');
        } catch (error) {
            console.error('Login failed:', error);
            if (error.response && error.response.status === 401) {
                setError('Invalid email or password. Please try again.');
            } else {
                setError('An error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = () => {
        if (error) setError('');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4">Login</Typography>
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
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
                        {isLoading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                    <SocialAuthButtons />
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleRegisterClick}
                        sx={{ mt: 2 }}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default Login;