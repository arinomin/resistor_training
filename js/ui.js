
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

// Color Picker Elements (Drag & Drop)
const numericAnswerArea = document.getElementById('numeric-answer-area');
const colorPickerArea = document.getElementById('color-picker-area');
const targetValueDisplay = document.getElementById('target-value-display');
const submitBandsBtn = document.getElementById('submit-bands-btn');
const colorPalette = document.getElementById('color-palette');
const bandDropZones = document.querySelectorAll('.band-drop-zone:not(.band-fixed-zone)');

// UX Fix: New elements
const abortBtn = document.getElementById('abort-btn');
const inputError = document.getElementById('input-error');
const bandsError = document.getElementById('bands-error');

// State tracking for dynamic button text
let totalQuestionsCount = 10;
let currentQuestionCount = 0;

// Drag & Drop state
let draggedColor = null;

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

// Reset color picker selections (clear drop zones)
function resetColorPicker() {
    bandDropZones.forEach(zone => {
        zone.dataset.color = '';
        zone.style.background = '';
        zone.classList.remove('has-color');
    });
}

// Get selected bands as array of color names from drop zones
function getSelectedBands() {
    const bands = [];
    bandDropZones.forEach(zone => {
        bands.push(zone.dataset.color || '');
    });
    return bands;
}

// Initialize drag and drop functionality
export function initDragAndDrop(onColorChange) {
    const colorChips = document.querySelectorAll('.color-chip');

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
        'white': '#FFFFFF'
    };

    // Drag start
    colorChips.forEach(chip => {
        chip.addEventListener('dragstart', (e) => {
            draggedColor = e.target.dataset.color;
            e.target.classList.add('dragging');
        });

        chip.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            draggedColor = null;
        });
    });

    // Drop zones
    bandDropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            if (draggedColor) {
                zone.dataset.color = draggedColor;
                zone.style.background = colorMap[draggedColor] || '';
                zone.classList.add('has-color');

                // Add border for visibility on light colors
                if (['yellow', 'white'].includes(draggedColor)) {
                    zone.style.border = '2px solid #999';
                } else {
                    zone.style.border = '2px solid transparent';
                }

                // Notify preview callback
                if (onColorChange) {
                    onColorChange(getSelectedBands());
                }
            }
        });

        // Click to clear
        zone.addEventListener('click', () => {
            if (zone.classList.contains('has-color')) {
                zone.dataset.color = '';
                zone.style.background = '';
                zone.style.border = '';
                zone.classList.remove('has-color');

                if (onColorChange) {
                    onColorChange(getSelectedBands());
                }
            }
        });
    });
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

    // Auto-scroll to feedback with delay for DOM update
    requestAnimationFrame(() => {
        setTimeout(() => {
            feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            nextBtn.focus();
        }, 100);
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
// Real-time Resistor Preview (for drag and drop it's handled in initDragAndDrop)
// ============================================

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
