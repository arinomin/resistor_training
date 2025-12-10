
// UI Controller

// Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const modeBtns = document.querySelectorAll('.mode-btn');
const countBtns = document.querySelectorAll('.count-btn');
const startBtn = document.getElementById('start-btn');

const currentQuestionEl = document.getElementById('current-question');
const totalQuestionsEl = document.getElementById('total-questions');
const currentScoreEl = document.getElementById('current-score');
const submitBtn = document.getElementById('submit-btn');
const answerInput = document.getElementById('answer-input');
const feedbackArea = document.getElementById('feedback-area');
const nextBtn = document.getElementById('next-btn');
const resultMessageEl = document.querySelector('.result-message');
const explanationEl = document.querySelector('.explanation');

const finalPercentageEl = document.getElementById('final-percentage');
const finalCorrectEl = document.getElementById('final-correct');
const finalTotalEl = document.getElementById('final-total');
const retryBtn = document.getElementById('retry-btn');
const homeBtn = document.getElementById('home-btn');

export function init(state, onStart, onSubmit, onReset, onNext) {
    // Mode Selection
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Count Selection
    countBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            countBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Start Button
    startBtn.addEventListener('click', () => {
        const mode = document.querySelector('.mode-btn.selected').dataset.mode;
        const count = document.querySelector('.count-btn.selected').dataset.count;
        onStart(mode, count);
    });

    // Submit Answer
    submitBtn.addEventListener('click', () => {
        const val = parseFloat(answerInput.value);
        if (isNaN(val)) return; // Validation?
        onSubmit(val);
    });

    // Also submit on Enter
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = parseFloat(answerInput.value);
            if (!isNaN(val) && !submitBtn.classList.contains('hidden')) {
                onSubmit(val);
            } else if (e.key === 'Enter' && !nextBtn.classList.contains('hidden')) {
                onNext();
            }
        }
    });

    // Next Button
    nextBtn.addEventListener('click', () => {
        onNext();
    });

    // Result Screen Buttons
    retryBtn.addEventListener('click', () => {
        const mode = document.querySelector('.mode-btn.selected').dataset.mode;
        const count = document.querySelector('.count-btn.selected').dataset.count;
        onStart(mode, count);
    });

    homeBtn.addEventListener('click', () => {
        onReset();
    });

    // Guide Buttons
    const guideBtn = document.getElementById('guide-btn');
    const guideBackBtn = document.getElementById('guide-back-btn');

    if (guideBtn) {
        guideBtn.addEventListener('click', () => {
            showScreen('guide-screen');
        });
    }

    if (guideBackBtn) {
        guideBackBtn.addEventListener('click', () => {
            showScreen('start-screen');
        });
    }
}

export function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

export function updateProgress(current, total, score) {
    currentQuestionEl.textContent = current + 1; // 0-indexed internally
    totalQuestionsEl.textContent = total;
    currentScoreEl.textContent = score;
}

export function resetInput() {
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.focus();
    submitBtn.classList.remove('hidden');
    // nextBtn is inside feedback-area, so it hides when feedback hides
}

export function hideFeedback() {
    feedbackArea.classList.add('hidden');
    feedbackArea.classList.remove('correct', 'incorrect');
    // Clear content to be safe
    resultMessageEl.textContent = '';
    explanationEl.textContent = '';
}

export function showFeedback(isCorrect, explanation) {
    feedbackArea.classList.remove('hidden');
    feedbackArea.classList.remove('correct', 'incorrect');
    feedbackArea.classList.add(isCorrect ? 'correct' : 'incorrect');

    resultMessageEl.textContent = isCorrect ? '正解！' : '不正解...';
    explanationEl.textContent = explanation;

    // Manage buttons
    submitBtn.classList.add('hidden');
    // separate nextBtn logic is not needed if it's inside feedbackArea which toggles visibility
    answerInput.disabled = true;

    // Auto-scroll to feedback
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
        setTimeout(() => {
            feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            nextBtn.focus();
        }, 50);
    });
}

export function showResult(score, total) {
    showScreen('result-screen');
    const percentage = Math.round((score / total) * 100);
    finalPercentageEl.textContent = percentage;
    finalCorrectEl.textContent = score;
    finalTotalEl.textContent = total;
}
