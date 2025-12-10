
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
    ctx.font = '24px Inter, sans-serif';
    ctx.textAlign = 'center';

    const cx = w / 2;
    const cy = h / 2;

    if (problem.type === 'series') {
        const r1 = problem.resistors[0];
        const r2 = problem.resistors[1];

        // Simple Series: Line -> Resistor -> Line -> Resistor -> Line
        const y = cy;
        const totalW = 400;
        const startX = cx - totalW / 2;

        // Draw wires and resistors
        ctx.beginPath();
        ctx.moveTo(startX, y);

        // R1
        drawZigZagResistor(ctx, startX + 50, y, 60);
        ctx.fillText(`${r1}Ω`, startX + 80, y - 40);

        // Wire between
        ctx.moveTo(startX + 110, y);
        ctx.lineTo(startX + 290, y);

        // R2
        drawZigZagResistor(ctx, startX + 290, y, 60);
        ctx.fillText(`${r2}Ω`, startX + 320, y - 40);

        // End wire
        ctx.moveTo(startX + 350, y);
        ctx.lineTo(startX + 400, y);

        ctx.stroke();

    } else if (problem.type === 'parallel') {
        const r1 = problem.resistors[0];
        const r2 = problem.resistors[1];

        // Parallel Box
        const leftX = cx - 100;
        const rightX = cx + 100;
        const topY = cy - 60;
        const bottomY = cy + 60;

        ctx.beginPath();
        // Main Input/Output wires
        ctx.moveTo(cx - 180, cy);
        ctx.lineTo(leftX, cy);

        // Split vertical
        ctx.moveTo(leftX, topY);
        ctx.lineTo(leftX, bottomY);

        // Top Branch
        ctx.moveTo(leftX, topY);
        // Resistor
        drawZigZagResistor(ctx, leftX + 40, topY, 120);
        ctx.fillText(`${r1}Ω`, cx, topY - 30);
        ctx.moveTo(rightX - 40, topY); // Resume from resistor end
        ctx.lineTo(rightX, topY);

        // Bottom Branch
        ctx.moveTo(leftX, bottomY);
        // Resistor
        drawZigZagResistor(ctx, leftX + 40, bottomY, 120);
        ctx.fillText(`${r2}Ω`, cx, bottomY - 30);
        ctx.moveTo(rightX - 40, bottomY);
        ctx.lineTo(rightX, bottomY);

        // Join vertical
        ctx.moveTo(rightX, topY);
        ctx.lineTo(rightX, bottomY);

        // Output wire
        ctx.moveTo(rightX, cy);
        ctx.lineTo(cx + 180, cy);

        ctx.stroke();

    } else if (problem.type === 'mixed-s-p') {
        // R1 + (R2 || R3)
        const r1 = problem.resistors[0];
        const r2 = problem.resistors[1];
        const r3 = problem.resistors[2];

        const startX = 50;
        const y = cy;

        ctx.beginPath();
        ctx.moveTo(startX, y);

        // R1 (Series part)
        drawZigZagResistor(ctx, startX + 50, y, 60);
        ctx.fillText(`${r1}Ω`, startX + 80, y - 40);

        // Connect to Parallel Block
        const junctionX = startX + 150;
        ctx.moveTo(startX + 110, y);
        ctx.lineTo(junctionX, y);

        // Parallel Block
        const blockW = 200;
        const endX = junctionX + blockW;
        const topY = y - 50;
        const bottomY = y + 50;

        // Vertical Split
        ctx.moveTo(junctionX, topY);
        ctx.lineTo(junctionX, bottomY);

        // Top R2
        ctx.moveTo(junctionX, topY);
        drawZigZagResistor(ctx, junctionX + 40, topY, 120);
        ctx.fillText(`${r2}Ω`, junctionX + 100, topY - 30);

        // Bottom R3
        ctx.moveTo(junctionX, bottomY);
        drawZigZagResistor(ctx, junctionX + 40, bottomY, 120);
        ctx.fillText(`${r3}Ω`, junctionX + 100, bottomY - 30);

        // Vertical Join
        ctx.moveTo(endX, topY);
        ctx.lineTo(endX, bottomY);

        // Out wire
        ctx.moveTo(endX, y);
        ctx.lineTo(endX + 50, y);

        ctx.stroke();
    }
}

function drawZigZagResistor(ctx, x, y, length) {
    // Draws a zig-zag symbol starting at x,y with total length
    // Standard resistor symbol has ~6 zigs
    const seg = length / 6;
    const h = 15; // height of zig

    ctx.moveTo(x, y);
    /* 
       We need to draw the zig zag carefully. 
       Usually it goes up-down-up-down...
       Actually: move slightly in, then up, down, up, down... then slightly out.
       Let's simplify: simple zig zag 
    */
    ctx.lineTo(x + seg * 0.5, y - h);
    ctx.lineTo(x + seg * 1.5, y + h);
    ctx.lineTo(x + seg * 2.5, y - h);
    ctx.lineTo(x + seg * 3.5, y + h);
    ctx.lineTo(x + seg * 4.5, y - h);
    ctx.lineTo(x + seg * 5.5, y + h); // This might be too many
    ctx.lineTo(x + length, y);
}
