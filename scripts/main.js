// TODO:
//      Pause screen - opaque?
//      Second human player
//      Put in a time limit on AI path finding time
//      Clean up code


// Weird stuff:
//      Replacing the cur_snake with snake_arr[i] when calling the bfs search
//          causes snake_arr[i] to be undefined after... why?
//      bfs AI snake sometimes doesn't eat the food? just passes over
//      Score screen flickers? Only if the snake is an ai
//          Seems to be timed with the pathfinding - perhaps it takes too long?
//          Yet the 'score' words dont flicker, nor do anything else
//      AI snakes other than the first also flicker, but not the human one
//      Bad stuff happens when AI snake does not find any food
//      Replacing 'n_coord' with 'next' in the bfs_ai causes snake to only go down and right

// BUG:
//      A* search suicides sometimes
//      A* does crashes when there is no food
//      The following issues are caused when the ai's current movement causes it to crash into an obstacle the next turn
//          and it is simultaneously calculating a path. The AI's direction does not seem to be updated fast enough, 
//          and so will crash into the object (snake or wall) and die.
//          - A* crashes when there is food, but it not able to reach it
//          - AI can suicide agaisnt bottom wall before it has chance to pathfind


// Optimization:
//      Also, in bfs, could check whether node is food or not before adding to queue, instead of after
//      Snake is double linked list - can use single linked list
//          Will have to change the movement function
//      The path grid is just a 2D array, no need for the object?
//      Clean up graph representation

var canvas = document.getElementById("backgroundCanvas");
canvas.width = 750;
canvas.height = 500;

if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
}

var heuristic = function (a, b) {
    // Manhattan distance
    return ( Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) );
}

// SnakeGame - superclass
function SnakeGame(num_alive) {
    this.num_alive = num_alive;
    this.alive_hum = 1;
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
    var txt = "Click to begin, again to pause!"
    ctx.fillText(txt, canvas.width / 2 - ctx.measureText(txt).width / 2, canvas.height / 2);
}

SnakeGame.prototype.drawEndWords = function () {
    ctx.fillStyle = "#ffffff";
    ctx.font = "50px Arial";
    var txt = "Game Over! Press 'r' to restart!"
    ctx.fillText(txt, canvas.width / 2 - ctx.measureText(txt).width / 2, canvas.height / 2);
}

SnakeGame.prototype.hitObject = function (board, type = 'both', posx = this.posx, posy = this.posy) {
    var hit = false;
    switch (type) {
        case 'snake':
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
function GridNode(x, y, accessible = true, food = false, prev) {
    this.x = x;
    this.y = y;
    this.prev = prev;
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
                this.grid[i][j] = new GridNode(j, i, false, false, null);
            }
            else if (state == 1) {
                this.grid[i][j] = new GridNode(j, i, accessible = true, food = true, null)
            }
            else if (state == 0) {
                this.grid[i][j] = new GridNode(j, i, accessible = true, food = false, null);
            }
            else {
                alert("The board state is messed up: board.board_arr[" + i + "]" + "[" + j + "] is " + board.board_arr[i][j]);
            }
        }
    }
}

PathGrid.prototype.neighbours = function (node) {
    var self = this;
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    var results = [];
    dirs.forEach(function(item, index, array){
        var neighbour = [node.x + item[0], node.y + item[1]];

        if (0 <= neighbour[0] && neighbour[0] < self.x_range && 0 <= neighbour[1] && neighbour[1] < self.y_range){
            if (self.grid[neighbour[1]][neighbour[0]].accessible){
                results.push(self.grid[neighbour[1]][neighbour[0]]);
            }
        }
    });
    return results;
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

// Node for PQueue
function Node(node, value) {
    this.g_node = node;
    this.value = value;
}

// Priority Queue - min heap
function PQueue() {
    this.size = 0;
    this.queue = [];
};
PQueue.prototype.isEmpty = function () {
    return (this.size == 0);
};
PQueue.prototype.GetParent = function (index) {
    if (index != 0)
        return Math.ceil(index/2) - 1;
    else
        return index;
};
PQueue.prototype.GetLeft = function (index) {
    if (2*index + 1 < this.size)
        return 2*index + 1;
    else
        return index;
};
PQueue.prototype.GetRight = function (index) {
    if (2*index + 2 < this.size)
        return 2*index + 2;
    else
        return index;
};
PQueue.prototype.BubbleUp = function (index) {
    if (index === 0)
        return;

    var parent_ind = this.GetParent(index);

    if (this.queue[index].value < this.queue[parent_ind].value) {
        this.Swap(index, parent_ind);
        this.BubbleUp(parent_ind);
    }
    else {
        return;
    }

};
PQueue.prototype.Insert = function (node, value) {
    this.size += 1;
    this.queue.push(new Node(node, value));
    this.BubbleUp(this.size - 1);
};
PQueue.prototype.Swap = function (self, target) {
    var temp = this.queue[self];
    this.queue[self] = this.queue[target];
    this.queue[target] = temp;
};
PQueue.prototype.Heapify = function (ind) {
    while (true) {
        var left_ind = this.GetLeft(ind),
            right_ind = this.GetRight(ind);
        var min_ind;
        var min_val = Math.min(this.queue[left_ind].value, this.queue[right_ind].value, this.queue[ind].value);
        if (min_val == this.queue[left_ind].value && min_val != this.queue[ind].value) {
            min_ind = left_ind;
        }
        else if (min_val == this.queue[right_ind].value && min_val != this.queue[ind].value) {
            min_ind = right_ind;
        }
        else {
            break;
        }
        this.Swap(ind, min_ind);
        ind = min_ind;
    }
};
PQueue.prototype.DeleteMin= function () {
    if (this.size == 0){
        alert("Error: Attempted to delete from empty queue");
        return null;
    }

    var min = this.queue[0];
    this.queue[0] = this.queue.pop();
    this.size -= 1;
    this.Heapify(0);
    return min;
};

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
    this.hit = 'unhit';

    this.target;                        // target food coordinates [x, y];
    this.path = [];                     // path to follow - will be in reverse order
    this.path_delay = 1;                // delay in number of frames before finding a new path
    this.delay_counter = Math.floor(Math.random() * this.path_delay);

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
        var h_x = Math.floor(Math.random() * this.x_range/2 + this.x_range/4);
        var h_y = Math.floor(Math.random() * this.y_range/2 + this.x_range/4);

        var head = new BodySegment(h_x, h_y, null, null);
        overlap = head.hitObject(board);
    }

    board.board_arr[head.posy][head.posx] = 2;
    this.length += 1;
    return head;
};

// adds a segment to the end of the snake with specified posx and posy
// also updates the board array to reflect that
Snake.prototype.addTail = function (posx, posy, board) {
    var body = new BodySegment(posx, posy, null, null);
    //alert('initial');
    if (this.length == 1) {
        this.head.next = body;
        this.tail = body;
        body.prev = this.head;
    }
    else {
        body.prev = this.tail;
        this.tail.next = body;
        this.tail = body;

    }
    //alert('middle');
    board.board_arr[posy][posx] = 2;
    this.length += 1;
    //alert('end');
}

// finds closest food and returns coordinates
Snake.prototype.FindFood = function (food_arr) {
    var self = this;
    var min_dist = 100000;
    var min_ind = 0;
    food_arr.forEach(function(item, index, array){
        var dist = Math.abs(item.posx - self.head.posx) + Math.abs(item.posy - self.head.posy);
        if (dist < min_dist) {
            min_dist = dist;
            min_ind = index;
        }
    });
    return [food_arr[min_ind].posx, food_arr[min_ind].posy];
}

// calculates the snake's direction using A*
// start and goal are pair of [x, y] coordinates
Snake.prototype.ai_pathfind_a = function (board, start, goal) {
    var p_grid = new PathGrid(board);
    var frontier = new PQueue();
    frontier.Insert(start, 0);
    var came_from = [];
    for (i = 0; i < this.y_range; i++){
        came_from[i] = [];
    }
    var cost_so_far = [];
    for (i = 0; i < this.y_range; i++){
        cost_so_far[i] = [];
    }

    came_from[start[1]][start[0]] = null;
    cost_so_far[start[1]][start[0]] = 0;

    var counter = 0;

    while (!frontier.isEmpty()) {
        var current = frontier.DeleteMin();

        if (current.g_node[0] == goal[0] && current.g_node[1] == goal[1]) {
            // printArr(cost_so_far);
            break;
        }

        p_grid.neighbours(p_grid.grid[current.g_node[1]][current.g_node[0]]).forEach(function(next, index, array){
            var n_coord = [next.x, next.y];
            var new_cost = cost_so_far[current.g_node[1]][current.g_node[0]] + 1;
            // alert(new_cost);

            if (cost_so_far[n_coord[1]][n_coord[0]] == undefined || new_cost < cost_so_far[n_coord[1]][n_coord[0]]){
                cost_so_far[n_coord[1]][n_coord[0]] = new_cost;
                var priority = new_cost + 2 * heuristic (goal, n_coord);
                frontier.Insert(n_coord, priority);
                came_from[n_coord[1]][n_coord[0]] = [current.g_node[0], current.g_node[1]];
            }
        });
        counter += 1;
    }
    //printArr(cost_so_far);

    return {
        cf: came_from,
        csf: cost_so_far,
    };
}

// destination is a [x, y] coordinate
Snake.prototype.ReconstructPath = function (came_from, destination) {
    var path = [];
    var cur = destination;
    var prev = came_from[cur[1]][cur[0]];
    while (prev != null) {
        path.push([cur[0] - prev[0], cur[1] - prev[1]])
        cur = prev;
        prev = came_from[cur[1]][cur[0]];
    }
    this.path = path;
}

// calculates the snake's direction using BFS
// changes the snake's path of direction vectors to follow
// path will be in reverse order
Snake.prototype.ai_pathfind_bfs = function (board) {
    // first reset the snake's path
    this.path = [];
    var seen = [];
    var node;
    var p_grid = new PathGrid(board);

    // Using an array as a queue - could be optimized
    var q = new Array();

    seen[[this.head.posx, this.head.posx]]= true;
    q.push(p_grid.grid[this.head.posy][this.head.posx]);

    while (q.length != 0) {
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

        p_grid.neighbours(node).forEach(function(next, index, array){
            var n_coord = [next.x, next.y];
            if (seen[n_coord] != true) {
                seen[n_coord] = true;
                next.prev = node;
                q.push(next);
            }
        });
        // go up
        if (node.y > 0 && p_grid.grid[node.y - 1][node.x].accessible) {

        }
    }
    // alert("no food");
    // if exiting here, then no accessible food is found
    // simply move to the last node
    while (node.prev != null) {
        this.path.push([node.x - node.prev.x, node.y - node.prev.y]);
        node = node.prev;
    }
    return self;
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
    
    var cur_seg = this.head;
    ctx.fillStyle = "#F0ED21";

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

Snake.prototype.resolveHit = function(self, board, food_arr){
    if (this.hit == 'wall' || this.hit == 'snake'){
        console.log("hit " + this.hit);
        this.is_alive = false;
        self.num_alive -= 1;
        if (!this.is_ai){
            self.alive_hum -= 1;
        }
    } else if (this.hit == 'food'){
        var x = this.length == 1? this.head.posx : this.tail.posx;
        var y = this.length == 1? this.head.posy : this.tail.posy;
        this.move(board);
        this.addTail(x, y, board);
        
        for (j = 0; j < food_arr.length; j++) {
            if (food_arr[j].posx == this.head.posx && food_arr[j].posy == this.head.posy) {
                food_arr[j] = new Food(board);
            }
        }
        
        // If the snake is an AI, pathfind again
        if (this.is_ai) {
            this.delay_counter = 0;
        }
    } else{
        this.move(board);
    }
}

Snake.prototype.anyHit = function(next_x, next_y, board){
    // Wall detection
    if (this.hitObject(board, 'wall', next_x, next_y)) {
        this.hit = 'wall';
    }
    // Food detection:
    // If the snake's movement brings it into a 'Food', 
    // instead of moving the snake, add a new snake body ontop of the Food, and make a new Food.
    else if (this.hitObject(board, 'food', next_x, next_y)) {
        this.hit = 'food';
    }
    // Only move if the snake's movement will not cause any collisions
    else if (this.hitObject(board, 'snake', next_x, next_y)) {
        this.hit = 'snake';
    } else {
        this.hit = 'unhit';
    }
}

Snake.prototype.printScore = function (ind) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.fillText("Score", canvas.width - 100, canvas.height - 120);
    ctx.font = "10px Arial";

    var txt = "Player " + String(ind + 1) + ": " + String(this.length);
    //ctx.fillText("FUFDFDF", canvas.width - 100, canvas.height - 120 + 20*ind);//(100 - 15 * (ind)));
    ctx.fillText(txt, canvas.width - 100, canvas.height - (100 - 20 * (ind)));
};

var printCSF = function (arr){
    ctx.fillStyle = "#FF6F50";
    ctx.font = "8px Arial";
    for (i = 0; i < arr.length; i++) {
        for (j = 0; j < arr[i].length; j++) {
            var txt = arr[i][j];
            if (arr[i][j] == undefined)
                txt = 'u';

            ctx.fillText(txt, 2 * j * 7.5 + 7.5, 2 * i * 7.5 + 7.5);
        }
    }
}

SnakeGame.prototype.createType = function (num, board, type) {
    var type_arr = new Array(num);
    for (i = 0; i < num; i++) {
        switch (type){
            case ('snake'):
                if (i > 0){
                    o = new Snake(i % 5, board, true);
                } else {
                    o = new Snake(i % 5, board, false);
                    //o = new Snake(i % 5, board, true);
                }
                break;
            case ('food'):
                o = new Food(board);
                break;
            default:
                console.log('Wrong type input to createType');
                break;
        }
        type_arr[i] = o;
    }
    return type_arr;
}

SnakeGame.prototype.runFrame = function (board, snake_arr, food_arr, self){
    board.draw();
    if (self.alive_hum == 0) {
        self.drawEndWords();
        console.log("game over");
        clearInterval(canvas.interval);
        canvas.interval = null;
        canvas.removeEventListener("click", start);
        return;
    }

    //take player input and move player snakes
    //calculate the ai's movements
    //update the snake's positions according to movements - include growing and removing food
    //draw everything
    //write the score
    for (var i = 0; i < snake_arr.length; i++) {
        cur_snake = snake_arr[i];
        var a_output;
        if (cur_snake.is_alive) { 
            
            // If the snake is an ai, and it is time to choose a path, do so
            if (cur_snake.is_ai){
                if (cur_snake.delay_counter == 0) {
                    cur_snake.target = cur_snake.FindFood(food_arr);
                    //console.log("planing " + cur_snake.target);
                    a_output = cur_snake.ai_pathfind_a(board, [cur_snake.head.posx, cur_snake.head.posy], cur_snake.target);
                    //console.log("finished planning");
                    csf = a_output.csf;
                    cur_snake.ReconstructPath(a_output.cf, cur_snake.target);
                    // bfs path search
                    // cur_snake.ai_pathfind_bfs(b);
                }
                // decrease delay counter (via adding and later moduloing)
                cur_snake.delay_counter += 1;
                cur_snake.delay_counter = cur_snake.delay_counter % cur_snake.path_delay; 
            }
            // gets direction for snake to move
            if (cur_snake.is_ai && cur_snake.path.length != 0) {
                cur_snake.dir = cur_snake.path.pop();
            }
            // The coordinate of the snake's head after the snake's movement
            var next_x = cur_snake.head.posx + cur_snake.dir[0];
            var next_y = cur_snake.head.posy + cur_snake.dir[1];
            // Check whether snake head's position after movement is within bounds first
            // then check for food collision
            cur_snake.anyHit(next_x, next_y, board, food_arr, self);
            cur_snake.resolveHit(self, board, food_arr);
        }
        cur_snake.printScore(i);
        cur_snake.draw();
    }
    for (i = 0; i < food_arr.length; i++) {
        food_arr[i].draw();
    }
    //board.debugArr();

    // for debugging the AI
    //printCSF(csf);
}

SnakeGame.prototype.startGame = function (num_snake, num_food) {
    var self = this;
    var board = new Board();
    var snake_arr = this.createType(num_snake, board, 'snake');
    var food_arr = this.createType(num_food, board, 'food');
    board.draw();
    this.drawStartWords();

    canvas.addEventListener("click", start = function (event) {
        if (canvas.interval != null) {
            console.log('paused');
            clearInterval(canvas.interval);
            canvas.interval = null;
        } else {
            console.log('resume');
            canvas.interval = setInterval(function() {SnakeGame.prototype.runFrame(board, snake_arr, food_arr, self)}, 1000 / 10);
        }
    });
};

var num_snakes = 2;

var sg = new SnakeGame(num_snakes);
sg.startGame(num_snakes, 10);

canvas.addEventListener('keydown', function (event) {
    if (event.keyCode == 82){
        clearInterval(canvas.interval);
        canvas.interval = null;
        canvas.removeEventListener("click", start);
        var sg = new SnakeGame(num_snakes);
        sg.startGame(num_snakes, 10);
    }
})
