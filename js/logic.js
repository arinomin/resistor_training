// Logic for generating resistor and circuit problems

// Constants for Color Code
const COLORS = [
    { name: 'black', value: 0, multiplier: 1, label: '黒' },
    { name: 'brown', value: 1, multiplier: 10, label: '茶' },
    { name: 'red', value: 2, multiplier: 100, label: '赤' },
    { name: 'orange', value: 3, multiplier: 1000, label: '橙' },
    { name: 'yellow', value: 4, multiplier: 10000, label: '黄' },
    { name: 'green', value: 5, multiplier: 100000, label: '緑' },
    { name: 'blue', value: 6, multiplier: 1000000, label: '青' },
    { name: 'violet', value: 7, multiplier: 10000000, label: '紫' },
    { name: 'gray', value: 8, multiplier: 100000000, label: '灰' },
    { name: 'white', value: 9, multiplier: 1000000000, label: '白' },
];

const GOLD = { name: 'gold', tolerance: 5, label: '金' };
// Silver is not usually used in calculating *nominal* value training, typically it's always gold for 5% in standard kits, keeping it simple.

export class ColorCodeProblem {
    constructor() {
        this.generate();
    }

    generate() {
        // Generate a standard E24 series-like value or just random valid bands
        // To keep it simple for training:
        // Band 1: 1-9 (Brown to White) - cannot be black
        // Band 2: 0-9 (Black to White)
        // Band 3: Multiplier 0-6 (Black to Blue) -> 1Ω to 10MΩ range

        const b1 = Math.floor(Math.random() * 9) + 1; // 1-9
        const b2 = Math.floor(Math.random() * 10);    // 0-9
        const b3 = Math.floor(Math.random() * 7);     // 0-6 (Multiplier index)

        this.bands = [COLORS[b1], COLORS[b2], COLORS[b3], GOLD];

        // Calculate correct value
        this.correctValue = (this.bands[0].value * 10 + this.bands[1].value) * this.bands[2].multiplier;
    }

    checkAnswer(input) {
        // Allow some small float tolerance if needed, but these should be exact integers mostly
        return Math.abs(input - this.correctValue) < 0.001; // exact match essentially
    }

    getExplanation() {
        return `
第1帯: ${this.bands[0].label} (${this.bands[0].value})
第2帯: ${this.bands[1].label} (${this.bands[1].value})
第3帯: ${this.bands[2].label} (x${this.bands[2].multiplier})
第4帯: ${this.bands[3].label} (誤差 ±${this.bands[3].tolerance}%)

計算式: (${this.bands[0].value} × 10 + ${this.bands[1].value}) × ${this.bands[2].multiplier}
答え: ${this.correctValue} Ω
        `.trim();
    }
}

export class CircuitProblem {
    constructor(complexity = 'simple') {
        this.complexity = complexity;
        this.generate();
    }

    generate() {
        // Types: 'series', 'parallel'
        // If mixed, maybe 'series-parallel' (R1 + (R2 || R3))

        const types = ['series', 'parallel'];
        if (this.complexity === 'mixed') {
            types.push('mixed-s-p'); // Series + Parallel group: R1 + (R2 || R3)
        }

        this.type = types[Math.floor(Math.random() * types.length)];
        this.resistors = []; // Array of values
        this.correctValue = 0;

        // "Clean Number" Generation Logic
        if (this.type === 'series') {
            // Easy: Just sum integers
            const r1 = this.randomInt(1, 10) * 10;
            const r2 = this.randomInt(1, 10) * 10;
            this.resistors = [r1, r2];
            this.correctValue = r1 + r2;
        } else if (this.type === 'parallel') {
            // Harder: Product over Sum must be nice
            // Strategy: Pick the Target Total (R_eq) first, then find splits
            // R_eq = (R1 * R2) / (R1 + R2)
            // Let R1 = k * R2 ... complicates things.
            // Let's us pre-defined pairs that work well or generate specifically.
            // Formula: 1/R = 1/R1 + 1/R2
            // Common pairs: (same value -> half), (R, 2R -> ?), (3, 6 -> 2), (4, 12 -> 3), (10, 10 -> 5), (6, 12 -> 4) (20, 60 -> 15)
            // (10, 40 -> 8), (12, 24 -> 8)

            const goodPairs = [
                [10, 10], [20, 20], [100, 100], // Equal
                [30, 60], [60, 30], // Result 20
                [20, 30], [30, 20], // Result 12
                [10, 40], [40, 10], // Result 8
                [12, 24], [24, 12], // Result 8
                [60, 120], [120, 60], // Result 40
                [40, 60], [60, 40], // Result 24
                [2, 2], [3, 6], [4, 12], [6, 12], [5, 20]
            ];

            const pair = goodPairs[Math.floor(Math.random() * goodPairs.length)];
            // Scale them up randomly to make strictly "2, 2" less boring (e.g. 20, 20)
            const scale = Math.random() > 0.5 ? 10 : 1;

            const r1 = pair[0] * scale;
            const r2 = pair[1] * scale;
            this.resistors = [r1, r2];
            this.correctValue = (r1 * r2) / (r1 + r2);

        } else if (this.type === 'mixed-s-p') {
            // R1 + (R2 || R3)
            // Generate a good parallel pair first for (R2 || R3)
            const goodPairs = [
                [10, 10], [20, 20], [30, 60], [20, 30], [10, 40]
            ];
            const pair = goodPairs[Math.floor(Math.random() * goodPairs.length)];
            const r2 = pair[0];
            const r3 = pair[1];
            const rEqParallel = (r2 * r3) / (r2 + r3);

            const r1 = this.randomInt(1, 10) * 10; // Series part

            this.resistors = [r1, r2, r3];
            this.correctValue = r1 + rEqParallel;
        }
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    checkAnswer(input) {
        // Accept answers with a bit more tolerance for circuit calcs if float math occurs
        return Math.abs(input - this.correctValue) < 0.1;
    }

    getExplanation() {
        if (this.type === 'series') {
            return `
直列回路の合成抵抗: R = R1 + R2
計算式: ${this.resistors[0]} + ${this.resistors[1]}
答え: ${this.correctValue} Ω
            `.trim();
        } else if (this.type === 'parallel') {
            return `
並列回路の合成抵抗: R = (R1 × R2) / (R1 + R2)  (和分の積)
計算式: (${this.resistors[0]} × ${this.resistors[1]}) / (${this.resistors[0]} + ${this.resistors[1]})
      = ${this.resistors[0] * this.resistors[1]} / ${this.resistors[0] + this.resistors[1]}
答え: ${this.correctValue} Ω
            `.trim();
        } else if (this.type === 'mixed-s-p') {
            const r1 = this.resistors[0];
            const r2 = this.resistors[1];
            const r3 = this.resistors[2];
            const rp = (r2 * r3) / (r2 + r3);
            return `
この回路は R1 と (R2, R3の並列回路) が直列につながっています。
1. まず並列部分(R2, R3)を計算:
   Rp = (${r2} × ${r3}) / (${r2} + ${r3}) = ${rp} Ω
2. 次に直列部分(R1)と足し算:
   R = R1 + Rp = ${r1} + ${rp}
答え: ${this.correctValue} Ω
            `.trim();
        }
    }
}

// Export COLORS for use in UI color picker
export { COLORS };

// New: ColorBuildProblem - User selects bands for a given resistance value
export class ColorBuildProblem {
    constructor() {
        this.generate();
    }

    generate() {
        // Generate a valid resistance value and calculate correct bands
        // Band 1: 1-9 (cannot be 0)
        // Band 2: 0-9
        // Band 3: Multiplier 0-4 (x1 to x10k for manageable values)

        const b1 = Math.floor(Math.random() * 9) + 1; // 1-9
        const b2 = Math.floor(Math.random() * 10);    // 0-9
        const b3 = Math.floor(Math.random() * 5);     // 0-4

        this.correctBands = [COLORS[b1], COLORS[b2], COLORS[b3], GOLD];
        this.targetValue = (b1 * 10 + b2) * COLORS[b3].multiplier;
    }

    // Check if user-selected bands match correct bands
    checkAnswer(selectedBands) {
        // selectedBands is array of color names: ['brown', 'black', 'red']
        if (!selectedBands || selectedBands.length < 3) return false;

        return selectedBands[0] === this.correctBands[0].name &&
            selectedBands[1] === this.correctBands[1].name &&
            selectedBands[2] === this.correctBands[2].name;
    }

    getExplanation() {
        const b1 = this.correctBands[0];
        const b2 = this.correctBands[1];
        const b3 = this.correctBands[2];

        return `
正解の色帯:
第1帯: ${b1.label} (${b1.value})
第2帯: ${b2.label} (${b2.value})
第3帯: ${b3.label} (x${b3.multiplier})
第4帯: 金 (誤差 ±5%)

計算: (${b1.value} × 10 + ${b2.value}) × ${b3.multiplier} = ${this.targetValue} Ω
        `.trim();
    }

    // Format target value for display (e.g., 4700 -> "4.7kΩ" or "4700Ω")
    getDisplayValue() {
        const v = this.targetValue;
        if (v >= 1000000) return `${v / 1000000}MΩ`;
        if (v >= 1000) return `${v / 1000}kΩ`;
        return `${v}Ω`;
    }
}
