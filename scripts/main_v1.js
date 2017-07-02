/*TODO:
    Remove ability to go backwards into self
    option to choose number of players
    option to choose whether player is ai or human
    limit human players to max of 2
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

