/*TODO:
    Eliminate possibility of food spawning on each other
    Remove ability to go backwards into self
    option to choose number of players
    option to choose whether player is ai or human
    limit human players to max of 2
    Score board
    Game module: Death of snake -> leaves body as obstacle -> game over when no snake is alive anymore -> Option to restart
                Death screen w/ who wins and score
                pause screen
    */
/*BUG:
    Score screen flickers
    AI may kill itself
    Screen draws AI for one frame after everyone is dead (shows death screen in between)
    AI sometimes chooses odd targets for food
    Cannot kill oneself on another snake of size 1
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
        this.size = 5;
        this.posx = Math.floor(Math.random() * num_gridx) * (2 * 7.5) + 7.5;
        this.posy = Math.floor(Math.random() * num_gridy) * (2 * 7.5) + 7.5; //link 7.5 to snake.size from snakeModule
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
        },

        updateFood: function(food_arr){
            this.food_arr = food_arr;
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
                posx: Math.floor(Math.random() * num_gridx) * (2*size) + 7.5,
                posy: Math.floor(Math.random() * num_gridy) * (2*size) + 7.5,
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
                if (i > 0){
                    snake.isAI = true;
                }
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
            if (!snake.isAI){
                snakeController(snake);
            }
            
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
            }

            for(i = 0; i<snake_arr.length; i++){
                for (j = 0; j<food_arr.length; j++){
                    if (snake_arr[i].body[0].posx == food_arr[j].posx && snake_arr[i].body[0].posy == food_arr[j].posy){
                        growSnake(snake_arr[i]);
                        //snakeModule.updateSnake(snake_arr[i], i);
                        
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

var aiModule = (function(canvas, foodModule, snakeModule, actionModule){
    function closestFood(snake, food_arr){
        var min = Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2);
        var ind = 0;
        for (i = 0; i < food_arr.length; i++){
            var dist = Math.pow(snake.body[0].posy-food_arr[i].posy, 2) + Math.pow(snake.body[0].posy-food_arr[i].posy, 2);
            if (dist < min) {
                min = dist;
                ind = i;
            }
        }
        return ind;
    }
    
    //returns either [0,1] [1,0] [-1,0] [0,-1] but looks num nodes down via A*
    //dist is the distance to food
    //the snake movement is acting on a separate snake than the one in snakeModule snake_arr
    function calcMovement(num, snake_ind, posx, posy, food, dir) {
        //7.5 is from snake.size
        var new_posx = posx + dir[0]*7.5;
        var new_posy = posy + dir[1]*7.5;

        //checks for wall collision
        if (new_posx < 0 || new_posx > canvas.width ||
            new_posy < 0 || new_posy > canvas.height){
            alert("here tho");
            alert(canvas.width);
            
            return (Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2) + 1);
        }

        //checks for snake collision
        var snake_arr = snakeModule.getSnakeArr();
        for (i = 0; i < snake_arr.length; i++){
            if (i == snake_ind){
                continue;
            }
            for (j = 0; j < snake_arr[i].body.length; j++){
                if (new_posx == snake_arr[i].body[j].posx && new_posy == snake_arr[i].body[j].posy){
                    alert("here tho");
                    alert(canvas);
                    alert(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2) + 1);
                    return (Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2) + 1);
                }
            }
        }

        var coord = [new_posx, new_posy];

        if (num == 0){
            return Math.pow(new_posx - food.posx, 2) + Math.pow(new_posy - food.posy, 2);
        } else if (Math.pow(new_posx - food.posx, 2) + Math.pow(new_posy - food.posy, 2) == 0){
            return 0;
        } else {
            var up_dist = calcMovement(num-1, snake_ind, new_posx, new_posy, food, [0,1]);
            var down_dist = calcMovement(num-1, snake_ind, new_posx, new_posy, food, [0,-1]);
            var left_dist = calcMovement(num-1, snake_ind, new_posx, new_posy, food, [-1,0]);
            var right_dist = calcMovement(num-1, snake_ind, new_posx, new_posy, food, [1,0]);
            return Math.min(...[up_dist, down_dist, snake_ind, left_dist, right_dist]);
        }
    } 

    function aiMovement(num){
        var snake_arr = snakeModule.getSnakeArr();
        var food_arr = foodModule.getFoodArr(); 

        for (i = 0; i<snake_arr.length; i++){
            var snake_ind = i;
            var snake = snake_arr[snake_ind];
            
            if (snake.isAlive && snake.isAI){
                var cfood_ind = closestFood(snake, food_arr);
                //uses x and y coordinates to not change the snake reference in snake_arr
                var up_dist = calcMovement(num-1, snake_ind, snake.body[0].posx, snake.body[0].posy, food_arr[cfood_ind], [0,1]);
                var down_dist = calcMovement(num-1, snake_ind, snake.body[0].posx, snake.body[0].posy, food_arr[cfood_ind], [0,-1]);
                var left_dist = calcMovement(num-1, snake_ind, snake.body[0].posx, snake.body[0].posy, food_arr[cfood_ind], [-1,0]);
                var right_dist = calcMovement(num-1, snake_ind, snake.body[0].posx, snake.body[0].posy, food_arr[cfood_ind], [1,0]);

                var min_dist = Math.min(...[up_dist, down_dist, left_dist, right_dist]);

                if (min_dist == up_dist){
                    snake.body[0].dir = [0,1];
                    //alert(0);
                } else if (min_dist == down_dist){
                    snake.body[0].dir = [0,-1];
                    //alert(2);
                } else if (min_dist == left_dist){
                    snake.body[0].dir = [-1,0];
                    //alert(3);
                } else if (min_dist == right_dist){
                    snake.body[0].dir = [1,0];
                    //alert(1);
                }
            }
        }
        return;
    };

    return {
        calcAIMovement: function (num){
            aiMovement(num);
            return;
        }
    }
}(canvas, foodModule, snakeModule, actionModule));

var drawModule = (function(canvas, foodModule, snakeModule, actionModule){ //to do with drawing frame
    function drawFood(food, context){
        context.save();
        context.fillStyle = food.colour;
        context.beginPath();
        context.arc(food.posx, food.posy, food.size, 0, 2*Math.PI);
        context.closePath();
        context.fill();
        context.restore();
        return;
    };

    function drawSnake(snake, context){
        for (j = 0; j < snake.body.length; j++){
            context.save();
            context.fillStyle = snake.colour;
            context.beginPath();
            context.arc(snake.body[j].posx, snake.body[j].posy, snake.size, 0, 2*Math.PI);
            context.closePath();
            context.fill();
            context.restore();
        }
        return;
    };

    function drawFrame(context, food_arr, snake_arr){
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (i = 0; i<food_arr.length; i++){
            drawFood(food_arr[i], context);
        }

        for (i = 0; i < snake_arr.length; i++){
            drawSnake(snake_arr[i], context);
        }
        
        return;
    };

    function drawInit(){
        if (canvas.getContext)
            var ctx = canvas.getContext('2d');
        else return;
        ctx.save();
        ctx.fillStyle = "#0000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "50px Arial";
        var txt = "Click to begin!"
        ctx.fillText(txt, canvas.width/2 - ctx.measureText(txt).width/2, canvas.height/2);
        ctx.restore();
        return;
    };

    function drawEnd(){
        if (canvas.getContext)
            var ctx = canvas.getContext('2d');
        else return;
        ctx.save();
        ctx.fillStyle = "#0000000"; //why doesn't this change the colour?
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "50px Arial";
        var txt = "Game Over!"
        ctx.fillText(txt, canvas.width/2 - ctx.measureText(txt).width/2, canvas.height/2);
        ctx.restore();
        return;
    }
    
    return {
        drawEndScreen: function(){
            drawEnd();
        },

        drawStartScreen: function(){
            drawInit();
        },

        draw: function() {
            if (canvas.getContext)
                var ctx = canvas.getContext('2d');
            else return;

            var food_arr = foodModule.getFoodArr();
            var snake_arr = snakeModule.getSnakeArr();

            drawFrame(ctx, food_arr, snake_arr);
            aiModule.calcAIMovement(3);
            actionModule.calcAction(snake_arr, food_arr);

            return; /////******* */
        }
    }
})(canvas, foodModule, snakeModule, actionModule);

var gameModule = (function(canvas, foodModule, snakeModule, actionModule){

    function numLiving(){
        var snake_arr = snakeModule.getSnakeArr();

        var num_alive = 0;
        for (i = 0; i<snake_arr.length; i++){
            if (snake_arr[0].isAlive)
                num_alive += 1;
        }

        return num_alive;
    }

    function printScore(){
        var snake_arr = snakeModule.getSnakeArr();

        var ctx = canvas.getContext('2d');
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px Arial";
        ctx.fillText("Score", canvas.width-100, canvas.height - 120);
        ctx.font = "10px Arial";

        for (i = 0; i<snake_arr.length; i++){
            var txt = "Player " + String(i) + ": " + String(snake_arr[i].body.length);
            ctx.fillText(txt, canvas.width - 100, canvas.height - (100 - 15*(i)));
        }
        ctx.restore();

        return;
    };

    return{
        init: function(num_snake, num_food){
            drawModule.drawStartScreen();
            snakeModule.init(num_snake);
            foodModule.init(num_food);
            
            canvas.addEventListener("click", function(event){
                if (canvas.interval){
                    clearInterval(canvas.interval);
                    canvas.interval = null;
                } else {
                    canvas.interval = setInterval(function(){
                        drawModule.draw();
                        printScore();
                        if (numLiving() == 0){
                            drawModule.drawEndScreen();
                        }
                    }, 1000/15);
                }
            });
        },
    }

})(canvas, foodModule, snakeModule, actionModule);

window.onload = function(){
    gameModule.init(2, 10);
};

