// TODO:
//      snake colour - randomize the input number
//      call the super constructor for the SnakeGame values
//          Then have one addition colour at end of colour array for food
//          Then change hitObject to use a posx and posy from SnakeGame, so it isn't a parameter

var canvas = document.getElementById("backgroundCanvas");
canvas.width = 750;
canvas.height = 500;

if (canvas.getContext){
    var ctx = canvas.getContext('2d');
}

// SnakeGame - superclass
function SnakeGame (num_alive) {
    this.num_alive = num_alive;
}

// spacing of the coordinates on the screen
SnakeGame.prototype.unit_space = 7.5;
SnakeGame.prototype.x_range = Math.floor(canvas.width / (2 * SnakeGame.prototype.unit_space));
SnakeGame.prototype.y_range = Math.floor(canvas.height / (2 * SnakeGame.prototype.unit_space));
// colours of snakes
SnakeGame.prototype.snake_colours = [ "#53F527", "#9821F0", "#21F0EA", "#F0ED21", "#FF6F50" ];
// write start screen words
SnakeGame.prototype.drawStartWords = function(){
        ctx.fillStyle = "#ffffff";
        ctx.font = "50px Arial";
        var txt = "Click to begin!"
        ctx.fillText(txt, canvas.width/2 - ctx.measureText(txt).width/2, canvas.height/2);
}

SnakeGame.prototype.drawEndWords = function(){
        ctx.fillStyle = "#ffffff";
        ctx.font = "50px Arial";
        var txt = "Game Over!"
        ctx.fillText(txt, canvas.width/2 - ctx.measureText(txt).width/2, canvas.height/2);
}

SnakeGame.prototype.hitObject = function(posx, posy, board, type = 'both'){
    if (board.board_arr[posy][posx] == 0){
        return false;
    }

    var hit = false;
    switch (type) {
        case 'snake':
            hit = board.board_arr[posy][posx] == 2 ? true : false;
            break;
        case 'food':
            hit = board.board_arr[posy][posx] == 1 ? true : false;
            break;
        case 'wall':
            if (posx < 0 || posx > this.x_range)
                hit = false;
            if (posy < 0 || posy > this.y_range)
                hit = false;
            else
                hit = true;
            break;
        case 'both':
            hit = (board.board_arr[posy][posx] == 2 || board.board_arr[posy][posx] == 1) ? true: false;
            break;
        default:
            alert("put in wrong value for a SnakeGame.prototype.hit function");
            hit = (board.board_arr[posy][posx] == 2 || board.board_arr[posy][posx] == 1) ? true: false;
            break;
    }
    return hit;
}

// Board - subclass
// 0 in board_arr means empty, 1 means food, 2 means snake
function Board () {
    this.colour = "#000000";
    this.board_arr = new Array();
    for (i = 0; i < this.y_range; i++){
        this.board_arr[i] = [];
        for (j = 0; j < this.x_range; j++){
            this.board_arr[i][j] = 0; 
        }
    }
}

// set up Board so it inherits from SnakeGame
Board.prototype = Object.create(SnakeGame.prototype);
Board.prototype.constructor = Board;

Board.prototype.draw = function() {
    ctx.fillStyle = this.colour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};


// Food - subclass
function Food(board) {
    this.colour = "#ffffff";
    this.size = 5;

    // randomly puts food, then checks for overlap
    // in case of overlap, tries for a new position
    var overlap = true;
    while (overlap) {
        this.posx = Math.floor(Math.random() * this.x_range);
        this.posy = Math.floor(Math.random() * this.y_range);

        overlap = this.hitObject(this.posx, this.posy, board);
    }
};

// set of Food so it inherits form SnakeGame
Food.prototype = Object.create(SnakeGame.prototype);
Food.prototype.constructor = Food;

Food.prototype.draw = function() {
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    var pixel_x = this.posx * (2 * this.unit_space) + this.unit_space;
    var pixel_y = this.posy * (2 * this.unit_space) + this.unit_space;
    ctx.arc(pixel_x, pixel_y, this.size, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
};


function BodySegment(x, y, prev_seg, next_seg) {       // the x and y are coordinates of the board - from 0 to board's x_range and y_range
    this.posx = x; //* (2 * this.unit_space) + 7.5; for drawing
    this.posy = y;
    this.prev = prev_seg;
    this.next = next_seg;
    this.size = this.unit_space;
};

BodySegment.prototype = Object.create(SnakeGame.prototype);
BodySegment.prototype.constructor = BodySegment;



function Snake(colour_ind, board) {
    var self = this; 

    this.isAlive = true;
    this.isAI = false;
    this.colour = this.snake_colours[colour_ind];
    this.dir = [0,1];
    this.choose_delay = 0;             //number of moves before the 'closest food' is recalculated for the ai snake
    this.targetx;                       //ai target food x position
    this.targety;                       //ai target food y position
    this.length = 0;
    this.head = this.createHead(board);
    this.tail = this.head;

    this.control = function(event){
        switch (event.keyCode){
            case 37: //left key
                self.dir = [ -1, 0 ];
                break;
            case 38: //up key
                self.dir = [ 0, -1 ];  
                break;
            case 39: //right key
                self.dir = [ 1, 0 ];
                break;
            case 40: //down key
                self.dir = [ 0, 1 ];
                break;
            default:
                break;
        }
    }

    canvas.addEventListener('keydown', function(event){self.control(event);})
};

Snake.prototype = Object.create(SnakeGame.prototype);
Snake.prototype.constructor = Snake;

// creates the head of the snake - need to update board after
Snake.prototype.createHead = function(board) {
    var overlap = true;

    while (overlap) {
        var h_x = Math.floor(Math.random() * this.x_range);
        var h_y = Math.floor(Math.random() * this.y_range);

        var head = new BodySegment(h_x, h_y, null, null);
        overlap = this.hitObject(h_x, h_y, board);
    }
    
    this.length += 1;
    return head;
};

// adds a segment to the end of the snake, with the current velocity vector being the snake's tail's velocity vector
Snake.prototype.addBody = function(posx, posy) {
    var body = new BodySegment(posx, posy, this.tail, null, this.tail.dir);

    this.tail.next = body;
    this.tail = body;
    this.length += 1;
}

Snake.prototype.move = function(){
    var cur_seg = this.head;

    cur_seg.posx += this.dir[0];
    cur_seg.posy += this.dir[1];

    cur_seg = cur_seg.next;

    while (cur_seg != null){
        cur_seg.posx = cur_seg.prev.posx;
        cur_seg.posy = cur_seg.prev.posy;

        cur_seg = cur_seg.next;
    }
}

Snake.prototype.draw = function(){
    ctx.fillStyle = this.colour;
    var cur_seg = this.head;

    while (cur_seg != null){
        ctx.beginPath();
        var pixel_x = cur_seg.posx * (2 * this.unit_space) + this.unit_space;
        var pixel_y = cur_seg.posy * (2 * this.unit_space) + this.unit_space;
        ctx.arc(pixel_x, pixel_y, cur_seg.size, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();

        cur_seg = cur_seg.next;
    }
};


var startGame = function(num_snake, num_food){
    var sg = new SnakeGame();
    var b = new Board();
    var snake_arr = new Array(num_snake);
    var food_arr = new Array(num_food);
    for (i = 0; i < num_snake; i++){
        s = new Snake(2, b);
        b.board_arr[s.head.posy][s.head.posx] = 2;
        snake_arr[i] = s;
    }

    for (i = 0; i < num_food; i++){
        f = new Food(b);
        b.board_arr[f.posy][f.posx] = 1;
        food_arr[i] = f;
    }

    b.draw();
    sg.drawStartWords();
            
    canvas.addEventListener("click", function(event){
        if (canvas.interval){
            clearInterval(canvas.interval);
            canvas.interval = null;
        } else {
            canvas.interval = setInterval(function(){
                b.draw();
                //take player input and move player snakes
                //calculate the ai's movements
                //update the snake's positions according to movements - include growing and removing food
                //draw everything
                //write the score
                //alert("hi");
                for (i = 0; i < snake_arr.length; i++){
                    snake_arr[i].move();
                    snake_arr[i].draw();
                }
            }, 1000/15);
        }
    });
};

alert("ho");

startGame(1, 1);
