window.onload = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let isGameRunning = false;
    let keyDropMessage = '';
    let messageTimer = 0;
    const MESSAGE_DURATION = 3000;

    const map = {
        width: 2000,
        height: 2000
    };

    let playerWidth = 144;
    let playerHeight = 128;
    let playerCurrentFrame = 0;
    let playerFrameCount = 0;
    const maxPlayerFramesPerDirection = 3;

    const playerSprite = new Image();
    playerSprite.src = 'assets/images/redDragon.png';

    const playerFrames = {
        up: [{sx: 0, sy: 0}, {sx: 144, sy: 0}, {sx: 288, sy: 0}],
        right: [{sx: 0, sy: 128}, {sx: 144, sy: 128}, {sx: 288, sy: 128}],
        down: [{sx: 0, sy: 256}, {sx: 144, sy: 256}, {sx: 288, sy: 256}],
        left: [{sx: 0, sy: 384}, {sx: 144, sy: 384}, {sx: 288, sy: 384}],
    };

    const player = {
        x: 100,
        y: 100,
        width: playerWidth,
        height: playerHeight,
        //color: '#FF0000',
        speed: 2,
        health: 10,
        //direction: 'right'
        maxHealth: 10,
        stamina: 100,
        maxStamina: 100,
        canShoot: true,
        bulletCount: 0,
        maxBullets: 3,
        direction: 'right',
    };

    let moveUp = false;
    let moveDown = false;
    let moveLeft = false;
    let moveRight = false;
    let isSprinting = false;
    let isInventoryVisible = false;
    let isShieldActive = false;
    const sprintMultiplier = 3;

    function updatePlayerMovement() {
        const prevX = player.x;
        const prevY = player.y;
        
        let attemptedX = player.x;
        let attemptedY = player.y;

        if (moveUp) {
            attemptedY -= isSprinting ? player.speed * sprintMultiplier : player.speed;
            player.direction = 'up';
        }
        if (moveDown) {
            attemptedY += isSprinting ? player.speed * sprintMultiplier : player.speed;
            player.direction = 'down';
        }
        if (moveLeft) {
            attemptedX -= isSprinting ? player.speed * sprintMultiplier: player.speed;
            player.direction = 'left';
        }
        if (moveRight) {
            attemptedX += isSprinting ? player.speed * sprintMultiplier : player.speed;
            player.direction = 'right';
        }

        if (attemptedX < 0) attemptedX = 0;
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

        frameCount++;
        if (frameCount >= 10) {
            playerCurrentFrame = (playerCurrentFrame + 1) % maxPlayerFramesPerDirection;
            frameCount = 0;
        }
    }

    function drawPlayer() {
        const frame = playerFrames[player.direction][playerCurrentFrame];
        ctx.drawImage(
            playerSprite,
            frame.sx, frame.sy, playerWidth, playerHeight,
            player.x - camera.x, player.y - camera.y, player.width, player.height
        );
    }

    let blueEnemyLastHitTime = 0;

    let enemyWidth = 48;
    let enemyHeight = 64;
    let enemyCurrentFrame = 0;
    let soldierFrameCount = 0;
    const maxEnemyFrames = 3;

    const enemySprite = new Image();
    enemySprite.src = 'assets/images/soldier.png';
    const enemyFrames = {
        up: [{sx: 0, sy: 0}, {sx: 48, sy: 0}, {sx: 96, sy: 0}],
        right: [{sx: 0, sy: 64}, {sx: 48, sy: 64}, {sx: 96, sy: 64}],
        down: [{sx: 0, sy: 128}, {sx: 48, sy: 128}, {sx: 96, sy: 128}],
        left: [{sx: 0, sy: 192}, {sx: 48, sy: 192}, {sx: 96, sy: 192}],
    };

    let dragonWidth = 144;
    let dragonHeight = 128;
    let dragonCurrentFrame = 0;
    let frameCount = 0;
    const maxFramesPerDirection = 3;

    const dragonSprite = new Image();
    dragonSprite.src = 'assets/images/blueDragon.png';
    const dragonFrames = {
        up: [{sx: 0, sy: 0}, {sx: 144, sy: 0}, {sx: 288, sy: 0}],
        right: [{sx: 0, sy: 128}, {sx: 144, sy: 128}, {sx: 288, sy: 128}],
        down: [{sx: 0, sy: 256}, {sx: 144, sy: 256}, {sx: 288, sy: 256}],
        left: [{sx: 0, sy: 384}, {sx: 144, sy: 384}, {sx: 288, sy: 384}],
    };

    const detectionRadius = 200;

    const enemies = [
        {
            x: 500,
            y: 400,
            width: enemyWidth,
            height: enemyHeight,
            speed: 1.5,
            //color: 'red',
            direction: 'right',
            health: 3,
            isAI: false,
            isSoldier: true,
            patrolDirection: 'horizontal',
        },
        {
            x: 900,
            y: 900,
            width: dragonWidth,
            height: dragonHeight,
            speed: 1.5,
            direction: 'right',
            health: 7,
            isAI: true,
            isDragon: true
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
            }
        }

        const prevX = enemy.x;
        const prevY = enemy.y;
        
        if (enemy.direction === 'right') {
            enemy.x += enemy.speed;
        } else if (enemy.direction === 'left') {
            enemy.x -= enemy.speed;
        } else if (enemy.direction === 'up') {
            enemy.y -= enemy.speed;
        } else if (enemy.direction === 'down') {
            enemy.y += enemy.speed;
        }

        let collisionDetected = false;
        obstacles.forEach(obstacle => {
            if (detectCollision(enemy, obstacle)) {
                collisionDetected = true;
            }
        });

        if (collisionDetected) {
            enemy.x = prevX;
            enemy.y = prevY;

            if (enemy.direction === 'right') {
                enemy.direction = 'left';
            } else if (enemy.direction === 'left') {
                enemy.direction = 'right';
            } else if (enemy.direction === 'up') {
                enemy.direction = 'down';
            } else if (enemy.direction === 'down') {
                enemy.direction = 'up';
            }
        }

        if (enemy.isSoldier) {
            soldierFrameCount++;
            if (soldierFrameCount >= 10) {
                enemyCurrentFrame = (enemyCurrentFrame + 1) % maxEnemyFrames;
                soldierFrameCount = 0;
            }
        }

        if (enemy.x + enemy.width > map.width) {
            enemy.x = map.width - enemy.width;
            enemy.direction = 'left';
        }
        if (enemy.x < 0) {
            enemy.x = 0;
            enemy.direction = 'right';
        }
        if (enemy.y + enemy.height > map.height) {
            enemy.y = map.height - enemy.height;
            enemy.direction = 'up';
        }
        if (enemy.y < 0) {
            enemy.y = 0;
            enemy.direction = 'down';
        }
    }

    const fireballSprite = new Image();
    fireballSprite.src = 'assets/images/fireball.png';

    const fireballWidth = 920 / 6;
    const fireballHeight = 154;
    const fireballAnimationSpeed = 5;

    const projectiles = [];

    function shootProjectile() {
        if (player.canShoot && player.stamina === player.maxStamina) {
            const projectile = {
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                width: 15,
                height: 15,
                speed: 5,
                direction: player.direction,
                frame: 0,
                frameCount: 0
            };
            
            projectiles.push(projectile);

            player.canShoot = false;
            reduceStamina(player.maxStamina / 2);
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

        projectile.frameCount++;
        if (projectile.frameCount >= fireballAnimationSpeed) {
            projectile.frame = (projectile.frame + 1) % 6;
            projectile.frameCount = 0;
        }
    }

    function drawProjectiles() {
        projectiles.forEach((projectile, index) => {
            ctx.drawImage(
                fireballSprite,
                projectile.frame * fireballWidth, 0, fireballWidth, fireballHeight,
                projectile.x - camera.x, projectile.y - camera.y, projectile.width, projectile.height
            );

            if (moveProjectile(projectile)) {
                projectiles.splice(index, 1);
            }
        })
    }

    const arrowSprite = new Image();
    arrowSprite.src = 'assets/images/arrow.png';

    const enemyProjectiles = [];

    function shootEnemyProjectile(enemy) {
        const directions = ['up', 'down', 'left', 'right'];
        const direction = directions[Math.floor(Math.random() * directions.length)];

        const projectile = {
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            width: 20,
            height: 10,
            speed: 3,
            direction: direction
        };

        enemyProjectiles.push(projectile);
    }

    function startEnemyShooting() {
        setInterval(() => {
            enemies.forEach(enemy => {
                if (enemy.isSoldier) {
                    shootEnemyProjectile(enemy);
                }
            });
        }, 2000);
    }

    function moveEnemyProjectile(projectile) {
        if (projectile.direction === 'right') {
            projectile.x += projectile.speed;
        } else if (projectile.direction === 'left') {
            projectile.x -= projectile.speed;
        } else if (projectile.direction === 'up') {
            projectile.y -= projectile.speed;
        } else if (projectile.direction === 'down') {
            projectile.y += projectile.speed;
        }

        if (detectCollision(projectile, player)) {
            if (!isShieldActive) {
                player.health -= 6;
                console.log("Player hit by enemy projectile, Health: " + player.health);

                if (player.health <= 0) {
                    console.log("Game Over");
                    isGameRunning = false;
                }
            } else {
                console.log("Enemy projectile blocked by shield");
            }

            return true;
        }

        let collisionDetected = false;
        obstacles.forEach(obstacle => {
            if (detectCollision(projectile, obstacle)) {
                collisionDetected= true;
            }
        });

        if (collisionDetected) {
            return true;
        }

        if (projectile.x < 0 || projectile.x > map.width || projectile.y < 0 || projectile.y > map.height) {
            return true;
        }

        return false;
    }

    function drawEnemyProjectiles() {
        enemyProjectiles.forEach((projectile, index) => {
            const shouldRemove = moveEnemyProjectile(projectile);
            if (shouldRemove) {
                enemyProjectiles.splice(index, 1);
            } else {
                ctx.drawImage(
                    arrowSprite,
                    projectile.x - camera.x, projectile.y - camera.y, projectile.width, projectile.height
                );
            }
        });
    }

    const wallImage = new Image();
    wallImage.src = 'assets/images/wall2.jpg';

    const walkwayImage = new Image();
    walkwayImage.src = 'assets/images/walkway.jpg'

    function drawWalkway() {
        const pattern = ctx.createPattern(walkwayImage, 'repeat');
        ctx.fillStyle = pattern;
        //ctx.fillRect(0 - camera.x, 0 - camera.y, map.width, map.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const spikeImages = [];
    for (let i = 1; i <= 4; i++) {
        const img = new Image();
        img.src = `assets/images/long_metal_spike_0${i}.png`;
        spikeImages.push(img);
    }

    const spikeTrap = {
        x: 600,
        y: 600,
        width: 50,
        height: 50,
        currentFrame: 0,
        frameCount: 0,
        maxFrames: spikeImages.length,
        animationSpeed: 15,
    };
    
    function drawSpikeTrap() {
        ctx.drawImage(spikeImages[spikeTrap.currentFrame], spikeTrap.x - camera.x, spikeTrap.y - camera.y, spikeTrap.width, spikeTrap.height);
    }
    
    function updateSpikeTrap() {
        spikeTrap.frameCount++;
        if (spikeTrap.frameCount >= spikeTrap.animationSpeed) {
            spikeTrap.currentFrame = (spikeTrap.currentFrame + 1) % spikeTrap.maxFrames;
            spikeTrap.frameCount = 0;
        }
    }
    
    function checkSpikeCollision() {
        if (detectCollision(player, spikeTrap)) {
            player.health -= 5;
            console.log("Player hit by spike trap, Health: " + player.health);
            if (player.health <= 0) {
                console.log("Game Over!");
                isGameRunning = false;
            }
        }
    }
    

    const doorImage = new Image();
    doorImage.src = 'assets/images/door.png';
    const door = {x: 1745, y: 1585, width: 64, height: 96};

    function activeShield() {
        const shieldIndex = inventory.indexOf('shield(s)');
        if (shieldIndex !== -1 && !isShieldActive) {
            isShieldActive = true;
            inventory.splice(shieldIndex, 1);

            setTimeout(() =>{
                isShieldActive = false;
            }, 3000);
        } else {
            console.log("No shield available or is already active");
        }
    }
    
    function getRandomPosition() {
        const x = Math.floor(Math.random() * (map.width - 30));
        const y = Math.floor (Math.random() * (map.height - 30));
        return { x, y };
    }

    const items = [
        {x: 500, y: 600, width: 30, height: 30, type: 'key', color: 'gold'},
        {x: 900, y: 500, width: 30, height: 30, type: 'potion(p)', color: 'purple'},
        {x: 1000, y: 800, width: 30, height: 30, type: 'shield(s)', color: 'blue'}
    ];

    const inventory = [];

    function collectItem(itemIndex) {
        const item = items[itemIndex];
        inventory.push(item.type);
        items.splice(itemIndex, 1);
        console.log('Collected:', item.type);
    }
    
    function checkItemCollection() {
        items.forEach((item, index) => {
            if (detectCollision(player, item)) {
                collectItem(index);
            }
        });
    }

    function drawInventory() {
        if (isInventoryVisible) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, 10, 300, 200);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.fillText('Inventory:', 20, 40);

            inventory.forEach((item, index) => {
                ctx.fillText(item, 20, 60 + index * 20);
            });
        }
    }

    const obstacles = [
        {x: 0, y: 0, width: 2000, height: 50},
        {x: 0, y: 1950, width: 2000, height: 50},
        {x: 0, y: 0, width: 50, height: 2000},
        {x: 1950, y: 0, width: 50, height: 2000},

        {x: 300, y: 0, width: 50, height: 1500},
        {x: 500, y: 500, width: 50, height: 1500},
        {x: 800, y: 100, width: 50, height: 900},
        {x: 1100, y: 1000, width: 50, height: 1000},
        {x: 1500, y: 100, width: 50, height: 1400},
        {x: 1700, y: 600, width: 50, height: 1400},

        {x: 800, y: 400, width: 500, height: 50},
        {x: 1200, y: 800, width: 500, height: 50},
        {x: 1600, y: 1600, width: 300, height: 50},
    ];

    //const door = {x: 1780, y: 1780, width: 40, height: 40, color: 'brown'};

    function checkDoorCollision() {
        if (detectCollision(player, door)) {
            if (inventory.includes('key')) {
                console.log("Player reached the door!");
            } else {
                keyDropMessage = "You need a key to open the door";
                messageTimer = MESSAGE_DURATION;
            }
        }
    }

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

    function saveGame() {
        const gameState = {
            player: {
                x: player.x,
                y: player.y,
                width: player.width,
                height: player.height,
                speed: player.speed,
                health: player.health,
                maxHealth: player.maxHealth,
                stamina: player.stamina,
                maxStamina: player.maxStamina,
                canShoot: player.canShoot,
                bulletCount: player.bulletCount,
                maxBullets: player.maxBullets,
                direction: player.direction
            },
            enemies: enemies.map(enemy => ({
                x: enemy.x,
                y: enemy.y,
                width: enemy.width,
                height: enemy.height,
                speed: enemy.speed,
                direction: enemy.direction,
                health: enemy.health,
                isAI: enemy.isAI,
                isSoldier: enemy.isSoldier,
                isDragon: enemy.isDragon,
                patrolDirection: enemy.patrolDirection
            })),
            projectiles: projectiles.map(projectile => ({
                x: projectile.x,
                y: projectile.y,
                width: projectile.width,
                height: projectile.height,
                speed: projectile.speed,
                direction: projectile.direction,
                frame: projectile.frame
            })),
            enemyProjectiles: enemyProjectiles.map(projectile => ({
                x: projectile.x,
                y: projectile.y,
                width: projectile.y,
                height: projectile.height,
                speed: projectile.speed,
                direction: projectile.direction
            })),
            items: items.map(item => ({
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                type: item.type,
                color: item.color
            })),
            inventory: [...inventory],
            isGameRunning: isGameRunning,
            camera: {
                x: camera.x,
                y: camera.y
            }
        };

        localStorage.setItem('gameState', JSON.stringify(gameState));
        console.log('Game saved!');
    }

    function loadGame() {
        const savedState = localStorage.getItem('gameState');
        if (!savedState) {
            console.log('No saved game Found');
            return;
        }

        const gameState = JSON.parse(savedState);

        Object.assign(player, gameState.player);

        enemies.length = 0;
        gameState.enemies.forEach(enemy => enemies.push(enemy));

        projectiles.length = 0;
        gameState.projectiles.forEach(projectile => projectiles.push(projectile));

        enemyProjectiles.length = 0;
        gameState.enemyProjectiles.forEach(projectile => enemyProjectiles.push(projectile));

        items.length = 0;
        gameState.items.forEach(item => items.push(item));

        inventory.length = 0;
        gameState.inventory.forEach(item => inventory.push(item));

        isGameRunning = gameState.isGameRunning;
        Object.assign(camera, gameState.camera);

        console.log('Game loaded');
    }

    function restoreHealth(amount) {
        const potionIndex = inventory.indexOf('potion(p)');
        if (potionIndex !== -1) {
            player.health += amount;
            if (player.health > player.maxHealth) {
                player.health = player.maxHealth;
            }
            console.log("Potion used! Health restpred. Current Health: " + player.health);

            inventory.splice(potionIndex, 1);
        } else {
            console.log("No potion available to use!");
        }
    }
    
    function drawHealthBar() {
        const barWidth = 200;
        const barHeight = 20;
        const healthPercentage = player.health / player.maxHealth;
        const barX = 20;
        const barY = 20;

        ctx.fillStyle = '#000000';
        ctx.fillRect(barX, barY, barWidth, barHeight)

        ctx.fillStyle = isShieldActive ? '#0000FF' : '#FF0000';
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

        if (player.stamina === 0) {
            player.canShoot = false;
            isSprinting = false;
        }
    }

    function drainStaminaForSprint() {
        if (isSprinting) {
            reduceStamina(2);
            if (player.stamina <= 0) {
                player.stamina = 0;
                isSprinting = false;
            }
        }
    }

    function recoverStamina() {
        if (player.stamina < player.maxStamina) {
            player.stamina += player.maxStamina / (60 * 3);

            if (player.stamina >= player.maxStamina) {
                player.stamina = player.maxStamina;
                player.canShoot = true;
                //player.canSprint = true;
            }
        }
    }

    function gameLoop() {
        if (isGameRunning) {

            updateCamera();
            updatePlayerMovement();
            updateSpikeTrap();

            checkDoorCollision();
            drainStaminaForSprint();
            recoverStamina();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawWalkway();
            drawSpikeTrap();
            drawProjectiles();
            drawEnemyProjectiles();

            drawPlayer();
            checkItemCollection();
            checkSpikeCollision();

            items.forEach(item => {
                ctx.fillStyle = item.color;
                ctx.fillRect(item.x - camera.x, item.y - camera.y, item.width, item.height);
            });

            enemies.forEach(enemy => {
                moveEnemy(enemy);

                if (enemy.isAI && !isShieldActive && detectCollision(player, enemy)) {
                    const currentTime = Date.now();
                    const timeSinceLastHit = currentTime - blueEnemyLastHitTime;

                    if (timeSinceLastHit > 1000) {
                        player.health -= 4;
                        console.log("Player hit by blue AI enemy, Health: " + player.health);
                        blueEnemyLastHitTime = currentTime;

                        const knockbackStrength = 30;
                        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                        player.x += Math.cos(angle) * knockbackStrength;
                        player.y += Math.sin(angle) * knockbackStrength;

                        if (player.x < 0) player.x = 0;
                        if (player.x + player.width > map.width) player.x = map.width - player.width;
                        if (player.y < 0) player.y = 0;
                        if (player.y + player.health > map.height) player.y = map.height - player.height;

                        obstacles.forEach(obstacle => {
                            if (detectCollision(player, obstacle)) {
                                player.x = prevX;
                                player.y = prevY;
                            }
                        });
                    }
                    if (player.health <= 0) {
                        console.log("Game Over!");
                        isGameRunning = false;
                    }
                }

                if (enemy.x < camera.x + camera.width &&
                    enemy.x + enemy.width > camera.x &&
                    enemy.y < camera.y + camera.height &&
                    enemy.y + enemy.health > camera.y) {
                    
                    if (enemy.isDragon) {
                        const frame = dragonFrames[enemy.direction][dragonCurrentFrame];

                        ctx.drawImage(
                            dragonSprite,
                            frame.sx, frame.sy, dragonWidth, dragonHeight,
                            enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height
                        );
                    } else if (enemy.isSoldier) {
                        const frame = enemyFrames[enemy.direction][enemyCurrentFrame];
                        
                        ctx.drawImage(
                            enemySprite,
                            frame.sx, frame.sy, enemyWidth, enemyHeight,
                            enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height
                        );
                    } else {
                        ctx.fillStyle = enemy.color;
                        ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
                    }
                    frameCount++;
                        if (frameCount >= 10) {
                            dragonCurrentFrame = (dragonCurrentFrame + 1) % maxFramesPerDirection;
                            frameCount = 0;
                        }
                }
            });

            enemyProjectiles.forEach((projectile, index) => {
                const shouldRemove = moveEnemyProjectile(projectile);
                if (shouldRemove) {
                    enemyProjectiles.splice(index, 1);
                } else {
                    ctx.drawImage(
                        arrowSprite,
                        projectile.x - camera.x, projectile.y - camera.y, projectile.width, projectile.height
                    );
                }
            });

            //ctx.fillStyle = '#654321';
            obstacles.forEach(obstacle => {
                if (obstacle.x < camera.x + camera.width &&
                    obstacle.x + obstacle.width > camera.x &&
                    obstacle.y < camera.y + camera.height &&
                    obstacle.y + obstacle.height> camera.y){
                    //ctx.fillRect(obstacle.x - camera.x, obstacle.y - camera.y, obstacle.width, obstacle.height);
                    const pattern = ctx.createPattern(wallImage, 'repeat');
                    ctx.fillStyle = pattern;
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
                        collisionDetected = true;
                        enemy.health -= 1;
                        console.log("Enemy hit! Health: " + enemy.health);
                        projectiles.splice(index, 1);

                        if (enemy.health <= 0) {
                            console.log("Enemy defeated!");
                            enemies.splice(enemyIndex, 1);

                            const keyPosition = getRandomPosition();
                            items.push({
                                x: keyPosition.x,
                                y: keyPosition.y,
                                width: 30,
                                height: 30,
                                type: 'key',
                                color: 'gold'
                            });

                            console.log("Key dropped at: ", keyPosition);

                            keyDropMessage = 'A key is Dropped somewhere!';
                            messageTimer = MESSAGE_DURATION;
                        }
                    }
                });

                items.forEach(item => {
                    if (item.type === 'key') {
                        ctx.fillStyle = item.color;
                        ctx.fillRect(item.x - camera.x, item.y - camera.y, item.width, item.height)
                    };
                })

                if (collisionDetected || 
                    projectile.x < 0 || projectile.x > map.width ||
                    projectile.y < 0 || projectile.y > map.height) {
                    projectiles.splice(index, 1);
                    }

                ctx.drawImage(
                    fireballSprite,
                    projectile.frame * fireballWidth, 0, fireballWidth, fireballHeight,
                    projectile.x - camera.x, projectile.y - camera.y, projectile.width, projectile.height
                );
                ctx.fillRect(projectile.x - camera.x, projectile.y - camera.y, projectile.width, projectile.height);
            });

            ctx.drawImage(
                doorImage,
                door.x - camera.x,
                door.y - camera.y,
                door.width,
                door.height
            );
            drawHealthBar();
            drawStaminaBar();
            drawInventory();

            if (keyDropMessage) {
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.textAlign = 'central';
                ctx.fillText(keyDropMessage, canvas.width / 2, 30);

                messageTimer -= 1000 / 60;
                if (messageTimer <= 0) {
                    keyDropMessage = '';
                }
            }

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
            case 'Shift':
                if (player.stamina === player.maxStamina) {
                    isSprinting = true;
                }
                break;
            case 'Tab':
                isInventoryVisible = true;
                event.preventDefault();
                break;
            case 'p':
                restoreHealth(2);
                break;
            case 's':
                activeShield();
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
            case 'Shift':
                isSprinting = false;
                break;
            case 'Tab':
                isInventoryVisible = false;
                event.preventDefault();
                break;
        }
    });

    document.getElementById('startBtn').onclick = function() {
        isGameRunning = true;
        startEnemyShooting();
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

    document.getElementById('saveButton').addEventListener('click', saveGame);
    document.getElementById('loadButton').addEventListener('click', loadGame);

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            shootProjectile();
        }
    });
};