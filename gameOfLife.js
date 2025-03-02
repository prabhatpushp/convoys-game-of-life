document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    let cellSize = 20;
    let grid = {};
    let fadeFactor = 0.01;
    let offsetX = 0,
        offsetY = 0;
    let scale = 1;
    let isPanning = false;
    let startX, startY;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function initializeGrid() {
        const cols = Math.ceil(canvas.width / cellSize) * 2;
        const rows = Math.ceil(canvas.height / cellSize) * 2;
        for (let col = -cols; col < cols; col++) {
            for (let row = -rows; row < rows; row++) {
                grid[`${col},${row}`] = Math.random() > 0.8 ? 1 : 0;
            }
        }
    }

    function calculateNextGeneration() {
        let newGrid = {};
        let neighbors = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ];

        for (let key in grid) {
            let [col, row] = key.split(",").map(Number);
            let liveNeighbors = 0;
            neighbors.forEach(([dx, dy]) => {
                let neighborKey = `${col + dx},${row + dy}`;
                liveNeighbors += grid[neighborKey] === 1 ? 1 : 0;
            });

            if (grid[key] === 1) {
                newGrid[key] = liveNeighbors === 2 || liveNeighbors === 3 ? 1 : 0.9;
            } else {
                newGrid[key] = liveNeighbors === 3 ? 1 : grid[key] > 0 ? grid[key] - fadeFactor : 0;
            }
        }

        grid = newGrid;
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let key in grid) {
            let [col, row] = key.split(",").map(Number);
            let alpha = grid[key];
            if (grid[key] === 1) {
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            } else {
                ctx.fillStyle = `rgba(0, 0, 0, ${1 - alpha})`; // Invert alpha for dead cells
            }
            ctx.fillRect(col * cellSize * scale + offsetX, row * cellSize * scale + offsetY, cellSize * scale, cellSize * scale);
            ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
            ctx.strokeRect(col * cellSize * scale + offsetX, row * cellSize * scale + offsetY, cellSize * scale, cellSize * scale);
        }
    }

    canvas.addEventListener("mousedown", (e) => {
        isPanning = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (isPanning) {
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
        }
    });

    canvas.addEventListener("mouseup", () => {
        isPanning = false;
    });

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        const zoom = e.deltaY < 0 ? 1.1 : 0.9;
        scale *= zoom;
        offsetX = e.clientX - (e.clientX - offsetX) * zoom;
        offsetY = e.clientY - (e.clientY - offsetY) * zoom;
    });

    function gameLoop() {
        calculateNextGeneration();
        drawGrid();
        requestAnimationFrame(gameLoop);
    }

    initializeGrid();
    gameLoop();
});
