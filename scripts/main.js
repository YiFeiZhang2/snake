/*TODO:
    Eliminate possibility of food spawning on each other
    Remove ability to go backwards into self
    Add death/gameover when snake hits wall
    snake ai
    option to choose number of players
    option to choose whether player is ai or human
    limit human players to max of 2
    Score board
    Game module: Death of snake -> leaves body as obstacle -> game over when no snake is alive anymore -> Option to restart
                Death screen w/ who wins and score  
                Start screen
    */

var canvas = document.getElementById("backgroundCanvas");
canvas.width = 750;
canvas.height = 500;

var foodModule = (function(canvas, snakeModule){
    var food_arr = []; //array of food_arr

    function Food(){
        var num_gridx = Math.floor(canvas.width/(2*7.5));
        var num_gridy = Math.floor(canvas.height/(2*7.5));

        this.colour = "#ffffff";
        this.size = 3;
        this.posx = Math.floor(Math.random() * num_gridx) * (2 * 7.5);
        this.posy = Math.floor(Math.random() * num_gridy) * (2 * 7.5); //link 7.5 to snake.size from snakeModule
    };

    return {
        init: function(num_food){
            for (i = 0; i<num_food; i++){
                var food = new Food();
                food_arr.push(food);
            }
        },

        createFood: function(){
            return new Food();
        },

        addFood: function(food){
            food_arr.push(food);
        },

        remFood: function(i){
            food_arr.splice(i, 1);
        },

        getFoodArr: function(){
            return food_arr;
        }
    }
})(canvas, snakeModule);

var snakeModule = (function(canvas, foodModule) {
    var snake_arr = []; //array of snakes
    var colour = [ "#53F527", "#9821F0", "#21F0EA", "#F0ED21", "#FF6F50" ]

    function generateHead(size){

        var num_gridx = Math.floor(canvas.width/(2*size));
        var num_gridy = Math.floor(canvas.height/(2*size));

        var overlap_food = true;
        var overlap_snake = true;

        var food_arr = foodModule.getFoodArr();

        while (overlap_food || overlap_snake){
            var head = {
                posx: Math.floor(Math.random() * num_gridx) * (2*size),
                posy: Math.floor(Math.random() * num_gridy) * (2*size),
                dir: [ 0, 1 ],
            };

            var overlap_food = false;
            var overlap_snake = false;

            for (i = 0; i<food_arr.length; i++){
                if (head.posx == food_arr[i].posx && head.posy == food.arr[i].posy) 
                    overlap_food = true;
                    break;
            }

            for (i = 0; i<snake_arr.length; i++){
                if (head.posx == snake_arr[i].body.posx && head.posy == snake_arr[i].body.posy)
                    overlap_snake = true;
                    break;
            }
        }
        return head;
    }

    function Snake(num) {
        this.isAlive = true;
        this.isAI = false;
        this.colour = colour[num];
        this.length = 1;
        this.size = 7.5;
        this.body = [ generateHead(this.size) ];
    }

    return {
        init: function(num_snakes){
            for (var i = 0; i < num_snakes; i++){
                var snake = new Snake(i);
                snake_arr.push(snake);
            }
        },

        getSnakeArr: function(){
            return snake_arr;
        },

        updateSnake: function(snake, i){
            snake_arr[i] = snake;
        }
    };
})(canvas, foodModule);

var actionModule = (function(canvas, foodModule, snakeModule){ //to do with movement and growth of snake
    function hitWall(snake){
        if (snake.body[0].posx < 0 || snake.body[0].posx > canvas.width ||
            snake.body[0].posy < 0 || snake.body[0].posy > canvas.height){
            snake.isAlive = false;
        }   
        return;
    }

    function anyHitSnake(snake_arr){
        for (i = 0; i < snake_arr.length; i++){
            for (j = 0; j < snake_arr.length; j++){
                for (k = 1; k < snake_arr[j].body.length; k++){
                    if (snake_arr[i].body[0].posx == snake_arr[j].body[k].posx && snake_arr[i].body[0].posy == snake_arr[j].body[k].posy){
                        snake_arr[i].isAlive = false;
                        break;
                    }
                }

                if (!snake_arr[i].isAlive) {
                    continue;
                }
            }
        }
        return;
    }


    function isOverlap(food, snake_arr, food_arr){
        for (i = 0; i<snake_arr.length; i++){
            for (j = 0; j<snake_arr[i].body.length; j++){
                if (food.posx == snake_arr[i].body[j].posx && food.posy == snake_arr[i].body[j].posy)
                    return true;
            }
        }

        for (k = 0; k<food_arr.length; k++){
            if (food.posx == food_arr[k].posx && food.posy == food_arr[k].posy)
                return true;
        }

        return false;
    }

    function snakeController(snake){
        canvas.addEventListener('keydown', function(event) {
            switch (event.keyCode){
                case 37: //left key
                    snake.body[0].dir = [ -1, 0 ];
                    break;
                case 38: //up key
                    snake.body[0].dir = [ 0, -1 ];  
                    break;
                case 39: //right key
                    snake.body[0].dir = [ 1, 0 ];
                    break;
                case 40: //down key
                    snake.body[0].dir = [ 0, 1 ];
                    break;
                default:
                    break;
            }
        });
        return;
    }

    function moveSnake(snake){
        if (snake.isAlive){
            snakeController(snake);

            var head = {
                dir: snake.body[0].dir,
                posx: snake.body[0].posx + (2 * snake.size * snake.body[0].dir[0]),
                posy: snake.body[0].posy + (2 * snake.size * snake.body[0].dir[1]),
            }

            snake.body.unshift(head);
            snake.body.pop();
        }
        return;
    };

    function growSnake(snake){
        var last_i = snake.body.length-1;

        var tail = {
            dir: snake.body[last_i].dir,
            posx: snake.body[last_i].posx - (2 * snake.size * snake.body[last_i].dir[0]),
            posy: snake.body[last_i].posy - (2 * snake.size * snake.body[last_i].dir[1]),
        }

        snake.body.push(tail);
        return;
    };

    return {
        calcAction: function(snake_arr, food_arr){
            anyHitSnake(snake_arr);
            for (i = 0; i<snake_arr.length; i++){
                hitWall(snake_arr[i]);
                //snakeModule.updateSnake(snake_arr[i], i);
            }

            for(i = 0; i<snake_arr.length; i++){
                for (j = 0; j<food_arr.length; j++){
                    if (snake_arr[i].body[0].posx == food_arr[j].posx && snake_arr[i].body[0].posy == food_arr[j].posy){
                        growSnake(snake_arr[i]);
                        snakeModule.updateSnake(snake_arr[i], i)
                        
                        foodModule.remFood(j);
                        var new_food = foodModule.createFood();
                        while (isOverlap(new_food, snake_arr, food_arr)){
                            new_food = foodModule.createFood();
                        }
                        foodModule.addFood(new_food);
                    }
                }
                moveSnake(snake_arr[i]);
            }
            return;
        }
    }
})(canvas, foodModule, snakeModule);

var drawModule = (function(canvas, foodModule, snakeModule, actionModule){ //to do with drawing frame
    function drawFood(food, context){
        context.fillStyle = food.colour;
        context.beginPath();
        context.arc(food.posx, food.posy, food.size, 0, 2*Math.PI);
        context.closePath();
        context.fill();
        return;
    };

    function drawSnake(snake, context){
        for (j = 0; j < snake.body.length; j++){
            context.fillStyle = snake.colour;
            context.beginPath();
            context.arc(snake.body[j].posx, snake.body[j].posy, snake.size, 0, 2*Math.PI);
            context.closePath();
            context.fill();
        }
        return;
    };

    function drawFrame(context, food_arr, snake_arr){
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (i = 0; i < snake_arr.length; i++){
            drawSnake(snake_arr[i], context);
        }

        for (i = 0; i<food_arr.length; i++){
            drawFood(food_arr[i], context);
        }
        return;
    };
    
    return {
        init: function() {
            if (canvas.getContext)
                var ctx = canvas.getContext('2d');
            else return;

            var isOver

            var times = 0;
            var repeat = setInterval( function() {
                var food_arr = foodModule.getFoodArr();
                var snake_arr = snakeModule.getSnakeArr();

                drawFrame(ctx, food_arr, snake_arr);

                actionModule.calcAction(snake_arr, food_arr);

                times += 1;
                if (times > 10000){
                    clearInterval(repeat);
                }
            }, 1000/15);
        }
    }
})(canvas, foodModule, snakeModule, actionModule);

window.onload = function(){
    var num_snake = 1;
    var num_food = 10;

    snakeModule.init(num_snake);
    foodModule.init(num_food);

    drawModule.init();
};

