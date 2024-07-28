const axios = require('axios');
const io = require('socket.io-client');

const API_URL = 'http://localhost:3000';
let authToken;

async function runTests() {
    try {
        console.log('Test d\'enregistrement...');
        const registerResponse = await axios.post(`${API_URL}/auth/register`, {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('Enregistrement réussi:', registerResponse.data);

        // Test de connexion
        console.log('Test de connexion...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        authToken = loginResponse.data.access_token;
        console.log('Connexion réussie. Token JWT:', authToken);

        // Test de récupération des utilisateurs
        console.log('Test de récupération des utilisateurs...');
        const usersResponse = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Utilisateurs récupérés:', usersResponse.data);

        // Test WebSocket
        console.log('Test de connexion WebSocket...');
        const socket = io(API_URL, {
            auth: {
                token: authToken
            }
        });

        socket.on('connect', () => {
            console.log('Connecté au serveur WebSocket');
            socket.emit('sendMessage', { content: 'Test message', receiverId: 'someUserId' });
        });

        socket.on('newMessage', (message) => {
            console.log('Nouveau message reçu:', message);
            socket.disconnect();
        });

        socket.on('connect_error', (error) => {
            console.error('Erreur de connexion WebSocket:', error.message);
        });

    } catch (error) {
        console.error('Erreur lors des tests:', error.response ? error.response.data : error.message);
    }
}

runTests();