# Chinese Chess (Xiangqi) Implementation Details

## Overview
This is a complete implementation of Chinese Chess (Xiangqi) in JavaScript, HTML, and CSS. The game follows authentic Xiangqi rules and provides a visually appealing interface.

## Architecture

### Game Class: `XiangqiGame`
The main game logic is encapsulated in the `XiangqiGame` class, which manages:

- Game state (`board`, `currentPlayer`, `selectedPiece`, etc.)
- Piece initialization
- Move validation
- Game rendering
- Event handling

### Files Structure
```
xiangqi/
├── index.html       # Main game interface
├── script.js        # Game logic implementation
├── styles.css       # Styling for the game
├── README.md        # Game instructions
└── CODEBUDDY.md     # This file
```

## Key Features

### Board Representation
- 10×9 grid representing the Xiangqi board
- River area visually distinct
- Palace areas marked with diagonal lines
- Proper initial placement of all pieces

### Piece Movement Rules
Each piece type implements its specific movement rules:

1. **General (King)**: 
   - Moves one point orthogonally
   - Confined to the palace
   - Implemented in `isValidKingMove()`

2. **Advisor**:
   - Moves one point diagonally 
   - Confined to the palace
   - Implemented in `isValidAdvisorMove()`

3. **Elephant**:
   - Moves two points diagonally
   - Cannot cross the river
   - Cannot move to blocked positions
   - Implemented in `isValidElephantMove()`

4. **Horse**:
   - Moves in L-shape (one orthogonal, one diagonal)
   - Can be blocked ("hobbled")
   - Implemented in `isValidHorseMove()`

5. **Rook (Chariot)**:
   - Moves any distance orthogonally
   - Path must be clear
   - Implemented in `isValidRookMove()`

6. **Cannon**:
   - Moves like a rook when not capturing
   - To capture, must "jump" over exactly one piece
   - Implemented in `isValidCannonMove()`

7. **Pawn/Soldier**:
   - Moves forward before crossing river
   - Can move forward or sideways after crossing
   - Implemented in `isValidPawnMove()`

### Game Mechanics
- Turn-based gameplay with red going first
- Visual highlighting of selected pieces
- Captured pieces display
- Win condition detection (king capture)
- Reset functionality

## Technical Implementation Details

### Board Representation
The board is represented as a 10×9 2D array where each cell contains either:
- `null` for empty cells
- An object `{ type: string, color: string }` for occupied cells

### Move Validation
Move validation is performed in the `isValidMove()` method, which calls piece-specific validation methods based on the piece type.

### Rendering
The board is rendered by creating DOM elements for each cell and piece. CSS classes are used to style different elements appropriately.

### Event Handling
Click events are attached to board cells to handle piece selection and movement. The game state is updated accordingly, and the board is re-rendered.

## Styling
- Traditional wooden board color scheme
- Distinct colors for red and black pieces
- Visual indicators for special board areas (river, palace)
- Responsive design for different screen sizes
- Highlighting for selected pieces

## Possible Enhancements
- Add sound effects
- Implement AI opponent
- Add move history
- Include game timer
- Add option for different difficulty levels
- Add save/load game functionality
- Include tutorial for new players

## Known Limitations
- Does not implement "flying general" rule (generals cannot face each other directly)
- No check/checkmate detection beyond king capture
- Basic UI without animations

This implementation provides a solid foundation for a Chinese Chess game that can be extended with additional features as needed.