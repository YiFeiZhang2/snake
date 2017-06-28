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


var foodModule = (function(canvas){
    var food_arr = []; //array of food_arr

    return {
        init: function(num_food){
            for (i = 0; i<num_food; i++){
                var food = new Food();
                food_arr.push(food);
            }
        },
    }
})(canvas);

var snakeModule = (function(canvas) {
    var snake_arr = []; //array of snakes

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
    };
})(canvas);

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
    function closestFood(snake, food_arr){          //returns index of closest food particle in food_arr to the snake
        var min = Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2);
        var ind = 0;
        for (i = 0; i < food_arr.length; i++){
            var dist = Math.pow(snake.body[0].posy-food_arr[i].posy, 2) + Math.pow(snake.body[0].posx-food_arr[i].posx, 2);
            if (dist < min) {
                min = dist;
                ind = i;
            }
        }
        return ind;
    }

    function calcMovement(num, snake) {
        //7.5 is from snake.size
        var dir_x = [[1, 0], [-1, 0]];
        var dir_y = [[0, 1], [0, -1]];

        //combinations of left/right and up/down. Eg: 2, 1 = 2 left/right, 1 up/down
        var furthest_points = [];

        var curr_x = snake.body[0].posx;
        var curr_y = snake.body[0].posy;
        var new_x, new_y;

        var min_dist = 1000000000;
        var curr_dist;
        var best_dir;
        //Goes through possible x y values after moving outwards num times with a combination of left/right and up/down
        //Calculates final distance to food, and head in direction of minimum distance
        for (j = 0; j < num; j++){
            for (i = 0; i < j; i++){
                furthest_points[i] = [j-i, i+1];
            }
            for (x = 0; x < dir_x.length; x++){
                for(y = 0; y < dir_y.length; y++){
                    for(p = 0; p < furthest_points.length; p++){
                        new_x = curr_x + 7.5*dir_x[x][0]*furthest_points[p][0];
                        new_y = curr_y + 7.5*dir_y[y][1]*furthest_points[p][1];
                        curr_dist = Math.pow(new_y - snake.targety, 2) + Math.pow(new_x - snake.targetx, 2);
                        if (curr_dist < min_dist){
                            min_dist = curr_dist;
                            if (furthest_points[p][0] > furthest_points[p][1]){
                                best_dir = [dir_x[x][0], 0];
                            } else {
                                best_dir = [0, dir_y[y][1]];
                            }
                        }
                    }
                }
            }
        }
        return best_dir;
        //checks for snake collision
    } 

    function aiMovement(num){
        //alert("lol");
        var snake_arr = snakeModule.getSnakeArr();
        //alert(snake_arr);
        var food_arr = foodModule.getFoodArr(); 

        for (i = 0; i < snake_arr.length; i++){
            var snake_ind = i;
            var snake = snake_arr[snake_ind];
            
            if (snake.isAlive && snake.isAI){
                //alert("sigh");
                if (snake.choose_delay == 0 || (snake.body[0].posx == snake.targetx && snake.posy[0].posy == snake.targety)){
                    snake.choose_delay = 10;                            //snake will go towards same target for 10 'turns'
                    var cfood_ind = closestFood(snake, food_arr);       //snake will move towards closest food particle
                    snake.targetx = food_arr[cfood_ind].posx;
                    snake.targety = food_arr[cfood_ind].posy;
                } else {
                    snake.choose_delay -= 1;
                }
                //alert("???");
                snake.body[0].dir = calcMovement(num, snake);
                snakeModule.updateSnake(snake, snake_ind);
            }
            
        }
        //alert("hi");
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

    
    return {

        draw: function() {
            if (canvas.getContext)
                var ctx = canvas.getContext('2d');
            else return;

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
    }

})(canvas, foodModule, snakeModule, actionModule);

window.onload = function(){
    gameModule.init(2, 10);
};

