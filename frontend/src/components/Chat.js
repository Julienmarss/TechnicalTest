import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Grid, List, ListItem, ListItemText, TextField, Button, Typography, Paper, Snackbar } from '@mui/material';
import io from 'socket.io-client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Chat({ user }) {
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const decodedToken = jwtDecode(user.access_token);
        setCurrentUserId(decodedToken.sub);
        console.log('UserID:', decodedToken.sub);
    }, [user.access_token]);

    const fetchMessages = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:3001/messages`, {
                headers: { Authorization: `Bearer ${user.access_token}` }
            });
            console.log('Fetched all messages:', response.data);
            setMessages(response.data);
        } catch (error) {
            console.error('Recherche des users invalide:', error);
            setError('Recherche des users invalide');
        }
    }, [user.access_token]);

    useEffect(() => {
        fetchMessages();
        const intervalId = setInterval(fetchMessages, 5000); // Refresh messages every 5 seconds
        return () => clearInterval(intervalId);
    }, [fetchMessages]);

    useEffect(() => {
        const newSocket = io('http://localhost:3001', {
            auth: { token: user.access_token },
            transports: ['websocket']
        });

        newSocket.on('connect', () => {
            console.log('Connexion au WebSocket');
        });

        newSocket.on('newMessage', (msg) => {
            console.log('Nouveau message reçu:', msg);
            setMessages(prevMessages => [...prevMessages, msg]);
        });

        newSocket.on('error', (error) => {
            console.error('WebSocket erreur:', error);
            setError('WebSocket erreur');
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [user.access_token]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/users', {
                    headers: { Authorization: `Bearer ${user.access_token}` }
                });
                const filteredUsers = response.data.filter(u => u.id !== currentUserId);
                setUsers(filteredUsers);
            } catch (error) {
                console.error('Recherche du user failed:', error);
                setError('Recherche des users invalide');
            }
        };

        if (currentUserId) {
            fetchUsers();
        }
    }, [user.access_token, currentUserId]);

    const selectUser = (selectedUser) => {
        console.log('Selecting user:', selectedUser);
        if (selectedUser.id === currentUserId) {
            setError("Tu peux pas t'envoyer un message à toi imbécile...");
            return;
        }
        setSelectedUser(selectedUser);
        setError(null);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (message && socket && selectedUser && selectedUser.id !== currentUserId) {
            console.log(`Message envoyé à ${selectedUser.id}: ${message}`);
            const newMessage = {
                content: message,
                receiverId: selectedUser.id,
            };
            socket.emit('sendMessage', newMessage, (response) => {
                if (response.error) {
                    console.error('Erreur dans lenvoie du message:', response.error);
                    setError(response.error);
                } else {
                    console.log('Message envoyé avec succès:', response);
                    setMessages(prevMessages => [...prevMessages, response]);
                    setError(null);
                }
            });
            setMessage('');
        } else {
            setError('Erreur message vide.');
        }
    };

    const filteredMessages = messages.filter(msg =>
        (msg.senderId === currentUserId && msg.receiverId === selectedUser?.id) ||
        (msg.senderId === selectedUser?.id && msg.receiverId === currentUserId)
    );

    return (
        <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
            <Grid container sx={{ height: '100%' }}>
                <Grid item xs={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
                    <List sx={{ height: '100%', overflow: 'auto' }}>
                        {users.map((otherUser) => (
                            <ListItem
                                button
                                key={otherUser.id}
                                onClick={() => selectUser(otherUser)}
                                selected={selectedUser?.id === otherUser.id}
                            >
                                <ListItemText
                                    primary={otherUser.email}
                                    secondary={
                                        messages.filter(m =>
                                            (m.senderId === currentUserId && m.receiverId === otherUser.id) ||
                                            (m.senderId === otherUser.id && m.receiverId === currentUserId)
                                        ).length > 0 ? 'Has messages' : 'No messages'
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={9} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {selectedUser ? (
                        <>
                            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                Chat with {selectedUser.email}
                            </Typography>
                            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                                {filteredMessages.map((msg, index) => (
                                    <Paper
                                        key={msg.id || index}
                                        sx={{
                                            p: 1,
                                            mb: 1,
                                            maxWidth: '70%',
                                            ml: msg.senderId === currentUserId ? 'auto' : 0,
                                            backgroundColor: msg.senderId === currentUserId ? 'primary.light' : 'grey.100'
                                        }}
                                    >
                                        <Typography variant="body1">{msg.content}</Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </Typography>
                                    </Paper>
                                ))}
                                <div ref={messagesEndRef} />
                            </Box>
                            <Box component="form" onSubmit={sendMessage} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                <TextField
                                    fullWidth
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message"
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                />
                                <Button type="submit" variant="contained" sx={{ mt: 1 }}>Send</Button>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography variant="h6">Select a user to start chatting</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                message={error}
            />
        </Box>
    );
}

export default Chat;