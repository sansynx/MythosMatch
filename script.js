/**
 * Mythos Match Game Logic - Refactored
 */

const Game = {
    // Config
    state: 'MENU', 
    mode: 'solo', 
    gridSize: { rows: 4, cols: 4, total: 16 },
    totalCards: 16,
    boardSeed: null,
    myPlayerNumber: 1, // For online mode: 1 if host, 2 if guest
    
    // Game variables
    cards: [], 
    flippedCards: [],
    matchedPairs: 0,
    isLocked: false,
    
    // Scoring
    scores: { p1: 100, p2: 100 },
    activePlayer: 1, 

    // Content Mapping - English Alphabets (Capital & Small) with Roman Numerals
    cardContent: [
        { l: 'A', n: 'I' }, { l: 'a', n: 'I' }, 
        { l: 'B', n: 'II' }, { l: 'b', n: 'II' }, 
        { l: 'C', n: 'III' }, { l: 'c', n: 'III' }, 
        { l: 'D', n: 'IV' }, { l: 'd', n: 'IV' }, 
        { l: 'E', n: 'V' }, { l: 'e', n: 'V' }, 
        { l: 'F', n: 'VI' }, { l: 'f', n: 'VI' }, 
        { l: 'G', n: 'VII' }, { l: 'g', n: 'VII' }, 
        { l: 'H', n: 'VIII' }, { l: 'h', n: 'VIII' }, 
        { l: 'I', n: 'IX' }, { l: 'i', n: 'IX' }, 
        { l: 'J', n: 'X' }, { l: 'j', n: 'X' }, 
        { l: 'K', n: 'XI' }, { l: 'k', n: 'XI' }, 
        { l: 'L', n: 'XII' }, { l: 'l', n: 'XII' }, 
        { l: 'M', n: 'XIII' }, { l: 'm', n: 'XIII' }, 
        { l: 'N', n: 'XIV' }, { l: 'n', n: 'XIV' }, 
        { l: 'O', n: 'XV' }, { l: 'o', n: 'XV' }, 
        { l: 'P', n: 'XVI' }, { l: 'p', n: 'XVI' }, 
        { l: 'Q', n: 'XVII' }, { l: 'q', n: 'XVII' }, 
        { l: 'R', n: 'XVIII' }, { l: 'r', n: 'XVIII' }, 
        { l: 'S', n: 'XIX' }, { l: 's', n: 'XIX' }, 
        { l: 'T', n: 'XX' }, { l: 't', n: 'XX' }, 
        { l: 'U', n: 'XXI' }, { l: 'u', n: 'XXI' }, 
        { l: 'V', n: 'XXII' }, { l: 'v', n: 'XXII' }, 
        { l: 'W', n: 'XXIII' }, { l: 'w', n: 'XXIII' }, 
        { l: 'X', n: 'XXIV' }, { l: 'x', n: 'XXIV' },
        { l: 'Y', n: 'XXV' }, { l: 'y', n: 'XXV' }, 
        { l: 'Z', n: 'XXVI' }, { l: 'z', n: 'XXVI' }
    ],

    init: function() {
        // No auto-start from URL params anymore
        console.log('Mythos Match initialized');
    },

    startFromSetup: function() {
        const selectedMode = this.mode;
        const cardCountInput = document.getElementById('card-count-input');
        const totalCards = parseInt(cardCountInput.value);
        
        // Validate input
        if (!totalCards || totalCards < 4 || totalCards % 2 !== 0) {
            UI.showToast('Please enter an even number of cards (minimum 4)');
            return;
        }
        
        if (totalCards > 104) {
            UI.showToast('Maximum 104 cards allowed');
            return;
        }
        
        // Calculate grid dimensions
        const gridDimensions = this.calculateGridSize(totalCards);
        this.gridSize = gridDimensions;
        this.totalCards = totalCards;

        if (selectedMode === 'online') {
            // Update grid display
            const gridDisplay = document.getElementById('selected-grid-display');
            if (gridDisplay) {
                gridDisplay.innerText = `${gridDimensions.rows}x${gridDimensions.cols} (${totalCards} cards)`;
            }
            // Show room screen for online mode
            UI.showScreen('multiplayer-room-screen');
        } else {
            // Start solo or local multiplayer directly
            this.start(selectedMode);
        }
    },
    
    calculateGridSize: function(totalCards) {
        // Calculate optimal grid dimensions
        const sqrt = Math.sqrt(totalCards);
        let rows, cols;
        
        if (Number.isInteger(sqrt)) {
            // Perfect square
            rows = cols = sqrt;
        } else {
            // Find closest factors
            cols = Math.ceil(sqrt);
            rows = Math.ceil(totalCards / cols);
        }
        
        return { rows, cols, total: totalCards };
    },

    start: function(mode) {
        this.mode = mode;
        this.resetGame();
        UI.showGameScreen();
        this.generateBoard();
    },

    startOnlineMultiplayer: function(isHost, seed = null, receivedGridSize = null, receivedTotalCards = null) {
        this.mode = 'online';
        this.myPlayerNumber = isHost ? 1 : 2; // Host is P1, Guest is P2
        
        if (isHost) {
            this.boardSeed = Date.now();
            Multiplayer.send({ 
                type: 'start', 
                seed: this.boardSeed,
                gridSize: this.gridSize,
                totalCards: this.totalCards
            });
        } else {
            this.boardSeed = seed;
            if (receivedGridSize) this.gridSize = receivedGridSize;
            if (receivedTotalCards) this.totalCards = receivedTotalCards;
        }

        this.resetGame();
        UI.showGameScreen();
        this.generateBoard();
        
        // Show player role notification
        setTimeout(() => {
            const role = this.myPlayerNumber === 1 ? 'Player 1 (Host)' : 'Player 2 (Guest)';
            UI.showToast(`You are ${role}`);
        }, 500);
    },

    resetGame: function() {
        this.state = 'PLAYING';
        this.scores.p1 = 100;
        this.scores.p2 = 100;
        this.activePlayer = 1;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.isLocked = false;
        
        UI.updateScores();
        UI.updateTurnIndicator();
    },

    generateBoard: function() {
        console.log('=== GENERATING BOARD ===');
        console.log('Total cards:', this.totalCards);
        console.log('Grid size:', this.gridSize);
        
        const board = document.getElementById('game-board');
        const count = this.totalCards || (this.gridSize.rows * this.gridSize.cols);
        this.totalCards = count; // Ensure totalCards is set
        const pairs = count / 2;
        
        console.log('Pairs needed:', pairs);
        console.log('First 5 cards in cardContent:', this.cardContent.slice(0, 5));
        
        let selected = this.cardContent.slice(0, pairs);
        console.log('Selected cards:', selected);
        
        let deck = [...selected, ...selected];
        deck = this.shuffle(deck);
        
        console.log('Shuffled deck (first 10):', deck.slice(0, 10));
        
        board.innerHTML = '';
        
        // Set dynamic grid layout
        const { rows, cols } = this.gridSize;
        board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        board.className = 'game-grid-dynamic';
        
        deck.forEach((item, index) => {
            console.log(`Creating card ${index}: letter="${item.l}", numeral="${item.n}"`);
            
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.symbol = item.l;
            card.dataset.index = index;
            
            const front = document.createElement('div');
            front.className = 'card-face card-front';
            
            const back = document.createElement('div');
            back.className = 'card-face card-back';
            
            // Determine if uppercase or lowercase and add label
            const isUpper = item.l === item.l.toUpperCase();
            back.dataset.letterCase = isUpper ? 'upper' : 'lower';
            back.dataset.letterType = isUpper ? 'Capital' : 'Small';
            
            back.innerHTML = `
                <div class="card-symbol">${item.l}</div>
                <div class="card-name">${item.n}</div>
            `;
            
            card.appendChild(front);
            card.appendChild(back);
            card.addEventListener('click', () => this.handleCardClick(card));
            
            board.appendChild(card);
        });
    },

    shuffle: function(array) {
        if (this.mode === 'online' && this.boardSeed) {
            let seed = this.boardSeed;
            const seededRandom = () => {
                seed = (seed * 9301 + 49297) % 233280;
                return seed / 233280;
            };
            
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(seededRandom() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        } else {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        return array;
    },

    handleCardClick: function(card) {
        if (this.isLocked) return;
        if (card.classList.contains('flipped')) return; 
        if (card.classList.contains('matched')) return;
        
        // Prevent clicking the same card twice
        if (this.flippedCards.includes(card)) {
            console.log('Same card clicked twice!');
            return;
        }
        
        // CRITICAL: In online mode, only allow current player to play
        if (this.mode === 'online' && this.activePlayer !== this.myPlayerNumber) {
            UI.showToast("Not your turn!");
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        console.log('Card clicked:', card.dataset.symbol, 'Index:', card.dataset.index);
        console.log('Flipped cards count:', this.flippedCards.length);

        if (this.mode === 'online' && Multiplayer.isConnected) {
            Multiplayer.send({
                type: 'flip',
                index: parseInt(card.dataset.index)
            });
        }

        if (this.flippedCards.length === 2) {
            this.checkForMatch();
        }
    },

    checkForMatch: function() {
        this.isLocked = true;
        const [card1, card2] = this.flippedCards;
        
        console.log('Card 1 symbol:', card1.dataset.symbol);
        console.log('Card 2 symbol:', card2.dataset.symbol);
        console.log('Match?', card1.dataset.symbol === card2.dataset.symbol);
        
        const match = card1.dataset.symbol === card2.dataset.symbol;

        if (match) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    },

    handleMatch: function(card1, card2) {
        const idx1 = parseInt(card1.dataset.index);
        const idx2 = parseInt(card2.dataset.index);
        
        // Sync match to other player
        if (this.mode === 'online' && Multiplayer.isConnected) {
            Multiplayer.send({
                type: 'match',
                indices: [idx1, idx2]
            });
        }
        
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.flippedCards = [];
            this.isLocked = false;
            this.matchedPairs++;
            
            console.log(`Matched pairs: ${this.matchedPairs}, Total pairs needed: ${this.totalCards / 2}`);
            
            if (this.matchedPairs === this.totalCards / 2) {
                console.log('Game complete! Showing results...');
                this.endGame(true);
            }
        }, 500);
    },

    handleMismatch: function(card1, card2) {
        const idx1 = parseInt(card1.dataset.index);
        const idx2 = parseInt(card2.dataset.index);
        
        setTimeout(() => {
            this.deductScore();
            card1.classList.add('shake');
            card2.classList.add('shake');
            
            // Sync mismatch to other player
            if (this.mode === 'online' && Multiplayer.isConnected) {
                Multiplayer.send({
                    type: 'mismatch',
                    indices: [idx1, idx2]
                });
            }
            
            setTimeout(() => {
                card1.classList.remove('flipped', 'shake');
                card2.classList.remove('flipped', 'shake');
                this.flippedCards = [];
                this.isLocked = false;
                
                if (this.mode === 'multi' || this.mode === 'online') {
                    // Check if either player has reached 0 or below
                    if (this.scores.p1 <= 0 || this.scores.p2 <= 0) {
                        this.endGame(true); // End game, winner determined by score
                    } else {
                        this.switchTurn();
                    }
                } else if (this.scores.p1 <= 0) {
                     this.endGame(false);
                }
            }, 500);
        }, 800);
    },

    deductScore: function() {
        const playerKey = 'p' + this.activePlayer;
        this.scores[playerKey] -= 4;
        UI.updateScores();
        
        // Sync score to other player in online mode
        if (this.mode === 'online' && Multiplayer.isConnected) {
            Multiplayer.send({
                type: 'score',
                player: this.activePlayer,
                score: this.scores[playerKey]
            });
        }
    },

    switchTurn: function() {
        this.activePlayer = this.activePlayer === 1 ? 2 : 1;
        UI.updateTurnIndicator();
        
        // Sync turn change in online mode
        if (this.mode === 'online' && Multiplayer.isConnected) {
            Multiplayer.send({
                type: 'turn',
                activePlayer: this.activePlayer
            });
        }
    },

    endGame: function(win) {
        console.log('endGame called with win:', win);
        console.log('Current mode:', this.mode);
        console.log('Scores:', this.scores);
        
        let title = win ? "Victory!" : "Defeat";
        let message = win ? "You have proven your worth to Olympus." : "The mists of oblivion have taken you.";
        let scoreText = `Score: ${this.scores.p1}`;

        if (this.mode === 'multi' || this.mode === 'online') {
            if (this.scores.p1 > this.scores.p2) {
                title = "Player 1 Wins!";
                message = "A legendary performance.";
            } else if (this.scores.p2 > this.scores.p1) {
                title = "Player 2 Wins!";
                message = "The underdog triumphs.";
            } else {
                title = "It is a Draw!";
                message = "Perfectly balanced, as all things should be.";
            }
            scoreText = `${this.scores.p1} - ${this.scores.p2}`;
        }

        console.log('Showing result:', title, message, scoreText);
        
        setTimeout(() => {
            UI.showResult(title, message, scoreText);
        }, 500);
    },

    quit: function() {
        // Show confirmation dialog
        const confirmQuit = confirm('Are you sure you want to quit the game? Your progress will be lost.');
        
        if (!confirmQuit) {
            return; // User cancelled
        }
        
        if (this.mode === 'online') {
            Multiplayer.disconnect();
        }
        
        // Reset game state
        this.state = 'MENU';
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.isLocked = false;
        
        UI.showScreen('menu-screen');
    },
    
    restart: function() {
        this.start(this.mode);
    },

    // Online Multiplayer Remote Handlers
    handleRemoteFlip: function(index) {
        const cards = document.querySelectorAll('.card');
        const card = cards[index];
        if (card && !card.classList.contains('flipped')) {
            card.classList.add('flipped');
        }
    },

    handleRemoteMatch: function(indices) {
        setTimeout(() => {
            indices.forEach(idx => {
                const cards = document.querySelectorAll('.card');
                if (cards[idx]) {
                    cards[idx].classList.add('matched');
                }
            });
            this.matchedPairs++;
            this.flippedCards = [];
            this.isLocked = false;
            
            if (this.matchedPairs === this.totalCards / 2) {
                this.endGame(true);
            }
        }, 500);
    },

    handleRemoteMismatch: function(indices) {
        setTimeout(() => {
            // Add shake animation
            indices.forEach(idx => {
                const cards = document.querySelectorAll('.card');
                if (cards[idx]) {
                    cards[idx].classList.add('shake');
                }
            });
            
            // Remove flipped and shake after animation
            setTimeout(() => {
                indices.forEach(idx => {
                    const cards = document.querySelectorAll('.card');
                    if (cards[idx]) {
                        cards[idx].classList.remove('flipped', 'shake');
                    }
                });
                this.flippedCards = [];
                this.isLocked = false;
            }, 500);
        }, 800);
    },

    updateRemoteScore: function(player, score) {
        const playerKey = 'p' + player;
        this.scores[playerKey] = score;
        UI.updateScores();
    },
    
    handleRemoteTurn: function(activePlayer) {
        this.activePlayer = activePlayer;
        UI.updateTurnIndicator();
    }
};

const UI = {
    showScreen: function(screenId) {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        
        const target = document.getElementById(screenId);
        target.classList.remove('hidden');
        setTimeout(() => target.classList.add('active'), 10);
    },

    showModeSetup: function(mode) {
        Game.mode = mode;
        
        const titles = {
            'solo': 'Solo Odyssey - Enter Card Count',
            'multi': 'Duel of Fates - Enter Card Count',
            'online': 'Online Multiplayer - Enter Card Count'
        };
        
        document.getElementById('mode-title').innerText = titles[mode];
        
        // Reset card count input
        const cardCountInput = document.getElementById('card-count-input');
        cardCountInput.value = 16;
        document.getElementById('card-count-error').style.display = 'none';
        document.getElementById('grid-preview').textContent = 'Grid Size: 4x4';
        document.getElementById('grid-preview').style.display = 'block';
        
        this.showScreen('mode-setup-screen');
    },

    backToModeSetup: function() {
        if (Game.mode === 'online') {
            this.showScreen('mode-setup-screen');
        }
    },

    showGameScreen: function() {
        this.showScreen('game-screen');
        const hud = document.querySelector('.game-hud');
        const p1Box = document.getElementById('player1-score-box');
        const p1Label = p1Box.querySelector('.label');
        const p2Box = document.getElementById('player2-score-box');
        const p1TurnInd = document.getElementById('p1-turn-indicator');
        const p2TurnInd = document.getElementById('p2-turn-indicator');
        
        // Reset
        p1Box.classList.remove('active-turn');
        p2Box.classList.remove('active-turn');
        p1TurnInd.classList.remove('active');
        p2TurnInd.classList.remove('active');
        
        if (Game.mode === 'multi' || Game.mode === 'online') {
            hud.classList.remove('solo');
            p1Label.innerText = "P1";
            p2Box.classList.remove('hidden');
            // Show P1's turn initially
            p1TurnInd.classList.add('active');
        } else {
            // SOLO MODE
            hud.classList.add('solo');
            p1Label.innerText = "SCORE";
            p2Box.classList.add('hidden');
        }
    },

    updateScores: function() {
        document.getElementById('score-p1').innerText = Game.scores.p1;
        document.getElementById('score-p2').innerText = Game.scores.p2;
    },

    updateTurnIndicator: function() {
        const p1Box = document.getElementById('player1-score-box');
        const p2Box = document.getElementById('player2-score-box');
        const p1TurnInd = document.getElementById('p1-turn-indicator');
        const p2TurnInd = document.getElementById('p2-turn-indicator');
        
        if (Game.activePlayer === 1) {
            p1Box.classList.add('active-turn');
            p2Box.classList.remove('active-turn');
            p1TurnInd.classList.add('active');
            p2TurnInd.classList.remove('active');
        } else {
            p1Box.classList.remove('active-turn');
            p2Box.classList.add('active-turn');
            p1TurnInd.classList.remove('active');
            p2TurnInd.classList.add('active');
        }
    },

    showResult: function(title, message, score) {
        console.log('showResult called:', title, message, score);
        document.getElementById('result-title').innerText = title;
        document.getElementById('result-message').innerText = message;
        document.getElementById('final-score-display').innerText = score;
        console.log('Showing result screen...');
        this.showScreen('result-screen');
    },

    validateCardCount: function() {
        const input = document.getElementById('card-count-input');
        const value = parseInt(input.value);
        const errorMsg = document.getElementById('card-count-error');
        
        if (!value || value < 4) {
            errorMsg.textContent = 'Minimum 4 cards required';
            errorMsg.style.display = 'block';
            return false;
        } else if (value % 2 !== 0) {
            errorMsg.textContent = 'Must be an even number';
            errorMsg.style.display = 'block';
            return false;
        } else if (value > 52) {
            errorMsg.textContent = 'Maximum 52 cards allowed';
            errorMsg.style.display = 'block';
            return false;
        } else {
            errorMsg.style.display = 'none';
            return true;
        }
    },

    validateCardCount: function() {
        const input = document.getElementById('card-count-input');
        const value = parseInt(input.value);
        const errorMsg = document.getElementById('card-count-error');
        const gridPreview = document.getElementById('grid-preview');
        
        if (!value || value < 4) {
            errorMsg.textContent = 'Minimum 4 cards required';
            errorMsg.style.display = 'block';
            gridPreview.style.display = 'none';
            return false;
        } else if (value % 2 !== 0) {
            errorMsg.textContent = 'Must be an even number';
            errorMsg.style.display = 'block';
            gridPreview.style.display = 'none';
            return false;
        } else if (value > 104) {
            errorMsg.textContent = 'Maximum 104 cards allowed';
            errorMsg.style.display = 'block';
            gridPreview.style.display = 'none';
            return false;
        } else {
            errorMsg.style.display = 'none';
            gridPreview.style.display = 'block';
            
            // Calculate and show grid preview
            const gridDimensions = Game.calculateGridSize(value);
            gridPreview.textContent = `Grid Size: ${gridDimensions.rows}x${gridDimensions.cols}`;
            return true;
        }
    },

    showToast: function(msg) {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    },

    showRoomCode: function(code) {
        const display = document.getElementById('room-code-display');
        const codeText = document.getElementById('room-code-text');
        const copyBtn = document.getElementById('copy-room-btn');
        
        codeText.innerText = code;
        display.classList.remove('hidden');
        copyBtn.disabled = false; // Enable copy button
    },

    updateConnectionStatus: function(status, text) {
        const statusEl = document.getElementById('connection-status');
        const textEl = statusEl.querySelector('.status-text');
        const indicator = statusEl.querySelector('.status-indicator');
        
        textEl.innerText = text;
        statusEl.className = 'connection-status ' + status;
        indicator.className = 'status-indicator ' + status;
    }
};

window.onload = function() {
    Game.init();
    Multiplayer.init();
    
    // Add keyboard shortcut for quit (ESC key)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && Game.state === 'PLAYING') {
            Game.quit();
        }
    });
};
