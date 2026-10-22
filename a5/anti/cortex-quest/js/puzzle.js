/**
 * ============================================================================
 * CORTEX QUEST — BLOCK PUZZLE ENGINE (puzzle.js)
 * ============================================================================
 * Exposes window.CortexPuzzle
 * 8x8 Grid Block Puzzle Engine inspired by 1010/Blockudoku.
 * Blocks build from the bottom up.
 * Supports programmatic triggers (triggerCorrect / triggerWrong from Quiz)
 * and optional interactive drag/click placement from the 3-block palette.
 */

(function (window) {
  'use strict';

  // --------------------------------------------------------------------------
  // Shape Definitions (12 standard block shapes)
  // --------------------------------------------------------------------------
  const SHAPES = {
    'I-horizontal': {
      matrix: [[1, 1, 1, 1]],
      category: 'correct',
      name: 'I-horizontal'
    },
    'I-vertical': {
      matrix: [[1], [1], [1], [1]],
      category: 'neutral',
      name: 'I-vertical'
    },
    'L-shape': {
      matrix: [
        [1, 0],
        [1, 0],
        [1, 1]
      ],
      category: 'neutral',
      name: 'L-shape'
    },
    'J-shape': {
      matrix: [
        [0, 1],
        [0, 1],
        [1, 1]
      ],
      category: 'neutral',
      name: 'J-shape'
    },
    'T-shape': {
      matrix: [
        [1, 1, 1],
        [0, 1, 0]
      ],
      category: 'correct',
      name: 'T-shape'
    },
    'S-shape': {
      matrix: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      category: 'neutral',
      name: 'S-shape'
    },
    'Z-shape': {
      matrix: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      category: 'wrong',
      name: 'Z-shape'
    },
    'O-shape': {
      matrix: [
        [1, 1],
        [1, 1]
      ],
      category: 'correct',
      name: 'O-shape'
    },
    'Small-L': {
      matrix: [
        [1, 0],
        [1, 1]
      ],
      category: 'neutral',
      name: 'Small-L'
    },
    'Dot': {
      matrix: [[1]],
      category: 'wrong',
      name: 'Dot'
    },
    'Small-I': {
      matrix: [[1, 1, 1]],
      category: 'correct',
      name: 'Small-I'
    },
    'Corner': {
      matrix: [
        [1, 1],
        [1, 0]
      ],
      category: 'wrong',
      name: 'Corner'
    }
  };

  // Color Palette
  const PALETTE_COLORS = [
    '#3A5311', // Juniper Dark
    '#7a9a5c', // Sage
    '#3b82f6', // Sapphire Blue
    '#a855f7', // Mystic Purple
    '#f97316', // Sunset Orange
    '#06b6d4', // Cyan
    '#d4a017', // Gold
    '#ec4899', // Pink
    '#22c55e', // Emerald
    '#ef4444'  // Crimson
  ];

  const CORRECT_SHAPE_KEYS = ['I-horizontal', 'Small-I', 'O-shape', 'T-shape'];
  const WRONG_SHAPE_KEYS = ['Dot', 'Corner', 'Z-shape'];
  const ALL_SHAPE_KEYS = Object.keys(SHAPES);

  // --------------------------------------------------------------------------
  // Puzzle Engine Class / Singleton
  // --------------------------------------------------------------------------
  class BlockPuzzleEngine {
    constructor() {
      this.gridSize = 8;
      this.grid = this.createEmptyGrid();
      this.score = 0;
      this.currentBlocks = []; // Palette of 3 blocks
      this.isGameOver = false;
      this.totalPlaced = 0;
      this.clearedRows = 0;
      this.clearedCols = 0;
      this.container = null;
      this.containerId = null;
      this.selectedPaletteIndex = null;
      this.colorCycle = 0;
    }

    createEmptyGrid() {
      const g = [];
      for (let r = 0; r < this.gridSize; r++) {
        g.push(new Array(this.gridSize).fill(0));
      }
      return g;
    }

    /**
     * Initialize puzzle DOM and state
     * @param {string|HTMLElement} container - Element ID or container element
     */
    init(container) {
      if (typeof container === 'string') {
        this.containerId = container;
        this.container = document.getElementById(container);
      } else if (container instanceof HTMLElement) {
        this.container = container;
        this.containerId = container.id || 'puzzle-container';
      }

      this.reset();

      if (this.container) {
        this.buildDOM();
        this.render();
      }
    }

    /**
     * Reset puzzle state
     */
    reset() {
      this.grid = this.createEmptyGrid();
      this.score = 0;
      this.isGameOver = false;
      this.totalPlaced = 0;
      this.clearedRows = 0;
      this.clearedCols = 0;
      this.selectedPaletteIndex = null;
      this.refreshPalette();

      if (this.container) {
        this.render();
      }
    }

    /**
     * Pick next color from color list
     */
    getNextColor(preferGreen = false, preferRed = false) {
      if (preferGreen) return '#22c55e';
      if (preferRed) return '#ef4444';
      const color = PALETTE_COLORS[this.colorCycle % PALETTE_COLORS.length];
      this.colorCycle++;
      return color;
    }

    /**
     * Generate a block object
     * @param {boolean|null} isCorrect - true: correct shape, false: wrong shape, null: any
     */
    generateBlock(isCorrect = null) {
      let key;
      if (isCorrect === true) {
        key = CORRECT_SHAPE_KEYS[Math.floor(Math.random() * CORRECT_SHAPE_KEYS.length)];
      } else if (isCorrect === false) {
        key = WRONG_SHAPE_KEYS[Math.floor(Math.random() * WRONG_SHAPE_KEYS.length)];
      } else {
        key = ALL_SHAPE_KEYS[Math.floor(Math.random() * ALL_SHAPE_KEYS.length)];
      }

      const shapeDef = SHAPES[key];
      const color = this.getNextColor(isCorrect === true, isCorrect === false);

      return {
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: shapeDef.name,
        shape: shapeDef.matrix,
        color: color,
        isCorrect: isCorrect
      };
    }

    /**
     * Refresh the 3-block palette
     */
    refreshPalette() {
      this.currentBlocks = [
        this.generateBlock(null),
        this.generateBlock(null),
        this.generateBlock(null)
      ];
      this.selectedPaletteIndex = null;
    }

    /**
     * Check if a block shape can be placed at (row, col)
     */
    canPlaceAt(shape, row, col) {
      const h = shape.length;
      const w = shape[0].length;

      if (row < 0 || col < 0 || row + h > this.gridSize || col + w > this.gridSize) {
        return false;
      }

      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          if (shape[r][c] === 1) {
            if (this.grid[row + r][col + c] !== 0) {
              return false; // Cell already occupied
            }
          }
        }
      }

      return true;
    }

    /**
     * Check if a shape can be placed anywhere on the grid
     */
    canPlaceAnywhere(shape) {
      const h = shape.length;
      const w = shape[0].length;

      for (let r = 0; r <= this.gridSize - h; r++) {
        for (let c = 0; c <= this.gridSize - w; c++) {
          if (this.canPlaceAt(shape, r, c)) {
            return true;
          }
        }
      }
      return false;
    }

    /**
     * Find lowest valid position in grid (bottom-up placement)
     * Row search scans from bottom (gridSize - shapeHeight) down to 0
     * Column search scans from left to right (0 to gridSize - shapeWidth)
     * @param {Array<Array<number>>} shape
     * @returns {Object|null} { row, col }
     */
    findBestPlacement(shape) {
      const h = shape.length;
      const w = shape[0].length;

      // Start from the lowest possible row down to row 0
      for (let r = this.gridSize - h; r >= 0; r--) {
        for (let c = 0; c <= this.gridSize - w; c++) {
          if (this.canPlaceAt(shape, r, c)) {
            return { row: r, col: c };
          }
        }
      }

      return null;
    }

    /**
     * Place a block on the grid at specified position
     */
    placeBlock(blockObj, row, col) {
      if (this.isGameOver) return false;

      const shape = blockObj.shape;
      if (!this.canPlaceAt(shape, row, col)) {
        return false;
      }

      const h = shape.length;
      const w = shape[0].length;
      const placedCells = [];

      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          if (shape[r][c] === 1) {
            const gridR = row + r;
            const gridC = col + c;
            this.grid[gridR][gridC] = blockObj.color;
            placedCells.push({ r: gridR, c: gridC });
          }
        }
      }

      this.totalPlaced++;

      // Animate placement on DOM
      this.animatePlacement(placedCells, blockObj.isCorrect);

      // Check and clear completed lines
      const clearResult = this.checkAndClearLines();

      // Check if palette block needs to be removed
      if (this.selectedPaletteIndex !== null) {
        this.currentBlocks[this.selectedPaletteIndex] = null;
        this.selectedPaletteIndex = null;

        // If palette is all used, refresh
        if (this.currentBlocks.every(b => b === null)) {
          this.refreshPalette();
        }
      }

      this.render();
      this.checkGameOver();

      return true;
    }

    /**
     * Trigger automatic placement on correct answer from Quiz
     * Awards 10 points + 25 per cleared line
     */
    triggerCorrect() {
      if (this.isGameOver) {
        this.reset();
      }

      // Pick a correct-category block
      const blockObj = this.generateBlock(true);
      let placement = this.findBestPlacement(blockObj.shape);

      // If cannot fit, try small 1x1 or small I
      if (!placement) {
        const fallback = SHAPES['Dot'];
        blockObj.shape = fallback.matrix;
        blockObj.name = 'Dot';
        placement = this.findBestPlacement(blockObj.shape);
      }

      if (placement) {
        this.addScore(10);
        this.placeBlock(blockObj, placement.row, placement.col);
      } else {
        this.triggerGameOver();
      }
    }

    /**
     * Trigger automatic placement on wrong answer from Quiz
     * Places awkward block, awards 2 points
     */
    triggerWrong() {
      if (this.isGameOver) {
        this.reset();
      }

      // Pick a wrong-category block
      const blockObj = this.generateBlock(false);
      let placement = this.findBestPlacement(blockObj.shape);

      if (!placement) {
        // Try dot
        const dotBlock = {
          id: `blk_${Date.now()}`,
          name: 'Dot',
          shape: SHAPES['Dot'].matrix,
          color: '#ef4444',
          isCorrect: false
        };
        placement = this.findBestPlacement(dotBlock.shape);
        if (placement) {
          this.addScore(2);
          this.placeBlock(dotBlock, placement.row, placement.col);
          return;
        }
      }

      if (placement) {
        this.addScore(2);
        this.placeBlock(blockObj, placement.row, placement.col);
      } else {
        this.triggerGameOver();
      }
    }

    /**
     * Check and clear full rows and columns
     */
    checkAndClearLines() {
      const fullRows = [];
      const fullCols = [];

      // Check rows
      for (let r = 0; r < this.gridSize; r++) {
        let isFull = true;
        for (let c = 0; c < this.gridSize; c++) {
          if (this.grid[r][c] === 0) {
            isFull = false;
            break;
          }
        }
        if (isFull) fullRows.push(r);
      }

      // Check cols
      for (let c = 0; c < this.gridSize; c++) {
        let isFull = true;
        for (let r = 0; r < this.gridSize; r++) {
          if (this.grid[r][c] === 0) {
            isFull = false;
            break;
          }
        }
        if (isFull) fullCols.push(c);
      }

      const totalLines = fullRows.length + fullCols.length;

      if (totalLines > 0) {
        // Line clear points: 25 per line + combo bonus
        const points = totalLines * 25 + (totalLines > 1 ? (totalLines - 1) * 15 : 0);
        this.addScore(points);
        this.clearedRows += fullRows.length;
        this.clearedCols += fullCols.length;

        // Clear cells in grid
        for (const r of fullRows) {
          for (let c = 0; c < this.gridSize; c++) {
            this.grid[r][c] = 0;
          }
        }
        for (const c of fullCols) {
          for (let r = 0; r < this.gridSize; r++) {
            this.grid[r][c] = 0;
          }
        }

        // Animate line clear
        this.animateLineClear(fullRows, fullCols);
      }

      return {
        rowsCleared: fullRows.length,
        colsCleared: fullCols.length
      };
    }

    /**
     * Check game over condition
     */
    checkGameOver() {
      // Check if any palette block can be placed
      const availableBlocks = this.currentBlocks.filter(b => b !== null);
      if (availableBlocks.length > 0) {
        const canPlaceAny = availableBlocks.some(b => this.canPlaceAnywhere(b.shape));
        if (!canPlaceAny) {
          this.triggerGameOver();
          return true;
        }
      }
      return false;
    }

    triggerGameOver() {
      this.isGameOver = true;
      if (this.container) {
        const overlay = this.container.querySelector('.cq-puzzle-gameover');
        if (overlay) {
          overlay.classList.remove('d-none');
          overlay.style.display = 'flex';
        }
      }
    }

    addScore(points) {
      this.score += points;
      if (this.container) {
        const scoreEl = this.container.querySelector('.cq-puzzle-score-val');
        if (scoreEl) {
          scoreEl.textContent = this.score;
          scoreEl.classList.add('cq-pulse');
          setTimeout(() => scoreEl.classList.remove('cq-pulse'), 300);
        }
      }
    }

    getScore() {
      return this.score;
    }

    isGameOverState() {
      return this.isGameOver;
    }

    // ------------------------------------------------------------------------
    // DOM Rendering & Visuals
    // ------------------------------------------------------------------------
    buildDOM() {
      if (!this.container) return;

      this.container.innerHTML = `
        <div class="cq-puzzle-card">
          <div class="cq-puzzle-header">
            <div class="cq-puzzle-title">
              <span class="cq-puzzle-icon">🧩</span>
              <span>NeuroMatrix Grid</span>
            </div>
            <div class="cq-puzzle-score-badge">
              <span class="cq-puzzle-score-lbl">SCORE</span>
              <span class="cq-puzzle-score-val">${this.score}</span>
            </div>
          </div>

          <div class="cq-puzzle-board-wrapper">
            <div class="cq-puzzle-grid" id="cq-puzzle-grid-el"></div>
            
            <div class="cq-puzzle-gameover d-none">
              <div class="cq-puzzle-gameover-content">
                <div class="cq-gameover-icon">⚠️</div>
                <div class="cq-gameover-title">Grid Filled!</div>
                <div class="cq-gameover-score">Final Score: ${this.score}</div>
                <button type="button" class="cq-btn cq-btn-primary cq-restart-btn">Restart Matrix</button>
              </div>
            </div>
          </div>

          <div class="cq-puzzle-palette-wrapper">
            <div class="cq-palette-label">Power Blocks:</div>
            <div class="cq-puzzle-palette" id="cq-puzzle-palette-el"></div>
          </div>
        </div>
      `;

      // Build 64 grid cell elements
      const gridEl = this.container.querySelector('#cq-puzzle-grid-el');
      if (gridEl) {
        gridEl.innerHTML = '';
        for (let r = 0; r < this.gridSize; r++) {
          for (let c = 0; c < this.gridSize; c++) {
            const cell = document.createElement('div');
            cell.className = 'cq-puzzle-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Optional click handler to place selected palette block
            cell.addEventListener('click', () => {
              if (this.selectedPaletteIndex !== null) {
                const block = this.currentBlocks[this.selectedPaletteIndex];
                if (block && this.canPlaceAt(block.shape, r, c)) {
                  this.placeBlock(block, r, c);
                }
              }
            });

            gridEl.appendChild(cell);
          }
        }
      }

      // Hook restart button
      const restartBtn = this.container.querySelector('.cq-restart-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.reset();
        });
      }

      this.injectStyles();
    }

    render() {
      if (!this.container) return;

      // Update grid cells
      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          const cellEl = this.container.querySelector(`.cq-puzzle-cell[data-row="${r}"][data-col="${c}"]`);
          if (cellEl) {
            const val = this.grid[r][c];
            if (val !== 0) {
              cellEl.classList.add('filled');
              cellEl.style.setProperty('--cell-color', val);
              cellEl.style.backgroundColor = val;
            } else {
              cellEl.classList.remove('filled', 'glow-green', 'flash-red');
              cellEl.style.removeProperty('--cell-color');
              cellEl.style.backgroundColor = '';
            }
          }
        }
      }

      // Update score display
      const scoreEl = this.container.querySelector('.cq-puzzle-score-val');
      if (scoreEl) scoreEl.textContent = this.score;

      // Update gameover overlay
      const overlay = this.container.querySelector('.cq-puzzle-gameover');
      if (overlay) {
        if (this.isGameOver) {
          overlay.classList.remove('d-none');
          overlay.style.display = 'flex';
          const goScore = overlay.querySelector('.cq-gameover-score');
          if (goScore) goScore.textContent = `Final Score: ${this.score}`;
        } else {
          overlay.classList.add('d-none');
          overlay.style.display = 'none';
        }
      }

      // Render palette
      this.renderPalette();
    }

    renderPalette() {
      if (!this.container) return;
      const paletteEl = this.container.querySelector('#cq-puzzle-palette-el');
      if (!paletteEl) return;

      paletteEl.innerHTML = '';

      this.currentBlocks.forEach((block, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = `cq-palette-block ${this.selectedPaletteIndex === idx ? 'selected' : ''}`;
        itemEl.dataset.index = idx;

        if (!block) {
          itemEl.classList.add('empty');
          paletteEl.appendChild(itemEl);
          return;
        }

        // Render mini grid for block
        const shape = block.shape;
        const miniGrid = document.createElement('div');
        miniGrid.className = 'cq-mini-grid';
        miniGrid.style.gridTemplateRows = `repeat(${shape.length}, 1fr)`;
        miniGrid.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[0].length; c++) {
            const miniCell = document.createElement('div');
            miniCell.className = `cq-mini-cell ${shape[r][c] ? 'filled' : 'empty'}`;
            if (shape[r][c]) {
              miniCell.style.backgroundColor = block.color;
            }
            miniGrid.appendChild(miniCell);
          }
        }

        itemEl.appendChild(miniGrid);

        // Click to select block for placement
        itemEl.addEventListener('click', () => {
          if (this.selectedPaletteIndex === idx) {
            this.selectedPaletteIndex = null;
          } else {
            this.selectedPaletteIndex = idx;
          }
          this.renderPalette();
        });

        paletteEl.appendChild(itemEl);
      });
    }

    animatePlacement(cells, isCorrect) {
      if (!this.container) return;
      cells.forEach(coord => {
        const cellEl = this.container.querySelector(`.cq-puzzle-cell[data-row="${coord.r}"][data-col="${coord.c}"]`);
        if (cellEl) {
          const animClass = isCorrect ? 'glow-green' : 'flash-red';
          cellEl.classList.add(animClass);
          setTimeout(() => cellEl.classList.remove(animClass), 600);
        }
      });
    }

    animateLineClear(rows, cols) {
      if (!this.container) return;
      rows.forEach(r => {
        for (let c = 0; c < this.gridSize; c++) {
          const cell = this.container.querySelector(`.cq-puzzle-cell[data-row="${r}"][data-col="${c}"]`);
          if (cell) {
            cell.classList.add('clearing-line');
            setTimeout(() => cell.classList.remove('clearing-line'), 400);
          }
        }
      });
      cols.forEach(c => {
        for (let r = 0; r < this.gridSize; r++) {
          const cell = this.container.querySelector(`.cq-puzzle-cell[data-row="${r}"][data-col="${c}"]`);
          if (cell) {
            cell.classList.add('clearing-line');
            setTimeout(() => cell.classList.remove('clearing-line'), 400);
          }
        }
      });
    }

    injectStyles() {
      if (document.getElementById('cq-puzzle-styles')) return;

      const style = document.createElement('style');
      style.id = 'cq-puzzle-styles';
      style.textContent = `
        .cq-puzzle-card {
          background: rgba(26, 45, 10, 0.95);
          border: 1px solid rgba(122, 154, 92, 0.3);
          border-radius: 16px;
          padding: 1rem;
          color: #e8f0d8;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
          user-select: none;
        }
        .cq-puzzle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.85rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(122, 154, 92, 0.2);
        }
        .cq-puzzle-title {
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #f5f0e8;
        }
        .cq-puzzle-score-badge {
          background: rgba(13, 26, 5, 0.8);
          border: 1px solid rgba(212, 160, 23, 0.4);
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cq-puzzle-score-lbl {
          font-size: 0.7rem;
          color: #d4a017;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .cq-puzzle-score-val {
          font-size: 1.15rem;
          font-weight: 800;
          color: #fff;
          transition: transform 0.2s ease;
        }
        .cq-pulse {
          transform: scale(1.3);
          color: #d4a017 !important;
        }
        .cq-puzzle-board-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .cq-puzzle-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: repeat(8, 1fr);
          gap: 3px;
          width: 280px;
          height: 280px;
          background: #0d1a05;
          padding: 6px;
          border-radius: 12px;
          border: 1px solid rgba(122, 154, 92, 0.25);
        }
        .cq-puzzle-cell {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .cq-puzzle-cell.filled {
          box-shadow: inset 0 0 4px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .cq-puzzle-cell.glow-green {
          box-shadow: 0 0 12px #22c55e, inset 0 0 6px #fff !important;
          transform: scale(1.08);
        }
        .cq-puzzle-cell.flash-red {
          box-shadow: 0 0 12px #ef4444, inset 0 0 6px #fff !important;
          transform: scale(1.08);
        }
        .cq-puzzle-cell.clearing-line {
          animation: cqLineClearAnim 0.35s ease forwards;
        }
        @keyframes cqLineClearAnim {
          0% { background: #fff !important; transform: scale(1.15); }
          50% { background: #fbbf24 !important; transform: scale(0.9); }
          100% { background: transparent !important; transform: scale(1); }
        }
        .cq-puzzle-gameover {
          position: absolute;
          inset: 0;
          background: rgba(13, 26, 5, 0.92);
          backdrop-filter: blur(4px);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .cq-puzzle-gameover-content {
          text-align: center;
          padding: 1.5rem;
        }
        .cq-gameover-icon {
          font-size: 2.2rem;
          margin-bottom: 0.5rem;
        }
        .cq-gameover-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #ef4444;
          margin-bottom: 0.25rem;
        }
        .cq-gameover-score {
          font-size: 1rem;
          color: #e8f0d8;
          margin-bottom: 1rem;
        }
        .cq-restart-btn {
          background: #3A5311;
          color: #f5f0e8;
          border: 1px solid #7a9a5c;
          padding: 0.4rem 1.2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cq-restart-btn:hover {
          background: #4d6e18;
          transform: translateY(-2px);
        }
        .cq-palette-label {
          font-size: 0.75rem;
          color: #a0b88d;
          margin-bottom: 0.4rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cq-puzzle-palette {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .cq-palette-block {
          flex: 1;
          height: 68px;
          background: rgba(13, 26, 5, 0.6);
          border: 1px solid rgba(122, 154, 92, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 4px;
        }
        .cq-palette-block:hover {
          border-color: #7a9a5c;
          background: rgba(13, 26, 5, 0.9);
        }
        .cq-palette-block.selected {
          border-color: #d4a017;
          box-shadow: 0 0 10px rgba(212, 160, 23, 0.4);
          transform: translateY(-2px);
        }
        .cq-palette-block.empty {
          opacity: 0.3;
          cursor: default;
        }
        .cq-mini-grid {
          display: grid;
          gap: 2px;
          max-width: 50px;
          max-height: 50px;
        }
        .cq-mini-cell {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }
        .cq-mini-cell.empty {
          background: transparent;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Create singleton instance
  const puzzleInstance = new BlockPuzzleEngine();

  // Expose on window
  window.CortexPuzzle = puzzleInstance;

})(window);
