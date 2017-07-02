// TODO:
//      Pause screen - opaque?
//      End game - click to restart
//      Also space to pause
//      AI movement (A*?)
//      AI movement (machine learning)
//      Second human player


// Weird stuff:
//      Replacing the cur_snake with snake_arr[i] when calling the bfs search
//          causes snake_arr[i] to be undefined after... why?
//      bfs AI snake sometimes doesn't eat the food? just passes over
//      Score screen flickers? Only if the snake is an ai
//          Seems to be timed with the pathfinding - perhaps it takes too long?
//          Yet the 'score' words dont flicker, nor do anything else
//      AI snakes other than the first also flicker, but not the human one


// BUG:
//      End screen not displaying when no more human players


// Optimization:
//      Queue used in bfs pathfinding is currently an array - can be faster
//      Also, in bfs, could check whether node is food or not before adding to queue, instead of after
//      Snake is double linked list - can use single linked list
//          Will have to change the movement function
//      The path grid is just a 2D array, no need for the object?

var canvas = document.getElementById("backgroundCanvas");
canvas.width = 750;
canvas.height = 500;

if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
}

// SnakeGame - superclass
function SnakeGame(num_alive) {
    this.num_alive = num_alive;
    this.alive_hum = num_alive;
    this.alive_ai;
}

// spacing of the coordinates on the screen
SnakeGame.prototype.unit_space = 7.5;
SnakeGame.prototype.x_range = Math.floor(canvas.width / (2 * SnakeGame.prototype.unit_space));
SnakeGame.prototype.y_range = Math.floor(canvas.height / (2 * SnakeGame.prototype.unit_space));
SnakeGame.prototype.posx;
SnakeGame.prototype.posy;
// colours of snakes
SnakeGame.prototype.colours = ["#53F527", "#9821F0", "#21F0EA", "#F0ED21", "#FF6F50", "#ffffff"];
// write start screen words
SnakeGame.prototype.drawStartWords = function () {
    ctx.fillStyle = "#ffffff";
    ctx.font = "50px Arial";
    var txt = "Click to begin!"
    ctx.fillText(txt, canvas.width / 2 - ctx.measureText(txt).width / 2, canvas.height / 2);
}

SnakeGame.prototype.drawEndWords = function () {
    ctx.fillStyle = "#ffffff";
    ctx.font = "50px Arial";
    var txt = "Game Over!"
    ctx.fillText(txt, canvas.width / 2 - ctx.measureText(txt).width / 2, canvas.height / 2);
}

SnakeGame.prototype.hitObject = function (board, type = 'both', posx = this.posx, posy = this.posy) {
    var hit = false;
    switch (type) {
        case 'snake':
            // alert("snake");
            hit = board.board_arr[posy][posx] == 2 ? true : false;
            break;
        case 'food':
            hit = board.board_arr[posy][posx] == 1 ? true : false;
            break;
        case 'wall':
            if (posx < 0 || posx >= this.x_range) {
                hit = true;
            }
            else if (posy < 0 || posy >= this.y_range) {
                hit = true;
            }
            else {
                hit = false;
            }
            break;
        case 'both':
            hit = (board.board_arr[posy][posx] != 0) ? true : false;
            break;
        default:
            alert("put in wrong value for a SnakeGame.prototype.hit function");
            hit = (board.board_arr[posy][posx] != 0) ? true : false;
            break;
    }
    // alert(hit);
    return hit;
}

// Board - subclass
// 0 in board_arr means empty, 1 means food, 2 means snake
function Board() {
    this.colour = "#000000";
    this.board_arr = new Array();
    for (i = 0; i < this.y_range; i++) {
        this.board_arr[i] = [];
        for (j = 0; j < this.x_range; j++) {
            this.board_arr[i][j] = 0;
        }
    }
}

// set up Board so it inherits from SnakeGame
Board.prototype = Object.create(SnakeGame.prototype);
Board.prototype.constructor = Board;

Board.prototype.draw = function () {
    ctx.fillStyle = this.colour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

Board.prototype.debugArr = function () {
    ctx.fillStyle = "#FF6F50";
    ctx.font = "8px Arial";
    for (i = 0; i < this.y_range; i++) {
        for (j = 0; j < this.x_range; j++) {
            var txt = this.board_arr[i][j];

            ctx.fillText(txt, 2 * j * this.unit_space + this.unit_space, 2 * i * this.unit_space + this.unit_space);
            //ctx.fillText(txt, j * this.unit_space , i * this.uni_space);
        }
    }
}

// Node for pathfinding
function GridNode(x, y, seen = false, accessible = true, food = false, prev) {
    this.x = x;
    this.y = y;
    this.prev = prev;
    this.seen = seen;
    this.accessible = accessible;
    this.food = food;
}

// Grid for pathfinding
// PathGrid.grid[i][j] has a GridNode, the x and y value is just the j and i respectively
function PathGrid(board) {
    this.y_range = board.y_range;
    this.x_range = board.x_range;
    this.grid = new Array();
    for (i = 0; i < this.y_range; i++) {
        this.grid[i] = [];
        for (j = 0; j < this.x_range; j++) {
            var state = board.board_arr[i][j];
            if (state == 2) {
                this.grid[i][j] = new GridNode(j, i, false, false, false, null);
            }
            else if (state == 1) {
                this.grid[i][j] = new GridNode(j, i, seen = false, accessible = true, food = true, null)
            }
            else if (state == 0) {
                this.grid[i][j] = new GridNode(j, i, false, accessible = true, food = false, null);
            }
            else {
                alert("The board state is messed up: board.board_arr[" + i + "]" + "[" + j + "] is " + board.board_arr[i][j]);
            }
        }
    }
}

PathGrid.prototype.debugArr = function () {
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px Arial";
    for (i = 0; i < this.y_range; i++) {
        for (j = 0; j < this.x_range; j++) {
            var txt = "1";
            if (!this.grid[i][j].seen)
                txt = "0";

            ctx.fillText(txt, 2 * j * 7.5 + 7.5, 2 * i * 7.5 + 7.5);
            //ctx.fillText(txt, j * this.unit_space , i * this.uni_space);
        }
    }
}


// Food - subclass - new Food also updates board array
function Food(board) {
    this.colour = this.colours[5];
    this.size = 5;

    // randomly puts food, then checks for overlap
    // in case of overlap, tries for a new position
    var overlap = true;
    while (overlap) {
        this.posx = Math.floor(Math.random() * this.x_range);
        this.posy = Math.floor(Math.random() * this.y_range);

        overlap = this.hitObject(board);
    }
    board.board_arr[this.posy][this.posx] = 1;
};

// set of Food so it inherits form SnakeGame
Food.prototype = Object.create(SnakeGame.prototype);
Food.prototype.constructor = Food;

Food.prototype.draw = function () {
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    var pixel_x = this.posx * (2 * this.unit_space) + this.unit_space;
    var pixel_y = this.posy * (2 * this.unit_space) + this.unit_space;
    ctx.arc(pixel_x, pixel_y, this.size, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
};


function BodySegment(x, y, prev_seg, next_seg) {       // the x and y are coordinates of the board - from 0 to board's x_range and y_range\
    this.posx = x; //* (2 * this.unit_space) + 7.5; for drawing
    this.posy = y;
    this.prev = prev_seg;
    this.next = next_seg;
    this.size = this.unit_space;
};

BodySegment.prototype = Object.create(SnakeGame.prototype);
BodySegment.prototype.constructor = BodySegment;


// new Snake also updates board array
function Snake(colour_ind, board, is_ai = false) {
    var self = this;
    this.colour = this.colours[colour_ind];
    this.is_alive = true;
    this.dir = [0, 1];
    this.length = 0;
    this.head = this.createHead(board);
    this.tail;

    this.delay_counter = 0;
    this.path = [];                     // path to follow - will be in reverse order
    this.path_delay = 5;                // delay in number of frames before finding a new path
    this.choose_delay = 0;              // number of moves before the 'closest food' is recalculated for the ai snake
    this.targetx;                       // ai target food x position
    this.targety;                       // ai target food y position

    this.is_ai = is_ai;
    if (!this.is_ai) {
        this.control = function (event) {
            switch (event.keyCode) {
                case 37: //left key
                    self.dir = [-1, 0];
                    break;
                case 38: //up key
                    self.dir = [0, -1];
                    break;
                case 39: //right key
                    self.dir = [1, 0];
                    break;
                case 40: //down key
                    self.dir = [0, 1];
                    break;
                default:
                    break;
            }
        }

        canvas.addEventListener('keydown', function (event) { self.control(event); })
    }
    else {
        this.control;
    }
};

Snake.prototype = Object.create(SnakeGame.prototype);
Snake.prototype.constructor = Snake;

Snake.prototype.printBody = function () {
    var arr = []
    var seg = this.head;

    while (seg != null) {
        arr.push([seg.posx + " " + seg.posy]);
        seg = seg.next;
    }
    alert(arr);
}

// creates the head of the snake and updates the board array
Snake.prototype.createHead = function (board) {
    var overlap = true;

    while (overlap) {
        var h_x = Math.floor(Math.random() * this.x_range);
        var h_y = Math.floor(Math.random() * this.y_range);

        var head = new BodySegment(h_x, h_y, null, null);
        overlap = head.hitObject(board);
    }

    board.board_arr[head.posy][head.posx] = 2;
    this.length += 1;
    return head;
};

// adds a segment to the end of the snake with specified posx and posy
// also updates the board array to reflect that
Snake.prototype.addBody = function (posx, posy, board) {
    var body = new BodySegment(posx, posy, null, this.head);
    if (this.length == 1) {
        this.head.prev = body;
        this.tail = this.head;
        this.head = body;
    }
    else {
        this.head.prev = body;
        this.head = body;
    }
    board.board_arr[this.head.posy][this.head.posx] = 2;
    this.length += 1;
}

// calculates the snake's direction using BFS
// changes the snake's path of direction vectors to follow
// path will be in reverse order
Snake.prototype.ai_pathfind_bfs = function (board) {
    // first reset the snake's path
    this.path = [];
    var node;
    var p_grid = new PathGrid(board);

    // Using an array as a queue - could be optimized
    var q = new Array();

    p_grid.grid[this.head.posy][this.head.posx].seen = true;
    q.push(p_grid.grid[this.head.posy][this.head.posx]);

    while (q != []) {
        node = q.shift();

        // food is found, follow prev pointers back to head to make path
        // the path is a series of direction vectors, created by subtracting the x and y values
        // of the node with the x and y values of the prev node
        if (node.food == true) {
            while (node.prev != null) {
                this.path.push([node.x - node.prev.x, node.y - node.prev.y]);
                node = node.prev;
            }
            return self;
        }

        // go up
        if (node.y > 0 && p_grid.grid[node.y - 1][node.x].accessible) {
            if (!p_grid.grid[node.y - 1][node.x].seen) {
                p_grid.grid[node.y - 1][node.x].seen = true;
                p_grid.grid[node.y - 1][node.x].prev = node;
                q.push(p_grid.grid[node.y - 1][node.x]);
            }
        }
        // go down
        if (node.y + 1 < board.y_range && p_grid.grid[node.y + 1][node.x].accessible) {
            if (!p_grid.grid[node.y + 1][node.x].seen) {
                p_grid.grid[node.y + 1][node.x].seen = true;
                p_grid.grid[node.y + 1][node.x].prev = node;
                q.push(p_grid.grid[node.y + 1][node.x]);
            }
        }
        // go left
        if (node.x > 0 && p_grid.grid[node.y][node.x - 1].accessible) {
            if (!p_grid.grid[node.y][node.x - 1].seen) {
                p_grid.grid[node.y][node.x - 1].seen = true;
                p_grid.grid[node.y][node.x - 1].prev = node;
                q.push(p_grid.grid[node.y][node.x - 1]);
            }
        }
        // go right
        if (node.x + 1 < board.x_range && p_grid.grid[node.y][node.x + 1].accessible) {
            if (!p_grid.grid[node.y][node.x + 1].seen) {
                p_grid.grid[node.y][node.x + 1].seen = true;
                p_grid.grid[node.y][node.x + 1].prev = node;
                q.push(p_grid.grid[node.y][node.x + 1]);
            }
        }
    }
    // if exiting here, then no accessible food is found
    // simply move to the last node
    while (node.prev != null) {
        this.path.push([node.x - node.prev.x, node.y - node.prev.y]);
        node = node.prev;
    }
}

// moves snake and updates board
Snake.prototype.move = function (board) {
    // from the tail, change position to the previous segment's position thus moving snake
    var cur_seg = this.tail;
    if (cur_seg != null) {
        board.board_arr[cur_seg.posy][cur_seg.posx] = 0;
        while (cur_seg.prev != null) {
            cur_seg.posx = cur_seg.prev.posx;
            cur_seg.posy = cur_seg.prev.posy;

            cur_seg = cur_seg.prev;
        }
    } else {
        // if cur_seg is null, then the length of snake is 1, so would update the old head value to 0
        board.board_arr[this.head.posy][this.head.posx] = 0;
    }

    // move the head via the snake's dir
    // requires explicitly state cur_seg = this.head for when snake's length's is 1
    // and the tail's previous is null, so would be moving head instead of tail.
    cur_seg = this.head;
    cur_seg.posx += this.dir[0];
    cur_seg.posy += this.dir[1];
    // updates board array
    board.board_arr[this.head.posy][this.head.posx] = 2;
}

Snake.prototype.draw = function () {
    ctx.fillStyle = this.colour;
    ctx.fillStyle = "#F0ED21";
    var cur_seg = this.head;


    while (cur_seg != null) {
        ctx.beginPath();
        var pixel_x = cur_seg.posx * (2 * this.unit_space) + this.unit_space;
        var pixel_y = cur_seg.posy * (2 * this.unit_space) + this.unit_space;
        ctx.arc(pixel_x, pixel_y, cur_seg.size, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        cur_seg = cur_seg.next;
        ctx.fillStyle = this.colour;
    }
};

Snake.prototype.printScore = function (ind) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.fillText("Score", canvas.width - 100, canvas.height - 120);
    ctx.font = "10px Arial";

    var txt = "Player " + String(ind) + ": " + String(this.length);
    ctx.fillText(txt, canvas.width - 100, canvas.height - (100 - 15 * (ind)));
}



var startGame = function (num_snake, num_food) {
    var sg = new SnakeGame(num_snake);

    alert("x and y ranges are " + sg.x_range + " " + sg.y_range);
    var b = new Board();
    var snake_arr = new Array(num_snake);
    var food_arr = new Array(num_food);
    for (i = 0; i < num_snake; i++) {
        s = new Snake(i % 5, b);
        if (i > 0)
            s.is_ai = true;
        // s.printBody();
        snake_arr[i] = s;
    }
    for (i = 0; i < num_food; i++) {
        f = new Food(b);
        food_arr[i] = f;
    }

    b.draw();
    sg.drawStartWords();

    canvas.addEventListener("click", function (event) {
        if (canvas.interval) {
            clearInterval(canvas.interval);
            canvas.interval = null;
        } else {
            canvas.interval = setInterval(function () {
                b.draw();
                var cur_snake;

                //take player input and move player snakes
                //calculate the ai's movements
                //update the snake's positions according to movements - include growing and removing food
                //draw everything
                //write the score


                for (i = 0; i < snake_arr.length; i++) {
                    cur_snake = snake_arr[i];
                    if ( cur_snake.is_alive) { 

                        // If the snake is an ai, and it is time to choose a pth, do so
                        if (cur_snake.is_ai && cur_snake.delay_counter % cur_snake.path_delay == 0) {
                            //alert("reached");
                            cur_snake.ai_pathfind_bfs(b);
                            //alert(cur_snake);
                        }

                        if (cur_snake.is_ai && cur_snake.path.length != 0)
                            cur_snake.dir = cur_snake.path.pop();

                        // The coordinate of the snake's head after the snake's movement
                        var next_x = cur_snake.head.posx + cur_snake.dir[0];
                        var next_y = cur_snake.head.posy + cur_snake.dir[1];

                        // Check whether snake head's position after movement is within bounds first
                        // then check for food collision, or else may get array out of bounds
                        // from the board_arr
                        if (cur_snake.hitObject(b, 'wall', next_x, next_y)) {
                            cur_snake.is_alive = false;

                            if (!cur_snake.is_ai)
                                sg.alive_hum -= 1;

                            // END CONDITION: no more alive humans, ends when last human player is dead
                            if (sg.alive_hum == 0) {
                                sg.drawEndWords();
                                clearInterval(canvas.interval);
                                canvas.interval = null;
                                return;
                            }
                            // kill snake
                            // if no snakes are left, end game
                        }
                        // Food detection:
                        // If the snake's movement brings it into a 'Food', 
                        // instead of moving the snake, add a new snake body ontop of the Food, and make a new Food.
                        else if (cur_snake.hitObject(b, 'food', next_x, next_y)) {//(cur_snake.hitObject(b, 'food', next_x, next_y)){
                            for (j = 0; j < food_arr.length; j++) {
                                if (food_arr[j].posx == next_x && food_arr[j].posy == next_y) {
                                    // alert("touch");
                                    // create new food, and change the board array within constructor
                                    cur_snake.addBody(food_arr[j].posx, food_arr[j].posy, b);
                                    food_arr[j] = new Food(b);
                                }
                            }

                            // If the snake is an AI, pathfind again
                            if (cur_snake.is_ai)
                                cur_snake.ai_pathfind_bfs(b);
                        }
                        // Only move if the snake's movement will not cause any collisions
                        else if (cur_snake.hitObject(b, 'snake', next_x, next_y)) {
                            cur_snake.is_alive = false;

                            if (!cur_snake.is_ai)
                                sg.alive_hum -= 1;

                            if (sg.alive_hum == 0) {
                                sg.drawEndWords();
                                clearInterval(canvas.interval);
                                canvas.interval = null;
                                return;
                            }
                        }
                        else {
                            cur_snake.move(b);
                        }

                        // decrease delay counter (via adding and later moduloing)
                        if (cur_snake.is_ai)
                            cur_snake.delay_counter += 1;
                    }

                    cur_snake.printScore(i);
                    cur_snake.draw();
                }
                for (i = 0; i < food_arr.length; i++) {
                    food_arr[i].draw();
                }

                    b.debugArr();
            }, 1000 / 7.5);
        }
    });
};

startGame(3, 50);
