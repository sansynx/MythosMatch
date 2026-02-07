/**
 * Mythos Match - Multiplayer Module
 * WebRTC P2P using PeerJS
 */

const Multiplayer = {
    peer: null,
    connection: null,
    isHost: false,
    roomCode: null,
    isConnected: false,

    init: function() {
        // PeerJS will be loaded from CDN
        if (typeof Peer === 'undefined') {
            console.error('PeerJS not loaded');
            return;
        }
    },

    createRoom: function() {
        // Generate random 6-char room code
        this.roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.isHost = true;

        // Create peer with room code as ID
        this.peer = new Peer(this.roomCode, {
            debug: 0 // Set to 2 for debugging
        });

        this.peer.on('open', (id) => {
            console.log('Room created:', id);
            UI.showRoomCode(id);
            UI.updateConnectionStatus('waiting', 'Waiting for player...');
        });

        this.peer.on('connection', (conn) => {
            this.connection = conn;
            this.setupConnection();
        });

        this.peer.on('error', (err) => {
            console.error('Peer error:', err);
            UI.showToast('Connection error. Please try again.');
        });
    },

    joinRoom: function() {
        const input = document.getElementById('room-code-input');
        const code = input.value.trim().toUpperCase();

        if (!code || code.length < 4) {
            UI.showToast('Please enter a valid room code');
            return;
        }

        this.isHost = false;
        this.roomCode = code;

        // Create peer with random ID
        this.peer = new Peer({
            debug: 0
        });

        this.peer.on('open', (id) => {
            console.log('Connecting to room:', code);
            UI.updateConnectionStatus('connecting', 'Connecting...');
            
            // Connect to host
            this.connection = this.peer.connect(code, {
                reliable: true
            });
            
            this.setupConnection();
        });

        this.peer.on('error', (err) => {
            console.error('Join error:', err);
            UI.showToast('Failed to join. Check the room code.');
            UI.updateConnectionStatus('disconnected', 'Connection failed');
        });
    },

    setupConnection: function() {
        if (!this.connection) return;

        this.connection.on('open', () => {
            console.log('Connected!');
            this.isConnected = true;
            UI.updateConnectionStatus('connected', 'Connected!');
            
            // If guest, request game start
            if (!this.isHost) {
                this.send({ type: 'ready' });
            }
        });

        this.connection.on('data', (data) => {
            this.handleMessage(data);
        });

        this.connection.on('close', () => {
            console.log('Connection closed');
            this.isConnected = false;
            UI.updateConnectionStatus('disconnected', 'Disconnected');
            UI.showToast('Player disconnected');
        });

        this.connection.on('error', (err) => {
            console.error('Connection error:', err);
        });
    },

    send: function(data) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
        }
    },

    handleMessage: function(data) {
        console.log('Received:', data);

        switch(data.type) {
            case 'ready':
                if (this.isHost) {
                    UI.showToast('Player joined! Starting game...');
                    setTimeout(() => {
                        Game.startOnlineMultiplayer(this.isHost);
                    }, 1500);
                }
                break;

            case 'start':
                // Guest receives start signal with seed, grid size, and total cards
                if (data.gridSize) {
                    Game.gridSize = data.gridSize;
                }
                if (data.totalCards) {
                    Game.totalCards = data.totalCards;
                }
                Game.startOnlineMultiplayer(false, data.seed, data.gridSize, data.totalCards);
                break;

            case 'flip':
                Game.handleRemoteFlip(data.index);
                break;

            case 'match':
                Game.handleRemoteMatch(data.indices);
                break;

            case 'mismatch':
                Game.handleRemoteMismatch(data.indices);
                break;

            case 'score':
                Game.updateRemoteScore(data.player, data.score);
                break;
            
            case 'turn':
                Game.handleRemoteTurn(data.activePlayer);
                break;
        }
    },

    copyRoomCode: function() {
        const code = document.getElementById('room-code-text').innerText;
        navigator.clipboard.writeText(code).then(() => {
            UI.showToast('Room code copied!');
        });
    },

    disconnect: function() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
        this.isConnected = false;
        this.isHost = false;
        this.roomCode = null;
        UI.updateConnectionStatus('disconnected', 'Not Connected');
    }
};
