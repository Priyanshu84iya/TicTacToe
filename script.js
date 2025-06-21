// Uchiha Tic Tac Toe - Game Logic with Theme Support
class UchihaTicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'pvp'; // 'pvp' or 'pve'
        this.aiDifficulty = 'hard';
        this.isGameActive = false;
        this.player1Name = 'Player 1';
        this.player2Name = 'Player 2';
        this.scores = {
            x: 0,
            o: 0,
            draw: 0
        };
        
        // Theme management
        this.currentTheme = localStorage.getItem('uchiha-theme') || 'dark';
        
        this.winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
        this.setupEventListeners();
        this.setupTheme();
    }
    
    setupTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('uchiha-theme', this.currentTheme);
        this.updateThemeIcon();
        
        // Add animation effect
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
        
        // Animate the toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (typeof gsap !== 'undefined') {
            gsap.to(themeToggle, {
                rotation: 360,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }
    
    updateThemeIcon() {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    initializeGame() {
        this.showLoadingScreen();
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            
            // Simulate loading
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showPlayerNamesModal();
            }, 3000);
        } else {
            this.showPlayerNamesModal();
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    showPlayerNamesModal() {
        this.showModal('namesModal');
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(modal.querySelector('.names-content, .victory-content, .draw-content'),
                    { scale: 0.8, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
                );
            }
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (typeof gsap !== 'undefined') {
                gsap.to(modal.querySelector('.names-content, .victory-content, .draw-content'),
                    { scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in" }
                ).then(() => {
                    modal.classList.add('hidden');
                });
            } else {
                modal.classList.add('hidden');
            }
        }
    }
    
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Game mode buttons (original design)
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                modeButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                this.gameMode = e.target.dataset.mode;
                this.updatePlayerLabels();
            });
        });
        
        // Modal game mode selection buttons
        const modeSelectionButtons = document.querySelectorAll('.mode-selection-btn');
        modeSelectionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                modeSelectionButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.gameMode = e.currentTarget.dataset.mode;
                this.updatePlayerLabels();
                this.toggleDifficultySelector();
            });
        });
        
        // Start game button
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startNewGame());
        }
        
        // Control buttons
        const restartBtn = document.getElementById('restartBtn');
        const resetScoresBtn = document.getElementById('resetScoresBtn');
        const playAgainBtn = document.getElementById('playAgainBtn');
        const playAgainDrawBtn = document.getElementById('playAgainDrawBtn');
        
        if (restartBtn) restartBtn.addEventListener('click', () => this.restartGame());
        if (resetScoresBtn) resetScoresBtn.addEventListener('click', () => this.resetScores());
        if (playAgainBtn) playAgainBtn.addEventListener('click', () => this.playAgain());
        if (playAgainDrawBtn) playAgainDrawBtn.addEventListener('click', () => this.playAgain());
        
        // Board cell clicks
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.makeMove(index));
        });
    }
    
    updatePlayerLabels() {
        const player2Label = document.getElementById('player2Label');
        const player2Input = document.getElementById('player2Name');
        
        if (this.gameMode === 'pve') {
            if (player2Label) player2Label.textContent = 'AI (O):';
            if (player2Input) {
                player2Input.value = 'AI';
                player2Input.disabled = true;
            }
        } else {
            if (player2Label) player2Label.textContent = 'Player 2 (O):';
            if (player2Input) {
                player2Input.value = '';
                player2Input.disabled = false;
                player2Input.placeholder = 'Enter Player 2 name';
            }
        }
    }
    
    toggleDifficultySelector() {
        const difficultySelector = document.getElementById('difficultySelector');
        if (difficultySelector) {
            if (this.gameMode === 'pve') {
                difficultySelector.classList.remove('hidden');
            } else {
                difficultySelector.classList.add('hidden');
            }
        }
    }
    
    startNewGame() {
        const player1Name = document.getElementById('player1Name')?.value || 'Player 1';
        const player2Name = document.getElementById('player2Name')?.value || (this.gameMode === 'pve' ? 'AI' : 'Player 2');
        const aiDifficulty = document.getElementById('aiDifficulty')?.value || 'hard';
        
        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.aiDifficulty = aiDifficulty;
        
        this.hideModal('namesModal');
        this.initializeBoard();
        this.updateUI();
        this.isGameActive = true;
    }
    
    initializeBoard() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.updateBoard();
    }
    
    updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
            cell.className = 'cell';
            if (this.board[index]) {
                cell.classList.add(this.board[index].toLowerCase());
            }
        });
    }
    
    updateUI() {
        // Update player names in UI
        const playerXLabel = document.getElementById('playerXLabel');
        const playerOLabel = document.getElementById('playerOLabel');
        const currentPlayerName = document.getElementById('currentPlayerName');
        
        if (playerXLabel) playerXLabel.textContent = this.player1Name;
        if (playerOLabel) playerOLabel.textContent = this.player2Name;
        
        if (currentPlayerName) {
            currentPlayerName.textContent = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
        }
        
        // Update scores
        this.updateScores();
    }
    
    updateScores() {
        const scoreX = document.getElementById('scoreX');
        const scoreO = document.getElementById('scoreO');
        const scoreDraw = document.getElementById('scoreDraw');
        
        if (scoreX) scoreX.textContent = this.scores.x;
        if (scoreO) scoreO.textContent = this.scores.o;
        if (scoreDraw) scoreDraw.textContent = this.scores.draw;
    }
    
    makeMove(index) {
        if (!this.isGameActive || this.board[index] !== '') return;
        
        this.board[index] = this.currentPlayer;
        this.playMoveSound();
        this.animateMove(index);
        
        const result = this.checkGameEnd();
        if (result) {
            this.handleGameEnd(result);
        } else {
            this.switchPlayer();
            if (this.gameMode === 'pve' && this.currentPlayer === 'O') {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }
    
    animateMove(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell) {
            cell.textContent = this.currentPlayer;
            cell.classList.add(this.currentPlayer.toLowerCase());
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(cell,
                    { scale: 0, rotation: 180 },
                    { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" }
                );
            }
        }
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateUI();
    }
    
    makeAIMove() {
        if (!this.isGameActive) return;
        
        let move;
        if (this.aiDifficulty === 'hard') {
            move = this.getBestMove();
        } else {
            move = this.getRandomMove();
        }
        
        if (move !== -1) {
            this.makeMove(move);
        }
    }
    
    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing) {
        const result = this.checkGameEnd();
        if (result === 'O') return 1;
        if (result === 'X') return -1;
        if (result === 'draw') return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    getRandomMove() {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                availableMoves.push(i);
            }
        }
        return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }
    
    checkGameEnd() {
        // Check for wins
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningCells(pattern);
                return this.board[a];
            }
        }
        
        // Check for draw
        if (this.board.every(cell => cell !== '')) {
            return 'draw';
        }
        
        return null;
    }
    
    highlightWinningCells(pattern) {
        pattern.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            if (cell) {
                cell.classList.add('winning');
                if (typeof gsap !== 'undefined') {
                    gsap.to(cell, {
                        scale: 1.1,
                        duration: 0.3,
                        yoyo: true,
                        repeat: 5,
                        ease: "power2.inOut"
                    });
                }
            }
        });
    }
    
    handleGameEnd(result) {
        this.isGameActive = false;
        
        if (result === 'draw') {
            this.scores.draw++;
            this.playDrawSound();
            this.showDrawModal();
        } else {
            const winner = result === 'X' ? this.player1Name : this.player2Name;
            if (result === 'X') this.scores.x++;
            else this.scores.o++;
            
            this.playWinSound();
            this.showVictoryModal(winner);
        }
        
        this.updateScores();
    }
    
    showVictoryModal(winner) {
        const winnerName = document.getElementById('winnerName');
        if (winnerName) winnerName.textContent = winner;
        
        setTimeout(() => this.showModal('victoryModal'), 1000);
    }
    
    showDrawModal() {
        setTimeout(() => this.showModal('drawModal'), 1000);
    }
    
    playAgain() {
        this.hideModal('victoryModal');
        this.hideModal('drawModal');
        this.initializeBoard();
        this.updateUI();
        this.isGameActive = true;
    }
    
    restartGame() {
        this.initializeBoard();
        this.updateUI();
        this.isGameActive = true;
    }
    
    resetScores() {
        this.scores = { x: 0, o: 0, draw: 0 };
        this.updateScores();
    }
    
    playMoveSound() {
        const audio = document.getElementById('moveSound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }
    
    playWinSound() {
        const audio = document.getElementById('winSound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }
    
    playDrawSound() {
        const audio = document.getElementById('drawSound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }
}

// Particle animation for background
function createParticles() {
    const container = document.querySelector('.background-animation');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        container.appendChild(particle);
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    new UchihaTicTacToe();
});

// Add some GSAP animations for enhanced effects
if (typeof gsap !== 'undefined') {
    // Animate page load
    gsap.fromTo('.game-header', 
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power2.out" }
    );
    
    // Animate particles
    gsap.to('.particle', {
        y: -20,
        x: 20,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.2
    });
}
