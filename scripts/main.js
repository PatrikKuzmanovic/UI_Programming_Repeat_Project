window.onload = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let isGameRunning = false;

    function gameLoop() {
        if (isGameRunning) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FF0000';
            ctx.fillRect(50, 50, 50, 50);

            requestAnimationFrame(gameLoop);
        }
    }

    document.getElementById('startBtn').onclick = function() {
        isGameRunning = true;
        gameLoop();
    };

    document.getElementById('restartBtn').onclick = function() {
        isGameRunning = false;
        gameLoop();
    };

    document.getElementById('restartBtn').onclick = function() {
        isGameRunning = false;
        gameLoop();
    };
};