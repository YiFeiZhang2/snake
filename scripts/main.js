/*TODO:
    configure snake spawn so snake will have perfect alignment with edges
    configure food spawn so food will have perfect alignment with edges
    configure food spawn so it will not spawn on snake
    Remove ability to go backwards
    Add death/gameover when snake hits itself
    Add death/gameover when snake hits wall
    Add death screen -> score, who wins
    Start button
    increase snake length when it eats food
    remove food when eaten by snake
    respawn food when eaten by snake
    snake ai
    option to choose number of players
    option to choose whether player is ai or human
    limit human players to max of 2
    Score board
    */

var canvas = document.getElementById("backgroundCanvas");
canvas.width = 750;
canvas.height = 500;

var foodModule = (function(canvas, snakeModule){
    var food_arr = []; //array of food_arr

    function Food(){
        this.colour = "#ffffff";
        this.posx = Math.random()*(canvas.width);
        this.posy = Math.random()*(canvas.height);
        this.size = 3;
    };

    function drawFood(food, context){
        context.fillStyle = food.colour;
        context.beginPath();
        context.arc(food.posx, food.posy, food.size, 0, 2*Math.PI);
        context.closePath();
        context.fill();
        return;
    };

    function drawAllFood(context){
        for (i = 0; i<food_arr.length; i++){
            drawFood(food_arr[i], context);
        }
        return;
    }

    return {
        init: function(num_snakes){
            if (canvas.getContext)
                var ctx = canvas.getContext('2d');
            else return;

            for (i = 0; i<num_snakes; i++){
                var food = new Food();
                food_arr.push(food);
            }
        },

        drawFood: function(context){
            drawAllFood(context);
        },
    }
})(canvas, snakeModule);

var snakeModule = (function(canvas, foodModule) {

    var snake_arr = []; //array of snakes
    var colour = [ "#53F527", "#9821F0", "#21F0EA", "#F0ED21", "#FF6F50" ]

    function generateHead(){
        var head = {
            posx: Math.random()*(canvas.width-2*50) + 50,
            posy: Math.random()*(canvas.height-2*50) + 50,
            dir: [ 0, 1 ],
        };

        return head;
    }

    function Snake(num) {
        this.isAI = false;
        this.colour = colour[num];
        this.length = 1;
        this.body = [ generateHead() ];
        this.size = 7.5;
    }

    function drawSnake(snake, context){
        for (j = 0; j < snake.length; j++){
            context.fillStyle = snake.colour;
            context.beginPath();
            context.arc(snake.body[j].posx, snake.body[j].posy, snake.size, 0, 2*Math.PI);
            context.closePath();
            context.fill();
        }
        return;
    };

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
        snakeController(snake);

        var head = {
            dir: snake.body[0].dir,
            posx: snake.body[0].posx + (2 * snake.size * snake.body[0].dir[0]),
            posy: snake.body[0].posy + (2 * snake.size * snake.body[0].dir[1]),
        }

        snake.body.unshift(head);
        snake.body.pop();
        return;
    };

    function drawFrame(context){
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (i = 0; i < snake_arr.length; i++){
            drawSnake(snake_arr[i], context);
        }
        return;
    };

    function getNumSnake(){
        return snake_arr.length;
    };

    return {
        init: function(num_snakes){
            if (canvas.getContext)
                context = canvas.getContext('2d');
            else return;

            for (var i = 0; i < num_snakes; i++){
                var snake = new Snake(i);
                snake_arr.push(snake);
            }

            var times = 0;
            var repeat = setInterval( function() {
                drawFrame(context);

                for (var i = 0; i < num_snakes; i++){
                    foodModule.drawFood(context);
                    moveSnake(snake_arr[i]);
                }

                times += 1;
                if (times > 100){
                    clearInterval(repeat);
                }

            }, 1000/15);
        },

        numSnake: function(){
            return getNumSnake();
        }
    };
})(canvas, foodModule);

window.onload = function(){
    var num_snake = 1;

    foodModule.init(num_snake);
    snakeModule.init(num_snake);
};

