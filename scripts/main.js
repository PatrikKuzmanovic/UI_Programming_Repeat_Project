window.onload = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let isGameRunning = false;

    const player = {
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        color: '#FF0000',
        speed: 5
    };

    let moveUp = false;
    let moveDown = false;
    let moveLeft = false;
    let moveRight = false;

    function gameLoop() {
        if (isGameRunning) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (moveUp) player.y -= player.speed;
            if (moveDown) player.y += player.speed;
            if (moveLeft) player.x -= player.speed;
            if (moveRight) player.x += player.speed;
            
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.width, player.height);

            requestAnimationFrame(gameLoop);
        }
    }

    window.addEventListener('keydown', function(event){
        switch(event.key) {
            case 'ArrowUp':
                moveUp = true;
                break;
            case 'ArrowDown':
                moveDown = true;
                break;
            case 'ArrowLeft':
                moveLeft = true;
                break;
            case 'ArrowRight':
                moveRight = true;
                break;
        }
    });

    window.addEventListener('keyup', function(event){
        switch(event.key){
            case 'ArrowUp':
                moveUp = false;
                break;
            case 'ArrowDown':
                moveDown = false;
                breakk
            case 'ArrowLeft':
                moveLeft = false;
                break;
            case 'ArrowRight':
                moveRight = false;
                break;
        }
    });

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
        player.x = 100;
        player.y = 100;
        gameLoop();
    };
};