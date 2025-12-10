
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

// UX Fix: New elements
const abortBtn = document.getElementById('abort-btn');
const inputError = document.getElementById('input-error');
const bandsError = document.getElementById('bands-error');

// State tracking for dynamic button text
let totalQuestionsCount = 10;
let currentQuestionCount = 0;

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

    // Submit Answer (Numeric) with error handling
    submitBtn.addEventListener('click', () => {
        hideErrors();
        const val = parseFloat(answerInput.value);
        if (isNaN(val) || answerInput.value.trim() === '') {
            showInputError();
            return;
        }
        onSubmit(val);
    });

    // Also submit on Enter
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            hideErrors();
            const val = parseFloat(answerInput.value);
            if (!isNaN(val) && answerInput.value.trim() !== '' && !submitBtn.classList.contains('hidden')) {
                onSubmit(val);
            } else if (!feedbackArea.classList.contains('hidden')) {
                // Allow Enter to proceed to next question when feedback is shown
                onNext();
            } else if (submitBtn && !submitBtn.classList.contains('hidden')) {
                showInputError();
            }
        }
    });

    // Submit Bands (Color Picker) with inline error
    if (submitBandsBtn) {
        submitBandsBtn.addEventListener('click', () => {
            hideErrors();
            const bands = getSelectedBands();
            if (bands.includes('')) {
                showBandsError();
                return;
            }
            onSubmitBands(bands);
        });
    }

    // Next Button
    nextBtn.addEventListener('click', () => {
        onNext();
    });

    // Abort Button - return to start screen
    if (abortBtn) {
        abortBtn.addEventListener('click', () => {
            showModal(
                'トレーニングを中断',
                '本当にトップ画面に戻りますか？\n現在の進捗は失われます。',
                onReset
            );
        });
    }

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

    // Track for dynamic button text
    currentQuestionCount = current;
    totalQuestionsCount = total;

    // Update next button text for last question
    updateNextButtonText();
}

// Update next button text based on question progress
function updateNextButtonText() {
    if (currentQuestionCount + 1 >= totalQuestionsCount) {
        nextBtn.textContent = '結果を見る';
    } else {
        nextBtn.textContent = '次の問題へ';
    }
}

// Error display helpers
function showInputError() {
    if (inputError) {
        inputError.classList.remove('hidden');
    }
    if (answerInput) {
        answerInput.classList.add('error');
        setTimeout(() => answerInput.classList.remove('error'), 300);
    }
}

function showBandsError() {
    if (bandsError) {
        bandsError.classList.remove('hidden');
    }
}

function hideErrors() {
    if (inputError) inputError.classList.add('hidden');
    if (bandsError) bandsError.classList.add('hidden');
    if (answerInput) answerInput.classList.remove('error');
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

// ============================================
// Theme Toggle (Dark Mode)
// ============================================
const themeToggle = document.getElementById('theme-toggle');

export function initTheme() {
    // Load saved theme from LocalStorage
    const savedTheme = localStorage.getItem('resistor-trainer-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeIcon('dark');
        }
    }

    // Theme toggle button click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('resistor-trainer-theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// ============================================
// Real-time Resistor Preview (Build Mode)
// ============================================
let previewCallback = null;

export function setPreviewCallback(callback) {
    previewCallback = callback;

    // Add change listeners to band selects
    [bandSelect0, bandSelect1, bandSelect2].forEach(select => {
        if (select) {
            select.addEventListener('change', () => {
                if (previewCallback) {
                    previewCallback(getSelectedBands());
                }
            });
        }
    });
}

export function getSelectedBandsExport() {
    return getSelectedBands();
}

// ============================================
// Modal Dialog System
// ============================================
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm');
const modalCancelBtn = document.getElementById('modal-cancel');

let modalConfirmCallback = null;

function showModal(title, message, onConfirm) {
    if (!modalOverlay) return;

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalConfirmCallback = onConfirm;
    modalOverlay.classList.remove('hidden');

    // Focus confirm button for accessibility
    modalConfirmBtn.focus();
}

function hideModal() {
    if (modalOverlay) {
        modalOverlay.classList.add('hidden');
    }
    modalConfirmCallback = null;
}

// Modal button event listeners
if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', () => {
        const callback = modalConfirmCallback; // Save callback before hiding
        hideModal();
        if (callback) {
            callback();
        }
    });
}

if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', () => {
        hideModal();
    });
}

// Close modal on overlay click
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && !modalOverlay.classList.contains('hidden')) {
        hideModal();
    }
});
