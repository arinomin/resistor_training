
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

// Color Picker Elements
const numericAnswerArea = document.getElementById('numeric-answer-area');
const colorPickerArea = document.getElementById('color-picker-area');
const targetValueDisplay = document.getElementById('target-value-display');
const submitBandsBtn = document.getElementById('submit-bands-btn');
const bandSelect0 = document.getElementById('band-select-0');
const bandSelect1 = document.getElementById('band-select-1');
const bandSelect2 = document.getElementById('band-select-2');

export function init(state, onStart, onSubmit, onReset, onNext, onSubmitBands) {
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

    // Submit Answer (Numeric)
    submitBtn.addEventListener('click', () => {
        const val = parseFloat(answerInput.value);
        if (isNaN(val)) return;
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

    // Submit Bands (Color Picker)
    if (submitBandsBtn) {
        submitBandsBtn.addEventListener('click', () => {
            const bands = getSelectedBands();
            if (bands.includes('')) {
                alert('すべての色帯を選択してください');
                return;
            }
            onSubmitBands(bands);
        });
    }

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

// Show numeric input area, hide color picker
export function showNumericInput() {
    if (numericAnswerArea) numericAnswerArea.classList.remove('hidden');
    if (colorPickerArea) colorPickerArea.classList.add('hidden');
}

// Show color picker, hide numeric input
export function showColorPicker(targetValue) {
    if (numericAnswerArea) numericAnswerArea.classList.add('hidden');
    if (colorPickerArea) colorPickerArea.classList.remove('hidden');
    if (targetValueDisplay) targetValueDisplay.textContent = targetValue;
    resetColorPicker();
}

// Reset color picker selections
function resetColorPicker() {
    if (bandSelect0) bandSelect0.value = '';
    if (bandSelect1) bandSelect1.value = '';
    if (bandSelect2) bandSelect2.value = '';
}

// Get selected bands as array of color names
function getSelectedBands() {
    return [
        bandSelect0 ? bandSelect0.value : '',
        bandSelect1 ? bandSelect1.value : '',
        bandSelect2 ? bandSelect2.value : ''
    ];
}

export function resetInput() {
    answerInput.value = '';
    answerInput.disabled = false;
    submitBtn.classList.remove('hidden');
    if (submitBandsBtn) submitBandsBtn.classList.remove('hidden');
    resetColorPicker();
    // Focus appropriate element based on mode
    if (numericAnswerArea && !numericAnswerArea.classList.contains('hidden')) {
        answerInput.focus();
    }
}

export function hideFeedback() {
    feedbackArea.classList.add('hidden');
    feedbackArea.classList.remove('correct', 'incorrect');
    resultMessageEl.textContent = '';
    explanationEl.textContent = '';
}

export function showFeedback(isCorrect, explanation) {
    feedbackArea.classList.remove('hidden');
    feedbackArea.classList.remove('correct', 'incorrect');
    feedbackArea.classList.add(isCorrect ? 'correct' : 'incorrect');

    resultMessageEl.textContent = isCorrect ? '正解！' : '不正解...';
    explanationEl.textContent = explanation;

    // Hide submit buttons
    submitBtn.classList.add('hidden');
    if (submitBandsBtn) submitBandsBtn.classList.add('hidden');
    answerInput.disabled = true;

    // Auto-scroll to feedback
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

