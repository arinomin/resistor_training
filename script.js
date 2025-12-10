
// Import modules
import { ColorCodeProblem, CircuitProblem } from './js/logic.js';
import * as UI from './js/ui.js';
import * as Renderer from './js/renderer.js';

// Application State
const state = {
    mode: 'colorcode', // 'colorcode', 'series-parallel', 'mixed'
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
    UI.init(state, startGame, submitAnswer, resetGame, nextQuestion);
    // Draw an initial graphic or placeholder?
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
    } else {
        // Circuit modes
        const complexity = state.mode === 'mixed' ? 'mixed' : 'simple';
        state.currentProblem = new CircuitProblem(complexity);
        Renderer.drawCircuit(canvas, state.currentProblem);
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
    UI.updateProgress(state.currentQuestionIndex + 1, state.totalQuestions, state.score); // Update score immediately
    
    // Enable Next button or Finish logic is handled by UI showing the next button
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
