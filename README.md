# Mythos Match

A memory card matching game with three distinct game modes: Solo, Local Multiplayer, and Online Multiplayer via WebRTC peer-to-peer connections. The game features English alphabets (both capital and small letters) paired with Roman numerals and supports dynamic grid sizes based on user input.

## Introduction

Mythos Match is a browser-based memory card game that challenges players to match pairs of cards displaying English alphabets with their corresponding Roman numerals. The game features a sophisticated scoring system where players start with 100 points and lose 4 points for each incorrect match.

### Key Features

- **Dynamic Grid Size**: Players can input any even number of cards (4-104), and the game automatically calculates the optimal grid dimensions
- **52 Unique Cards**: Features both capital letters (A-Z) and small letters (a-z), each paired with Roman numerals (I-XXVI)
- **Clear Visual Distinction**: Cards display "Capital" or "Small" labels above letters to prevent confusion
- **Three Game Modes**: Solo, Local Multiplayer, and Online Multiplayer
- **Enhanced Quit Button**: Modern design with confirmation dialog and ESC key shortcut
- **Responsive Design**: Works seamlessly on desktop and mobile devices

The game is built with vanilla JavaScript, HTML5, and CSS3, utilizing modern web technologies including WebRTC for real-time multiplayer functionality.

## Project Structure

```
MythosMatch/
├── index.html                  # Main HTML structure
├── script.js                   # Core game logic and UI management
├── style.css                   # Main styling and responsive design
├── multiplayer.js              # WebRTC P2P multiplayer module
├── multiplayer-styles.css      # Multiplayer-specific styling
├── assets/
│   ├── card-back.png          # Card back design
│   ├── card-front-texture.png # Card front texture
│   ├── dark_greek_background.png # Game background
│   └── favicon.png            # Browser favicon
└── README.md                   # Project documentation
```

### File Descriptions

**index.html**
- Contains the complete DOM structure for all game screens
- Implements screen-based navigation (menu, mode setup, game, multiplayer room, results)
- Includes game HUD with score displays and turn indicators
- Responsive grid layout for card display

**script.js**
- Main game logic controller (Game object)
- UI management system (UI object)
- Card generation and shuffling algorithms
- Match/mismatch detection and scoring
- Turn-based gameplay mechanics
- Remote event handlers for online multiplayer
- Dynamic grid size calculation

**style.css**
- Modern visual design with glass-morphism effects
- Responsive layouts for mobile and desktop
- Card flip animations and transitions
- Enhanced quit button styling
- Dynamic grid support
- Mobile-first responsive breakpoints

**multiplayer.js**
- PeerJS-based WebRTC implementation
- Room creation and joining functionality
- P2P connection management
- Message passing system for game state synchronization
- Connection status handling

**multiplayer-styles.css**
- Multiplayer lobby interface styling
- Room code display and copy functionality
- Connection status indicators
- Responsive multiplayer UI elements

## Game Modes

### 1. Solo Odyssey
Single-player mode where the player attempts to match all pairs while maintaining the highest score possible. The game ends when all pairs are matched or when the score reaches zero.

### 2. Duel of Fates (Local Multiplayer)
Two players take turns on the same device. Players alternate turns after each mismatch. The player with the higher score when all pairs are matched wins.

### 3. Online Multiplayer
Real-time multiplayer using WebRTC peer-to-peer connections. One player hosts a room and shares a 6-character room code. The second player joins using this code. Game state is synchronized in real-time between both players.

## Card Content

### All 52 Unique Cards

The game features 52 unique cards divided into two categories:

**Capital Letters (26 cards)**
- A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z
- Each paired with Roman numerals I through XXVI
- Labeled as "Capital" on the card

**Small Letters (26 cards)**
- a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z
- Each paired with Roman numerals I through XXVI
- Labeled as "Small" on the card

### Card Display

Each card shows:
1. **Label**: "Capital" or "Small" (at the top)
2. **Letter**: The alphabet letter (A-Z or a-z)
3. **Roman Numeral**: Corresponding numeral (I-XXVI)

### Matching Rules

- Capital A matches Capital A (same letter, same case)
- Small a matches Small a (same letter, same case)
- Capital A does NOT match Small a (different case)
- Capital A does NOT match Capital B (different letter)

## Core Game Logic

### Scoring System

The game implements a penalty-based scoring system:

- **Starting Score**: Each player begins with 100 points
- **Penalty**: 4 points deducted for each incorrect match
- **No Reward**: Correct matches do not add points (strategic gameplay)
- **Game Over**: Solo mode ends if score reaches 0

### Turn-Based Mechanics

In multiplayer modes (both local and online), players alternate turns:

- Turn switches after a mismatch (incorrect pair)
- Same player continues after a match (correct pair)
- Turn indicator shows which player is active

### Dynamic Grid Calculation

The game automatically calculates optimal grid dimensions based on the number of cards:

**Examples:**
- 4 cards → 2x2 grid
- 16 cards → 4x4 grid
- 20 cards → 4x5 grid
- 36 cards → 6x6 grid
- 52 cards → 7x8 grid
- 104 cards → 10x11 grid

The algorithm finds the closest factors to create a rectangular grid that fits all cards.

### Online Multiplayer Synchronization

The online mode uses a message-based synchronization system:

**Message Types:**
- `start`: Initiates game with shared seed and grid size
- `flip`: Syncs card flip to remote player
- `match`: Syncs matched cards
- `mismatch`: Syncs mismatched cards with flip-back animation
- `score`: Syncs score updates
- `turn`: Syncs turn changes

### Seeded Random Shuffle

For online multiplayer, both players must have identical card layouts. This is achieved using a seeded random number generator that ensures both players see the same card arrangement.

## Enhanced Features

### Quit Button

The quit button has been enhanced with:

- **Modern Design**: Rounded square with glass-morphism effect
- **Hover Effects**: Red glow, lift animation, and icon rotation
- **Confirmation Dialog**: Prevents accidental quits with "Are you sure?" prompt
- **Keyboard Shortcut**: Press ESC to quit the game
- **Tooltip**: Shows "Exit Game (ESC)" on hover
- **Accessibility**: ARIA labels and keyboard navigation support

### Input Validation

The card count input includes real-time validation:

- Minimum 4 cards required
- Maximum 104 cards allowed
- Must be an even number
- Live grid size preview
- Clear error messages

## Technical Features

### WebRTC P2P Architecture
- Uses PeerJS library for simplified WebRTC implementation
- Direct peer-to-peer connections (no server relay for game data)
- Room-based matchmaking with 6-character alphanumeric codes
- Automatic connection status tracking and error handling

### Responsive Design
- Mobile-first CSS approach
- Breakpoints at 500px and 768px
- Touch-optimized card interactions
- Adaptive grid sizing based on viewport

### State Management
- Centralized game state in Game object
- Separate UI management in UI object
- Event-driven architecture for multiplayer sync
- Immutable score tracking with explicit updates

### Performance Optimizations
- CSS transforms for card animations (GPU-accelerated)
- Debounced card flip interactions
- Efficient DOM querying with cached selectors
- Minimal reflows during gameplay

## Dependencies

- **PeerJS**: WebRTC peer-to-peer connections
  - CDN: `https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js`
- **Google Fonts**: Cinzel (headings), Inter (body text)

## Running the Game

1. Open `index.html` in a modern web browser
2. Select a game mode from the main menu
3. Enter the desired number of cards (even number between 4 and 104)
4. The game will display the calculated grid size
5. Click "Start Game" to begin
6. For online mode:
   - Host: Click "Create Room" and share the generated code
   - Guest: Enter the room code and click "Join Room"

No build process or server required. The game runs entirely client-side.

## Game Rules

1. Players start with 100 points
2. Enter the number of cards you want to play with (must be even)
3. Click cards to flip them face-up
4. Match two cards with the same letter AND same case
   - Capital A matches Capital A
   - Small a matches Small a
   - Capital A does NOT match Small a
5. Correct match: Cards stay face-up, continue playing
6. Incorrect match: Lose 4 points, cards flip back
7. In multiplayer: Turn switches to opponent after mismatch
8. Game ends when all pairs are matched
9. Highest score wins (multiplayer) or aim for maximum score (solo)

## Future Enhancements

- Difficulty levels with varying point penalties
- Leaderboard system with persistent storage
- Sound effects and background music
- Additional card themes
- Spectator mode for online games
- Replay functionality
- Statistics tracking (matches attempted, accuracy rate)
- Custom card content options
- Achievements system
- Tutorial mode
