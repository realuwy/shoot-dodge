<!DOCTYPE html>
<html>
<head>
    <title>Run and Gun Game</title>
    <style>
        #gameCanvas {
            border: 1px solid #000;
        }
        #score {
            font-family: Arial, sans-serif;
            font-size: 24px;
            color: #000;
            text-align: right;
            margin: 10px;
        }
        #startButton,
        #pauseButton,
        #scoreboard {
            display: block;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="400"></canvas>
    <div id="score">Score: 0</div>
    <button id="startButton">Start</button>
    <button id="pauseButton" disabled>Pause</button>
    <div id="scoreboard">Best Run: 0</div>
    <audio id="bgMusic" loop>
        <source src="background_music.mp3" type="audio/mpeg">
    </audio>
    <script>
        // Game variables
        const canvas = document.getElementById("gameCanvas");
        const context = canvas.getContext("2d");
        const playerWidth = 40;
        const playerHeight = 40;
        const obstacleWidth = 20;
        const obstacleHeight = 20;
        const bulletWidth = 2; // New variable for bullet width
        const bulletHeight = 10; // New variable for bullet height
        let playerX = canvas.width / 2 - playerWidth / 2;
        let playerY = canvas.height - playerHeight;
        let rightPressed = false;
        let leftPressed = false;
        let shootPressed = false;
        let bullets = []; // New array to hold bullets
        let obstacles = [];
        let score = 0;
        let gameStarted = false;
        let isPaused = false;
        let animationId;
        let obstacleInterval = 1000; // Initial interval between obstacle creation (in milliseconds)
        const intervalDecrement = 50; // Amount to decrement the interval by
        let bestRun = 0;

        // Background music
        const bgMusic = document.getElementById("bgMusic");

        // Event listeners for key presses
        document.addEventListener("keydown", keyDownHandler);
        document.addEventListener("keyup", keyUpHandler);
        document.addEventListener("mousedown", mouseDownHandler);
        document.addEventListener("mouseup", mouseUpHandler);

        // Start button click event
        document.getElementById("startButton").addEventListener("click", startGame);

        // Pause button click event
        document.getElementById("pauseButton").addEventListener("click", pauseGame);

        function keyDownHandler(event) {
            if (event.key === "Right" || event.key === "ArrowRight") {
                rightPressed = true;
            } else if (event.key === "Left" || event.key === "ArrowLeft") {
                leftPressed = true;
            }
        }

        function keyUpHandler(event) {
            if (event.key === "Right" || event.key === "ArrowRight") {
                rightPressed = false;
            } else if (event.key === "Left" || event.key === "ArrowLeft") {
                leftPressed = false;
            }
        }

        function mouseDownHandler(event) {
            if (event.button === 0) { // Left click
                shootPressed = true;
                shootBullet(); // Call the shootBullet function when shooting
            }
        }

        function mouseUpHandler(event) {
            if (event.button === 0) { // Left click
                shootPressed = false;
            }
        }

        function createObstacle() {
            const obstacle = {
                x: Math.random() * (canvas.width - obstacleWidth),
                y: 0,
                width: obstacleWidth,
                height: obstacleHeight,
                speed: Math.random() * 4 + 1 // Random speed between 1 and 5
            };
            obstacles.push(obstacle);
        }

        function shootBullet() {
            const bullet = {
                x: playerX + playerWidth / 2 - bulletWidth / 2, // Align bullet with player's center
                y: playerY - bulletHeight, // Place bullet above the player
                width: bulletWidth,
                height: bulletHeight,
                speed: 5 // Adjust bullet speed as desired
            };
            bullets.push(bullet);
        }

        function drawPlayer() {
            context.beginPath();
            context.rect(playerX, playerY, playerWidth, playerHeight);
            context.fillStyle = "#0095DD";
            context.fill();
            context.closePath();
        }

        function drawObstacles() {
            for (let i = 0; i < obstacles.length; i++) {
                const obstacle = obstacles[i];
                context.beginPath();
                context.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                context.fillStyle = "#FF0000";
                context.fill();
                context.closePath();
            }
        }

        function drawBullets() {
            for (let i = 0; i < bullets.length; i++) {
                const bullet = bullets[i];
                context.beginPath();
                context.rect(bullet.x, bullet.y, bullet.width, bullet.height);
                context.fillStyle = "#FFFFFF";
                context.fill();
                context.closePath();
            }
        }

        function moveObstacles() {
            for (let i = 0; i < obstacles.length; i++) {
                const obstacle = obstacles[i];
                obstacle.y += obstacle.speed;

                // Remove obstacles that have gone off the screen
                if (obstacle.y > canvas.height) {
                    obstacles.splice(i, 1);
                    i--;
                    increaseScore();
                }
            }
        }

        function moveBullets() {
            for (let i = 0; i < bullets.length; i++) {
                const bullet = bullets[i];
                bullet.y -= bullet.speed;

                // Remove bullets that have gone off the screen
                if (bullet.y < 0) {
                    bullets.splice(i, 1);
                    i--;
                }
            }
        }

        function increaseScore() {
            score++;
            document.getElementById("score").textContent = "Score: " + score;
        }

        function checkCollision() {
            for (let i = 0; i < obstacles.length; i++) {
                const obstacle = obstacles[i];
                if (
                    playerX < obstacle.x + obstacle.width &&
                    playerX + playerWidth > obstacle.x &&
                    playerY < obstacle.y + obstacle.height &&
                    playerY + playerHeight > obstacle.y
                ) {
                    // Collision detected
                    gameOver();
                    break;
                }
            }
        }

        function checkObstacleCollision() {
            for (let i = 0; i < obstacles.length; i++) {
                const obstacle = obstacles[i];
                if (
                    playerX < obstacle.x + obstacle.width &&
                    playerX + playerWidth > obstacle.x &&
                    playerY - obstacle.height < obstacle.y + obstacle.height &&
                    playerY + playerHeight > obstacle.y
                ) {
                    // Obstacle collision detected
                    obstacles.splice(i, 1);
                    i--;
                    increaseScore();
                }
            }
        }

        function checkBulletCollision() {
            for (let i = 0; i < bullets.length; i++) {
                const bullet = bullets[i];
                for (let j = 0; j < obstacles.length; j++) {
                    const obstacle = obstacles[j];
                    if (
                        bullet.x < obstacle.x + obstacle.width &&
                        bullet.x + bullet.width > obstacle.x &&
                        bullet.y < obstacle.y + obstacle.height &&
                        bullet.y + bullet.height > obstacle.y
                    ) {
                        // Bullet collision with obstacle detected
                        bullets.splice(i, 1);
                        i--;
                        obstacles.splice(j, 1);
                        j--;
                        increaseScore();
                        break;
                    }
                }
            }
        }

        function gameOver() {
            if (score > bestRun) {
                bestRun = score;
                document.getElementById("scoreboard").textContent = "Best Run: " + bestRun;
            }
            alert("Game Over! Score: " + score);
            resetGame();
        }

        function resetGame() {
            playerX = canvas.width / 2 - playerWidth / 2;
            playerY = canvas.height - playerHeight;
            obstacles = [];
            bullets = []; // Clear bullets array
            score = 0;
            document.getElementById("score").textContent = "Score: " + score;
            gameStarted = false;
            isPaused = false;
            document.getElementById("startButton").disabled = false;
            document.getElementById("pauseButton").disabled = true;
            cancelAnimationFrame(animationId);
            clearInterval(obstacleCreationInterval); // Clear obstacle creation interval
            obstacleInterval = 1000; // Reset obstacle creation interval
        }

        function startGame() {
            if (!gameStarted) {
                gameStarted = true;
                document.getElementById("startButton").disabled = true;
                document.getElementById("pauseButton").disabled = false;
                animationId = requestAnimationFrame(draw);
                obstacleCreationInterval = setInterval(createObstacle, obstacleInterval); // Create an obstacle based on interval
                bgMusic.play(); // Start playing background music
            }
        }

        function pauseGame() {
            if (gameStarted) {
                isPaused = !isPaused;
                if (isPaused) {
                    document.getElementById("pauseButton").textContent = "Resume";
                    cancelAnimationFrame(animationId);
                    bgMusic.pause(); // Pause background music
                } else {
                    document.getElementById("pauseButton").textContent = "Pause";
                    animationId = requestAnimationFrame(draw);
                    bgMusic.play(); // Resume playing background music
                }
            }
        }

        function increaseObstacleSpeed() {
            for (let i = 0; i < obstacles.length; i++) {
                obstacles[i].speed += 0.2;
            }
        }

        function increaseObstacleCreationRate() {
            obstacleInterval -= intervalDecrement;
            clearInterval(obstacleCreationInterval);
            obstacleCreationInterval = setInterval(createObstacle, obstacleInterval);
        }

        function drawBackground() {
            const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "#000000");
            gradient.addColorStop(1, "#0f0f33");
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        function draw() {
            drawBackground();
            drawPlayer();
            drawObstacles();
            drawBullets(); // Draw the bullets
            moveObstacles();
            moveBullets(); // Move the bullets
            checkCollision();
            checkBulletCollision(); // Check for bullet collision

            if (rightPressed && playerX < canvas.width - playerWidth) {
                playerX += 7;
            } else if (leftPressed && playerX > 0) {
                playerX -= 7;
            }

            if (gameStarted && !isPaused) {
                requestAnimationFrame(draw);
            }
        }

        let obstacleCreationInterval; // Declare obstacle creation interval variable
        let increaseSpeedTimeout = setTimeout(increaseObstacleSpeed, 5000); // Increase obstacle speed after 5 seconds
        let increaseCreationRateTimeout = setTimeout(increaseObstacleCreationRate, 10000); // Increase obstacle creation rate after 10 seconds
    </script>
</body>
</html>


