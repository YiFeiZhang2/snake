var canvas = document.getElementById("backgroundCanvas");
canvas.width = 750;
canvas.height = 500;

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
        this.colour = colour[num];
        this.length = 1;
        this.body = [ generateHead() ];
    }

    function drawSnake(snake, context){
        for (i = 0; i < snake.length; i++){
            context.fillStyle = "#ffffff";//snake.colour;
            context.arc(snake.body[i].posx, snake.body[i].posy, 7.5, 0, 2*Math.PI);
            context.fill();
        }
    }

    function drawFrame(context){
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (i = 0; i < snake_arr.length; i++){   
            drawSnake(snake_arr[i], context);
        }
    };

    return {

        init: function(num_snakes){
            if (canvas.getContext)
                context = canvas.getContext('2d');
            else return;

            for (var i = 0; i < num_snakes; i++){
                var snake = new Snake(i);
                
                alert(snake.body[0].posy);

                snake_arr.push(snake);
            }

            drawFrame(context);
        },
    };
})(canvas);

snakeModule.init(1);
