
// Import modules
import { ColorCodeProblem, CircuitProblem, ColorBuildProblem } from './js/logic.js';
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
    UI.init(state, startGame, submitAnswer, resetGame, nextQuestion, submitBands);
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
        // Clear canvas or show placeholder
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#64748b';
        ctx.font = '24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('色帯を選んで抵抗を作ってください', canvas.width / 2, canvas.height / 2);
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

