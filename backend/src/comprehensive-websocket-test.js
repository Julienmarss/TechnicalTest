// finalized-websocket-test.js
const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:3000';
let user1Token, user2Token, user1Id, user2Id;

async function setupUsers() {
    try {
        console.log('Setting up users...');
        const user1 = await axios.post(`${API_URL}/auth/register`, { email: 'user1@example.com', password: 'password123' });
        const user2 = await axios.post(`${API_URL}/auth/register`, { email: 'user2@example.com', password: 'password123' });

        user1Token = user1.data.access_token;
        user2Token = user2.data.access_token;

        user1Id = JSON.parse(atob(user1Token.split('.')[1])).sub;
        user2Id = JSON.parse(atob(user2Token.split('.')[1])).sub;

        console.log('Users created and authenticated');
        console.log('User 1 ID:', user1Id);
        console.log('User 2 ID:', user2Id);
    } catch (error) {
        console.error('Error setting up users:', error.message);
        throw error;
    }
}

function createSocketClient(token, clientName) {
    console.log(`Creating ${clientName} socket...`);
    const socket = io(API_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: false
    });

    socket.on('connect', () => console.log(`${clientName} connected`));
    socket.on('connect_error', (error) => console.error(`${clientName} connection error:`, error.message));
    socket.on('error', (error) => console.error(`${clientName} error:`, error.message));

    return socket;
}

function emitWithPromise(socket, event, data) {
    return new Promise((resolve) => {
        socket.emit(event, data, resolve);
    });
}

async function runTests() {
    try {
        await setupUsers();

        const client1 = createSocketClient(user1Token, 'Client 1');
        const client2 = createSocketClient(user2Token, 'Client 2');

        await Promise.all([
            new Promise(resolve => client1.on('connect', resolve)),
            new Promise(resolve => client2.on('connect', resolve))
        ]);
        console.log('Both clients connected successfully');

        // Join room
        await Promise.all([
            emitWithPromise(client1, 'joinRoom', { roomId: 'testRoom' }),
            emitWithPromise(client2, 'joinRoom', { roomId: 'testRoom' })
        ]);
        console.log('Both clients joined the room');

        // Send messages
        const [response1, response2] = await Promise.all([
            emitWithPromise(client1, 'sendMessage', { content: 'Hello from User 1', receiverId: user2Id }),
            emitWithPromise(client2, 'sendMessage', { content: 'Hello from User 2', receiverId: user1Id })
        ]);
        console.log('Message sent from Client 1, response:', response1);
        console.log('Message sent from Client 2, response:', response2);

        // Leave room
        await Promise.all([
            emitWithPromise(client1, 'leaveRoom', { roomId: 'testRoom' }),
            emitWithPromise(client2, 'leaveRoom', { roomId: 'testRoom' })
        ]);
        console.log('Both clients left the room');

        // Cleanup
        client1.disconnect();
        client2.disconnect();
        console.log('Test completed, all clients disconnected');
    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        // Force exit after 2 seconds
        setTimeout(() => {
            console.log('Forcing exit...');
            process.exit(0);
        }, 2000);
    }
}

runTests().catch(console.error);