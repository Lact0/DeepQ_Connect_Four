window.onresize = changeWindow;
let mainBoard = new Board();
let gameStarted = false;
let overlay;
let playerTurn;

function load() {
  canvas = document.querySelector('.canvas');
  ctx = canvas.getContext('2d');
  overlay = document.getElementById("overlay");
  canvas.width = width;
  canvas.height = height;
  document.onkeydown = keyPress;
  document.onmousemove = updateMousePos;
  //runFrame();
}

function startGame(n) {
  playerTurn = n;
  overlay.style.display = "none";
  gameStarted = true;
  mainBoard = new Board();
  if(n == 2) {
    mainBoard = mainBoard.makeMove(AiMove());
  }
  redraw();
}

function finishGame() {
  overlay.style.display = 'block';
  gameStarted = false;
  //ctx.clearRect(0, 0, width, height);
}

function redraw() {
  ctx.clearRect(0, 0, width, height);
  mainBoard.draw(0, 0, width, height);
}

function AiMove() {
  const moves = mainBoard.getMoves();
  return moves[rand(0, moves.length - 1)];
}

function changeWindow() {
  width = window.innerWidth;
  height = window.innerHeight;
  //REDRAW SCREEN
}

function keyPress(key) {
  if(key.keyCode != 32) {
    return;
  }
}

function leftClick() {
  const x = event.clientX;
  const y = event.clientY;
  const xSpace = width / 7;
  const ySpace = height / 6;
  const space = min(xSpace, ySpace);
  const xStart = (width - (space * 6)) / 2;
  const mouseX = Math.floor((mousePos[0] - xStart - (space * .5)) / space) + 1;
  if(!gameStarted || (playerTurn != mainBoard.toMove && playerTurn != 3)) {
    return;
  }
  if(mainBoard.arr[mouseX][5] == 0) {
    mainBoard = mainBoard.makeMove(mouseX);
    redraw();
    if(mainBoard.winner != 0 || mainBoard.movesLeft == 0) {
      alert('Winner is player ' + mainBoard.winner + '!');
      finishGame();
      return;
    }
    if(playerTurn != 3) {
      mainBoard = mainBoard.makeMove(AiMove());
      if(mainBoard.winner != 0 || mainBoard.movesLeft == 0) {
        alert('Winner is player ' + mainBoard.winner + '!');
        finishGame();
        return;
      }
    }
  }
  redraw();
}

function updateMousePos() {
  mousePos[0] = event.clientX;
  mousePos[1] = event.clientY;
  if(gameStarted) {
    redraw();
  }
}