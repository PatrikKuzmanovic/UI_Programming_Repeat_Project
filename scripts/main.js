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
        speed: 2,
        health: 10,
        //direction: 'right'
        maxHealth: 10,
        stamina: 100,
        maxStamina: 100,
        canShoot: true,
        bulletCount: 0,
        maxBullets: 3,
    };

    let moveUp = false;
    let moveDown = false;
    let moveLeft = false;
    let moveRight = false;

    const detectionRadius = 200;

    const enemies = [
        {
            x: 500,
            y: 500,
            width: 40,
            height: 40,
            speed: 1.5,
            color: 'red',
            direction: 'right',
            health: 3,
            isAI: false
        },
        {
            x: 700,
            y: 700,
            width: 40,
            height: 40,
            speed: 1.5,
            color: 'blue',
            direction: 'right',
            health: 3,
            isAI: true
        },
    ];

    function moveEnemy(enemy) {
        if (enemy.isAI) {
            const distanceX = player.x - enemy.x;
            const distanceY = player.y - enemy.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < detectionRadius) {
                const angle = Math.atan2(distanceY, distanceX);
                const futureX = enemy.x + Math.cos(angle) * enemy.speed;
                const futureY = enemy.y + Math.sin(angle) * enemy.speed;

                const futureEnemy = {...enemy, x: futureX, y: futureY };
                let collisionDetected = false;

                obstacles.forEach(obstacle => {
                    if (detectCollision(futureEnemy, obstacle)) {
                        collisionDetected = true;
                    }
                });

                if (!collisionDetected) {
                    enemy.x = futureX;
                    enemy.y = futureY;
                } else {
                    console.log("AI enemy collision detected with an obstacle!");
                }
            } else {
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
        } else {
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
    }

    const projectiles = [];

    function shootProjectile() {
        if (player.canShoot && player.bulletCount < player.maxBullets) {
            const projectile = {
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                width: 5,
                height: 5,
                speed: 5,
                direction: player.direction
            };

            if (projectile.direction === 'right') {
                projectile.x += projectile.speed;
            } else if (projectile.direction === 'left') {
                projectile.x -= projectile.speed;
            } else if (projectile.direction === 'up') {
                projectile.y -= projectile.speed;
            } else if (projectile.direction === 'down') {
                projectile.y += projectile.speed;
            }

            projectiles.push(projectile);

            player.bulletCount++;
            reduceStamina(50);

            if (player.bulletCount >= player.maxBullets) {
                player.canShoot = false;
            }
        }
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
    
    function drawHealthBar() {
        const barWidth = 200;
        const barHeight = 20;
        const healthPercentage = player.health / player.maxHealth;
        const barX = 20;
        const barY = 20;

        ctx.fillStyle = '#000000';
        ctx.fillRect(barX, barY, barWidth, barHeight)

        ctx.fillStyle = '#FF0000';
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    }

    function drawStaminaBar() {
        const barWidth = 200;
        const barHeight = 20;
        const staminaPercentage = player.stamina / player.maxStamina;
        const barX = 20;
        const barY = 50;

        ctx. fillStyle = '#000000';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(barX, barY, barWidth * staminaPercentage, barHeight);
    }

    function reduceStamina(amount) {
        player.stamina -= amount;
        if (player.stamina < 0) player.stamina = 0;

        if (player.bulletCount >= player.maxBullets) {
            player.canShoot = false
        }
    }

    function recoverStamina() {
        if (!player.canShoot && player.stamina < player.maxStamina) {
            player.stamina += player.maxStamina / (60 * 3);

            if (player.stamina >= player.maxStamina) {
                player.stamina = player.maxStamina;
                player.bulletCount = 0;
                player.canShoot = true;
            }
        }
    }

    function gameLoop() {
        if (isGameRunning) {

            updateCamera();

            recoverStamina();

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

                let collisionDetected = false;
                obstacles.forEach(obstacle => {
                    if (detectCollision(projectile, obstacle)) {
                        collisionDetected = true;
                    }
                });

                if (collisionDetected) {
                    projectiles.splice(index, 1);
                    return;
                }

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

            drawHealthBar();
            drawStaminaBar();

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

    document.getElementById('pauseBtn').onclick = function() {
        isGameRunning = false;
        gameLoop();
    };

    document.getElementById('restartBtn').onclick = function() {
        isGameRunning = false;
        player.x = 100;
        player.y = 100;
        player.health = player.maxHealth;
        player.stamina = player.maxStamina;
        enemies.forEach(enemy => {
            enemy.health = 3;
        });
        gameLoop();
    };

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            shootProjectile();
        }
    });
};