
// Renderer for drawing resistors and circuits on Canvas

export function drawResistor(canvas, problem) {
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
    ctx.strokeStyle = '#94a3b8'; // gray-400
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw Resistor Body
    // Using a rounded beige/tan shape
    ctx.fillStyle = '#f5e6d3'; // Beige
    roundRect(ctx, cx - rw / 2, cy - rh / 2, rw, rh, 15);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d6cba0';
    ctx.stroke();

    // Draw Bands
    const bandWidth = 20;
    const startX = cx - rw / 2 + 40;
    const gap = 50;

    problem.bands.forEach((band, index) => {
        let x = startX + gap * index;
        if (index === 3) x += 40; // Gap for tolerance band

        ctx.fillStyle = getCssColor(band.name);
        ctx.fillRect(x, cy - rh / 2, bandWidth, rh);
    });
}

function getCssColor(name) {
    const map = {
        'black': '#000000',
        'brown': '#8B4513',
        'red': '#FF0000',
        'orange': '#FFA500',
        'yellow': '#FFFF00',
        'green': '#008000',
        'blue': '#0000FF',
        'violet': '#EE82EE',
        'gray': '#808080',
        'white': '#FFFFFF',
        'gold': '#FFD700',
        'silver': '#C0C0C0'
    };
    return map[name] || '#000000';
}

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

export function drawCircuit(canvas, problem) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#000000';
    ctx.font = '28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cx = w / 2;
    const cy = h / 2;

    if (problem.type === 'series') {
        drawSeriesCircuit(ctx, cx, cy, problem.resistors);
    } else if (problem.type === 'parallel') {
        drawParallelCircuit(ctx, cx, cy, problem.resistors);
    } else if (problem.type === 'mixed-s-p') {
        drawMixedCircuit(ctx, cx, cy, problem.resistors);
    }
}

// Helper: Draw a single line
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Helper: Draw a zigzag resistor symbol and return end x position
function drawResistorSymbol(ctx, startX, y, length) {
    const peaks = 4; // Number of zigzag peaks
    const segmentWidth = length / (peaks * 2);
    const amplitude = 15;

    ctx.beginPath();
    ctx.moveTo(startX, y);

    for (let i = 0; i < peaks * 2; i++) {
        const xPos = startX + segmentWidth * (i + 1);
        const yPos = y + (i % 2 === 0 ? -amplitude : amplitude);
        ctx.lineTo(xPos, yPos);
    }

    ctx.lineTo(startX + length, y);
    ctx.stroke();

    return startX + length;
}

// Series Circuit: ──[R1]──[R2]──
function drawSeriesCircuit(ctx, cx, cy, resistors) {
    const r1 = resistors[0];
    const r2 = resistors[1];
    const y = cy;

    const resistorLen = 80;
    const wireLen = 50;
    const gapBetween = 60;

    // Total width calculation
    const totalWidth = wireLen + resistorLen + gapBetween + resistorLen + wireLen;
    const startX = cx - totalWidth / 2;

    let x = startX;

    // Left wire
    drawLine(ctx, x, y, x + wireLen, y);
    x += wireLen;

    // R1
    const r1End = drawResistorSymbol(ctx, x, y, resistorLen);
    ctx.fillText(`${r1}Ω`, x + resistorLen / 2, y - 35);
    x = r1End;

    // Middle wire
    drawLine(ctx, x, y, x + gapBetween, y);
    x += gapBetween;

    // R2
    const r2End = drawResistorSymbol(ctx, x, y, resistorLen);
    ctx.fillText(`${r2}Ω`, x + resistorLen / 2, y - 35);
    x = r2End;

    // Right wire
    drawLine(ctx, x, y, x + wireLen, y);
}

// Parallel Circuit
//       ┌──[R1]──┐
// ──────┤        ├──────
//       └──[R2]──┘
function drawParallelCircuit(ctx, cx, cy, resistors) {
    const r1 = resistors[0];
    const r2 = resistors[1];

    const branchSpacing = 60;  // Vertical distance from center to each branch
    const resistorLen = 100;
    const horizontalPadding = 30; // Wire from junction to resistor
    const inputWireLen = 60;

    const topY = cy - branchSpacing;
    const bottomY = cy + branchSpacing;

    // Junction points
    const leftJunctionX = cx - resistorLen / 2 - horizontalPadding;
    const rightJunctionX = cx + resistorLen / 2 + horizontalPadding;

    // Input wire (left)
    drawLine(ctx, leftJunctionX - inputWireLen, cy, leftJunctionX, cy);

    // Left vertical junction (top to bottom)
    drawLine(ctx, leftJunctionX, topY, leftJunctionX, bottomY);

    // Top branch: left junction -> resistor -> right junction
    drawLine(ctx, leftJunctionX, topY, leftJunctionX + horizontalPadding, topY);
    const r1StartX = leftJunctionX + horizontalPadding;
    drawResistorSymbol(ctx, r1StartX, topY, resistorLen);
    ctx.fillText(`${r1}Ω`, cx, topY - 30);
    drawLine(ctx, r1StartX + resistorLen, topY, rightJunctionX, topY);

    // Bottom branch: left junction -> resistor -> right junction
    drawLine(ctx, leftJunctionX, bottomY, leftJunctionX + horizontalPadding, bottomY);
    const r2StartX = leftJunctionX + horizontalPadding;
    drawResistorSymbol(ctx, r2StartX, bottomY, resistorLen);
    ctx.fillText(`${r2}Ω`, cx, bottomY + 45);
    drawLine(ctx, r2StartX + resistorLen, bottomY, rightJunctionX, bottomY);

    // Right vertical junction (top to bottom)
    drawLine(ctx, rightJunctionX, topY, rightJunctionX, bottomY);

    // Output wire (right)
    drawLine(ctx, rightJunctionX, cy, rightJunctionX + inputWireLen, cy);
}

// Mixed Circuit: R1 in series with (R2 || R3)
//                ┌──[R2]──┐
// ──[R1]─────────┤        ├──────
//                └──[R3]──┘
function drawMixedCircuit(ctx, cx, cy, resistors) {
    const r1 = resistors[0];
    const r2 = resistors[1];
    const r3 = resistors[2];

    const branchSpacing = 50;
    const seriesResistorLen = 70;
    const parallelResistorLen = 90;
    const wireLen = 40;
    const horizontalPadding = 25;

    const topY = cy - branchSpacing;
    const bottomY = cy + branchSpacing;

    // Start from left
    let x = 40;

    // Input wire
    drawLine(ctx, x, cy, x + wireLen, cy);
    x += wireLen;

    // R1 (series)
    drawResistorSymbol(ctx, x, cy, seriesResistorLen);
    ctx.fillText(`${r1}Ω`, x + seriesResistorLen / 2, cy - 35);
    x += seriesResistorLen;

    // Wire to parallel junction
    const junctionLeftX = x + wireLen;
    drawLine(ctx, x, cy, junctionLeftX, cy);

    // Left vertical line of parallel block
    drawLine(ctx, junctionLeftX, topY, junctionLeftX, bottomY);

    // Top branch (R2)
    const pStartX = junctionLeftX + horizontalPadding;
    drawLine(ctx, junctionLeftX, topY, pStartX, topY);
    drawResistorSymbol(ctx, pStartX, topY, parallelResistorLen);
    ctx.fillText(`${r2}Ω`, pStartX + parallelResistorLen / 2, topY - 30);

    const junctionRightX = pStartX + parallelResistorLen + horizontalPadding;
    drawLine(ctx, pStartX + parallelResistorLen, topY, junctionRightX, topY);

    // Bottom branch (R3)
    drawLine(ctx, junctionLeftX, bottomY, pStartX, bottomY);
    drawResistorSymbol(ctx, pStartX, bottomY, parallelResistorLen);
    ctx.fillText(`${r3}Ω`, pStartX + parallelResistorLen / 2, bottomY + 45);
    drawLine(ctx, pStartX + parallelResistorLen, bottomY, junctionRightX, bottomY);

    // Right vertical line of parallel block
    drawLine(ctx, junctionRightX, topY, junctionRightX, bottomY);

    // Output wire
    drawLine(ctx, junctionRightX, cy, junctionRightX + wireLen, cy);
}

