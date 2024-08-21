window.onload = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let isGameRunning = false;

    const map = {
        width: 2000,
        height: 2000
    };

    const player = {
        x: map.width / 2,
        y: map.height / 2,
        width: 50,
        height: 50,
        color: '#FF0000',
        speed: 5,
        health: 10,
        direction: 'right'
    };

    let moveUp = false;
    let moveDown = false;
    let moveLeft = false;
    let moveRight = false;

    const enemies = [
        {
            x: 500,
            y: 500,
            width: 40,
            height: 40,
            speed: 2,
            color: 'red',
            direction: 'right',
            health: 3
        },
    ];

    function moveEnemy(enemy) {
        if (enemy.direction === 'right') {
            enemy.x += enemy.speed;
            if (enemy.x + enemy.width > map.width) {
                enemy.direction = 'left';
            }
        } else {
            enemy.x -= enemy.speed;
            if (enemy.x < 0) {
                enemy.direction = 'right';
            }
        }
    }

    const projectiles = [];

    function shootProjectile() {
        const projectile = {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            width: 5,
            height: 5,
            speed: 5,
            direction: player.direction
        };
        projectiles.push(projectile);
    }

    function moveProjectile(projectile) {
        if (projectile.direction === 'right') {
            projectile.x += projectile.speed;
        } else if (projectile.direction === 'left') {
            projectile.x -= projectile.speed;
        } else if (projectile.direction === 'up') {
            projectile.y -= projectile.speed;
        } else if (projectile.direction === 'down') {
            projectile.y += projectile.speed;
        }
    }

    const camera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
    };

    function updateCamera() {
        camera.x = player.x - camera.width / 2;
        camera.y = player.y - camera.height /2;

        if (camera.x < 0) camera.x = 0;
        if (camera.y < 0) camera.y = 0;
        if (camera.x + camera.width > map.width) camera.x = map.width - camera.width;
        if (camera.y + camera.height > map.height) camera.y = map.height - camera.height;
    }

    const obstacles = [
        {x: 300, y: 150, width: 100, height: 50 },
        {x: 700, y: 400, width: 150, height: 75 },
        {x: 1200, y: 800, width: 200, height: 100 },
        {x: 1600, y: 1200, width: 100, height: 200},
        {x: 500, y: 1500, width: 200, height: 50 }
    ];

    function detectCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    function gameLoop() {
        if (isGameRunning) {

            updateCamera();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const prevX = player.x;
            const prevY = player.y;
            
            let attemptedX = player.x;
            let attemptedY = player.y;

            if (moveUp) attemptedY -= player.speed;
            if (moveDown) attemptedY += player.speed;
            if (moveLeft) attemptedX -= player.speed;
            if (moveRight) attemptedX += player.speed

            if (attemptedX < 0) attemptedX=0;
            if (attemptedX + player.width > map.width) attemptedX = map.width - player.width;
            if (attemptedY < 0) attemptedY = 0;
            if (attemptedY + player.height > map.height) attemptedY = map.height - player.height;

            player.x = attemptedX;
            obstacles.forEach(obstacle => {
                if (detectCollision(player, obstacle)) {
                    player.x = prevX;
                }
            });

            player.y = attemptedY;
            obstacles.forEach(obstacle => {
                if (detectCollision(player, obstacle)) {
                    player.y = prevY;
                }
            });

            enemies.forEach(enemy => {
                moveEnemy(enemy);

                if (detectCollision(player, enemy)) {
                    player.health -= 1;
                    console.log("Player hit! Health: " + player.health);
                    if (player.health <= 0) {
                        console.log("Game Over!");
                        isGameRunning = false;
                    }
                }

                if (enemy.x < camera.x + camera.width &&
                    enemy.x + enemy.width > camera.x &&
                    enemy.y < camera.y + camera.height &&
                    enemy.y + enemy.health > camera.y) {
                    ctx.fillStyle = enemy.color;
                    ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
                }
            });

            ctx.fillStyle = '#654321';
            obstacles.forEach(obstacle => {
                if (obstacle.x < camera.x + camera.width &&
                    obstacle.x + obstacle.width > camera.x &&
                    obstacle.y < camera.y + camera.height &&
                    obstacle.y + obstacle.height> camera.y){
                    ctx.fillRect(obstacle.x - camera.x, obstacle.y - camera.y, obstacle.width, obstacle.height);
                    }
            });

            projectiles.forEach((projectile, index) => {
                moveProjectile(projectile);

                enemies.forEach((enemy, enemyIndex) => {
                    if (detectCollision(projectile, enemy)) {
                        enemy.health -= 1;
                        console.log("Enemy hit! Health: " + enemy.health);
                        projectiles.splice(index, 1);

                        if (enemy.health <= 0) {
                            console.log("Enemy defeated!");
                            enemies.splice(enemyIndex, 1);
                        }
                    }
                });

                ctx.fillStyle = 'yellow';
                ctx.fillRect(projectile.x - camera.x, projectile.y - camera.y, projectile.width, projectile.height);
            });

            ctx.fillStyle = player.color;
            ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);

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
                player.direction = 'up';
                break;
            case 'ArrowDown':
                moveDown = false;
                player.direction = 'down';
                break;
            case 'ArrowLeft':
                moveLeft = false;
                player.direction = 'left';
                break;
            case 'ArrowRight':
                moveRight = false;
                player.direction = 'right';
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

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            shootProjectile();
        }
    });
};