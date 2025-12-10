
// Import modules
import { ColorCodeProblem, CircuitProblem, ColorBuildProblem, COLORS } from './js/logic.js';
import * as UI from './js/ui.js';
import * as Renderer from './js/renderer.js';

// Application State
const state = {
    mode: 'colorcode', // 'colorcode', 'build-resistor', 'series-parallel', 'mixed'
    totalQuestions: 10,
    currentQuestionIndex: 0,
    score: 0,
    currentProblem: null,
    isPlaying: false
};

// DOM Elements
const canvas = document.getElementById('problem-canvas');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    UI.initTheme(); // Initialize dark mode
    UI.init(state, startGame, submitAnswer, resetGame, nextQuestion, submitBands);
    UI.initDragAndDrop(drawPreviewResistor); // Set up drag & drop with live preview
});

function startGame(mode, count) {
    state.mode = mode;
    state.totalQuestions = parseInt(count);
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.isPlaying = true;

    UI.showScreen('quiz-screen');
    UI.updateProgress(state.currentQuestionIndex, state.totalQuestions, state.score);

    generateAndShowProblem();
}

function generateAndShowProblem() {
    // Generate problem based on mode
    if (state.mode === 'colorcode') {
        state.currentProblem = new ColorCodeProblem();
        Renderer.drawResistor(canvas, state.currentProblem);
        UI.showNumericInput();
    } else if (state.mode === 'build-resistor') {
        state.currentProblem = new ColorBuildProblem();
        // Draw empty resistor as starting preview
        drawPreviewResistor([]);
        UI.showColorPicker(state.currentProblem.getDisplayValue());
    } else {
        // Circuit modes
        const complexity = state.mode === 'mixed' ? 'mixed' : 'simple';
        state.currentProblem = new CircuitProblem(complexity);
        Renderer.drawCircuit(canvas, state.currentProblem);
        UI.showNumericInput();
    }

    // Reset UI for new question
    UI.resetInput();
    UI.hideFeedback();
}

function submitAnswer(userValue) {
    if (!state.currentProblem) return;

    const isCorrect = state.currentProblem.checkAnswer(userValue);
    if (isCorrect) {
        state.score++;
    }

    const explanation = state.currentProblem.getExplanation();
    UI.showFeedback(isCorrect, explanation);
    UI.updateProgress(state.currentQuestionIndex + 1, state.totalQuestions, state.score);
}

function submitBands(selectedBands) {
    if (!state.currentProblem) return;

    const isCorrect = state.currentProblem.checkAnswer(selectedBands);
    if (isCorrect) {
        state.score++;
    }

    const explanation = state.currentProblem.getExplanation();
    UI.showFeedback(isCorrect, explanation);
    UI.updateProgress(state.currentQuestionIndex + 1, state.totalQuestions, state.score);
}

function nextQuestion() {
    state.currentQuestionIndex++;
    if (state.currentQuestionIndex >= state.totalQuestions) {
        finishGame();
    } else {
        generateAndShowProblem();
    }
}

function finishGame() {
    state.isPlaying = false;
    UI.showResult(state.score, state.totalQuestions);
}

function resetGame() {
    UI.showScreen('start-screen');
}

// Draw resistor preview with selected colors (for build mode)
function drawPreviewResistor(selectedBands) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const rw = 300; // Resistor body width
    const rh = 100; // Resistor body height

    // Draw Wire
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw Resistor Body
    ctx.fillStyle = '#f5e6d3';
    ctx.beginPath();
    roundRect(ctx, cx - rw / 2, cy - rh / 2, rw, rh, 15);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d6cba0';
    ctx.stroke();

    // Draw Bands
    const bandWidth = 20;
    const startX = cx - rw / 2 + 40;
    const gap = 50;

    // Color mapping
    const colorMap = {
        'black': '#000000',
        'brown': '#8B4513',
        'red': '#FF0000',
        'orange': '#FFA500',
        'yellow': '#FFFF00',
        'green': '#008000',
        'blue': '#0000FF',
        'violet': '#8A2BE2',
        'gray': '#808080',
        'white': '#FFFFFF',
        'gold': '#FFD700'
    };

    // Draw each band (or placeholder if not selected)
    for (let i = 0; i < 4; i++) {
        let x = startX + gap * i;
        if (i === 3) x += 40; // Gap for tolerance band

        let color = '#e0e0e0'; // Default placeholder gray
        if (i < 3 && selectedBands[i]) {
            color = colorMap[selectedBands[i]] || '#e0e0e0';
        } else if (i === 3) {
            color = '#FFD700'; // Gold for tolerance
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, cy - rh / 2, bandWidth, rh);

        // Add border for visibility on light colors
        if (['yellow', 'white', ''].includes(selectedBands[i]) || i === 3) {
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, cy - rh / 2, bandWidth, rh);
        }
    }
}

// Helper for rounded rectangle
function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
