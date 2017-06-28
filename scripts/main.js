var canvas = document.getElementById("backgroundCanvas");
canvas.width = 750;
canvas.height = 500;

if (canvas.getContext)
    var ctx = canvas.getContext('2d');

// GameValues - superclass
function GameValues () {
}

// spacing of the coordinates on the screen
GameValues.prototype.unit_space = 7.5;
GameValues.prototype.x_range = Math.floor(canvas.width / (2 * GameValues.prototype.unit_space));
GameValues.prototype.y_range = Math.floor(canvas.height / (2 * GameValues.prototype.unit_space));
// colours of snakes
GameValues.prototype.snake_colours = [ "#53F527", "#9821F0", "#21F0EA", "#F0ED21", "#FF6F50" ];


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

// set up Board so it inherits from GameValues
Board.prototype = Object.create(GameValues.prototype);
Board.prototype.constructor = Board;

Board.prototype.draw = function() {
    ctx.fillStyle = this.colour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};



// Food - subclass
function Food() {
    this.colour = "#ffffff";
    this.size = 5;
    this.posx = Math.floor(Math.random() * this.x_range); 
    this.posy = Math.floor(Math.random() * this.y_range);
};

// set of Food so it inherits form GameValues
Food.prototype = Object.create(GameValues.prototype);
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



function BodySegment(x, y, prev_seg, next_seg, dir) {       // the x and y are coordinates of the board - from 0 to board's x_range and y_range
    this.posx = x; //* (2 * this.unit_space) + 7.5; for drawing
    this.posy = y;
    this.dir = dir;
    this.prev = prev_seg;
    this.next = next_seg;
    this.size = this.unit_space;
};

BodySegment.prototype = Object.create(GameValues.prototype);
BodySegment.prototype.constructor = BodySegment;


function Snake(colour_ind, board) {
    this.isAlive = true;
    this.isAI = false;
    this.colour = this.snake_colours[colour_ind];

    this.choose_delay = 0;             //number of moves before the 'closest food' is recalculated for the ai snake
    this.targetx;                       //ai target food x position
    this.targety;                       //ai target food y position
    this.length;
    this.head = this.createHead(board);
    this.tail = this.head;
};

Snake.prototype = Object.create(GameValues.prototype);
Snake.prototype.constructor = Snake;

// creates the head of the snake - need to update board after
Snake.prototype.createHead = function(board) {
    var overlap = true;

    while (overlap) {
        var h_x = Math.floor(Math.random() * this.x_range);
        var h_y = Math.floor(Math.random() * this.y_range);

        var head = new BodySegment(h_x, h_y, null, null, [0, 1]);

        if (board.board_arr[h_y][h_x] ==  0)
            overlap = false;
    }

    return head;
};

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

        cur_segment = cur_segment.next;
    }
};

var b = new Board();

b.draw();

var f = new Food();
b.board_arr[f.posy][f.posx] = 1;

f.draw();

var s = new Snake(2, b);
b.board_arr[s.head.posy][s.head.posx] = 2;

s.draw();

alert(s.head.posy + " " + s.head.posx);

alert("fihis");
