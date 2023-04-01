const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const coords = {
    x: null,
    y: null,
};

const reposition = (ev) => {
    coords.x = ev.x - canvas.offsetLeft;
    coords.y = ev.y - canvas.offsetTop;
};

const draw = (ev) => {
    if (isErasing) color = canvasColor;

    ctx.beginPath();
    ctx.lineWidth = radius;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isRainbow ? rainbowColor : color;
    ctx.moveTo(coords.x, coords.y);
    reposition(ev);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    if (isRainbow) {
        hue += 1;
        rainbowColor = `hsl(${hue}, 80%, 70%)`;
    }
};

const fillCanvas = (color) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const beginDrawing = (ev) => {
    canvas.addEventListener('mousemove', draw);
    reposition(ev);
};

const stopDrawing = () => {
    canvas.removeEventListener('mousemove', draw);
};

canvas.addEventListener('mousedown', (ev) => {
    if (current === btnBucket) {
        fillCanvas(color);
        canvasColor = color;
    } else {
        beginDrawing(ev);
    }
});

canvas.addEventListener('click', (ev) => {
    draw(ev);
});

canvas.addEventListener('mouseup', stopDrawing);

let radius = 5; // para el input range y el puntero
let color = '#000'; // para el selector de color
let canvasColor = 'white'; // para cuando borramos y usamos el balde
let hue = 15; // para el input rainbow
let isRainbow = false;
let isErasing = false;
let rainbowColor = `hsl(${hue}, 80%, 70%)`;

// Puntero
window.addEventListener('mousemove', (ev) => {
    coords.x = ev.x;
    coords.y = ev.y;
    pointer.style.top = ev.y + 'px';
    pointer.style.left = ev.x + 'px';
});

const getRandomColor = () => {
    // No puede ser en hsl porque uso este valor para
    // reflejar el cambio también en el input type="color"
    // y solo acepta values que sean hexadecimales.
    color = '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
};

const updateCurrent = (elem) => {
    current.classList.remove('active');
    current = elem;
    current.classList.add('active');
};

//
// ========== DOM TOOLS ==========
//
const root = document.querySelector(':root');
const [btnBrush, btnEraser, btnRainbow, btnBucket, btnRandom, btnClear] =
    document.querySelectorAll('button');
const [inputColor, inputRange] = document.querySelectorAll('input');
const brushSize = document.querySelector('.brush-size');

let current = btnBrush; // nuestra herramienta activa
btnBrush.classList.add('active');

// Pincel
const selectBrushTool = () => {
    updateCurrent(btnBrush);
    isRainbow = false;
    isErasing = false;
    color = inputColor.value || 'black';
};
btnBrush.addEventListener('click', selectBrushTool);

// Borrador
const selectEraserTool = () => {
    updateCurrent(btnEraser);
    isRainbow = false;
    isErasing = true;
};
btnEraser.addEventListener('click', selectEraserTool);

// Arcoiris
const selectRainbowTool = () => {
    updateCurrent(btnRainbow);
    isRainbow = true;
    isErasing = false;
};
btnRainbow.addEventListener('click', selectRainbowTool);

// Balde
const selectBucketTool = () => {
    isRainbow = false;
    isErasing = false;
    color = inputColor.value || 'black';
    updateCurrent(btnBucket);
};
btnBucket.addEventListener('click', selectBucketTool);

// Color random
const selectRandomColorTool = () => {
    getRandomColor();
    inputColor.value = color;
    root.style.setProperty('--current-color', color);
};
btnRandom.addEventListener('click', selectRandomColorTool);

// Selector de color
inputColor.addEventListener('change', (ev) => {
    color = ev.target.value;
    root.style.setProperty('--current-color', ev.target.value);
});

// Tamaño pincel
inputRange.addEventListener('input', (ev) => {
    radius = ev.target.value;
    let size = radius + 'px';
    brushSize.innerText = size;
    pointer.style.width = size;
    pointer.style.height = size;
});

// Limpiar pizarra
const selectClearBoard = () => fillCanvas('white');
btnClear.addEventListener('click', selectClearBoard);

//
// ========== MODAL ==========
//
const btnInfo = document.getElementById('btn-info');
const btnClose = document.getElementById('btn-close');
const overlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');

const openModal = () => {
    overlay.classList.add('visible');
    modal.classList.add('visible');
};
btnInfo.addEventListener('click', openModal);

btnClose.addEventListener('click', () => {
    overlay.classList.remove('visible');
    modal.classList.remove('visible');
});

overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) {
        overlay.classList.remove('visible');
        modal.classList.remove('visible');
    }
});

window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
        overlay.classList.remove('visible');
        modal.classList.remove('visible');
    }
});

//
// ========== DESCARGAR IMAGEN ==========
//
const btnDownload = document.getElementById('btn-download');

btnDownload.addEventListener('click', () => {
    btnDownload.href = canvas.toDataURL('image/png');
});

//
// ========== SELECCIÓN CON TECLADO ==========
//
const selectColorTool = () => inputColor.click();
const selectSizeTool = () => inputRange.focus();
const selectDownloadTool = () => btnDownload.click();

const keyMaps = {
    a: selectRainbowTool,
    b: selectEraserTool,
    c: selectRandomColorTool,
    d: selectDownloadTool,
    i: openModal,
    n: selectClearBoard,
    p: selectBrushTool,
    r: selectBucketTool,
    s: selectColorTool,
    t: selectSizeTool,
};
window.addEventListener('keydown', (ev) => {
    const pressedKey = ev.key.toLowerCase();
    if (keyMaps.hasOwnProperty(pressedKey)) {
        keyMaps[pressedKey]();
    }
});