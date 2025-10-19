# CODEBUDDY.md This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

This is a web-based chess game implemented in pure HTML, CSS, and JavaScript. The game features a complete chess rules implementation with a responsive design and intuitive user interface.

## Architecture

### Core Structure
- **index.html**: Main HTML file with game layout and UI components
- **chess.js**: Core game logic containing the `ChessGame` class
- **styles.css**: Responsive styling with mobile support

### Main Class: ChessGame
Located in `chess.js:1-700`, this class contains:
- Board state management using 8x8 2D array
- Piece movement logic for all chess pieces
- Game state tracking (current player, selected piece, valid moves, etc.)
- UI rendering and event handling
- Game status checking (check, checkmate, game over)

### Key Components

**Board Representation**: `chess.js:41-46`
- 8x8 grid stored as 2D array
- Each cell contains piece object with `type` and `color` properties

**Piece Movement Logic**: `chess.js:240-363`
- Separate methods for each piece type (pawn, knight, bishop, rook, queen, king)
- Sliding piece logic for bishop, rook, queen
- Special pawn movement (first move, en passant not implemented)

**UI Components**: `index.html:29-96`
- Chessboard with coordinates
- Game controls (new game, clear selection)
- Captured pieces display
- Move history
- Game rules section

## Development Commands

### Running the Game
```bash
# Simply open index.html in a web browser
open index.html
# Or use a local server for development
python -m http.server 8000
```

### Testing
No formal test framework exists. Manual testing required:
1. Open `index.html` in browser
2. Test piece movements
3. Verify game rules and win conditions

## Implementation Details

### Piece Movement System
Each piece type has dedicated movement calculation methods:
- **Pawns**: `chess.js:270-292` - forward movement, diagonal capture, first move double step
- **Knights**: `chess.js:294-309` - L-shaped movement
- **Sliding pieces**: `chess.js:345-363` - bishop, rook, queen using raycasting
- **King**: `chess.js:329-343` - single square movement

### Game State Management
- **Current player tracking**: `chess.js:4` - alternates between 'white' and 'black'
- **Selection system**: `chess.js:193-219` - highlights valid moves
- **Move validation**: `chess.js:369-376` - basic validation (can be enhanced)

### UI Features
- **Responsive design**: `styles.css:413-624` - mobile-first approach
- **Touch support**: `chess.js:135-160` - mobile touch events
- **Visual feedback**: Selected pieces, valid moves, captures highlighted

## Areas for Improvement

### Missing Features (from README.md:64-68)
- Castling (kingside/queenside)
- Pawn promotion
- Checkmate detection (currently only king capture)
- Undo move functionality
- Game timer
- Save/load game state

### Code Enhancements
- Implement proper move validation considering check/checkmate
- Add en passant capture
- Improve checkmate detection logic
- Add audio feedback for moves
- Implement drag-and-drop piece movement

## File Structure
```
chess/
├── index.html      # Main HTML file with game layout
├── chess.js        # Core game logic and ChessGame class
├── styles.css      # Responsive styling and mobile support
└── README.md       # Project documentation (Chinese)
```

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development Notes
- The game uses Unicode chess symbols for piece representation
- No external dependencies - pure vanilla JavaScript
- Responsive design tested on mobile devices
- Game state is maintained entirely in memory (no persistence)