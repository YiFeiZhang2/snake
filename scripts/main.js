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

            drawAllFood(ctx);
        },
    }
})(canvas, snakeModule);

var snakeModule = (function(canvas) {

    var snake_arr = []; //array of snakes
    var colour = [ "#53F527", "#9821F0", "#21F0EA", "#F0ED21", "#FF6F50" ]

    function generateHead(){
        var head = {
            posx: Math.random()*(canvas.width-2*50) + 50,
            posy: Math.random()*(canvas.height-2*50) + 50,
            dir: 0,
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
    }

    function calcPos(){
        for (i = 0; i < snake_arr.length; i++){
            for (j = 0; j < snake_arr[i].body.length; j++){
                
            }
        }
    }

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

            drawFrame(context);
        },

        numSnake: function(){
            return getNumSnake();
        }
    };
})(canvas);

var num_snake = 1;

snakeModule.init(num_snake);
foodModule.init(num_snake);
