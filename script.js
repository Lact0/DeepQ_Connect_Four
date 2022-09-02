window.onresize = changeWindow;
let mainBoard = new Board();
let gameStarted = false;
let overlay;
let text;
let playerTurn;
let canClick = false;

function load() {
  canvas = document.querySelector('.canvas');
  ctx = canvas.getContext('2d');
  overlay = document.getElementById("overlay");
  text = document.getElementById("topText");
  canvas.width = width;
  canvas.height = height;
  document.onkeydown = keyPress;
  document.onmousemove = updateMousePos;
  //runFrame();
}

function startGame(n) {
  playerTurn = n;
  canClick = !(n == 2);
  overlay.style.display = "none";
  text.style.display = 'block';
  gameStarted = true;
  mainBoard = new Board();
  text.innerHTML = 'Player Turn';
  if(n == 2) {
    text.innerHTML = 'Ai Turn';
    aiMove();
  }
  redraw();
}

function finishGame() {
  canClick = false;
  overlay.style.display = 'block';
  text.style.display = 'none';
  gameStarted = false;
  //ctx.clearRect(0, 0, width, height);
}

function redraw() {
  ctx.clearRect(0, 0, width, height);
  mainBoard.draw(0, 0, width, height);
}

function aiDecide(board, maxPlayer, a = Number.MIN_VALUE, b = Number.MAX_VALUE, depth = 10) {
  const moves = board.getMoves();
  if(board.winner != 0 || moves.length == 0 || depth == 0) {
    return [false, board.getVal()];
  }
  let ext;
  let bestMove;
  for(let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const newBoard = board.makeMove(move);
    const outcome = aiDecide(newBoard, !maxPlayer, a, b, depth - 1);
    if(ext == null) {
      bestMove = move;
      ext = outcome[1];
    }
    if(maxPlayer) {
      if(outcome[1] > ext) {
        bestMove = move;
        ext = outcome[1];
      }
      if(ext >= b) {
        break;
      }
      a = max(a, ext);
    } else {
      if(outcome[1] < ext) {
        bestMove = move;
        ext = outcome[1];
      }
      if(ext <= a) {
        break;
      }
      b = min(b, ext);
    }
  }
  //TEMPORARY
  //IF THE BEST PLAY STILL RESULTS IN LOSS,
  //CHOOSE RANDOM MOVE, NOT FIRST
  if((maxPlayer && ext == -10000) || (!maxPlayer && ext == 10000)) {
    bestMove = moves[rand(0, moves.length - 1)];
  }
  return [bestMove, ext];
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
  if(!canClick) {
    return;
  }
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
      canClick = false;
      showWinner();
      setTimeout(finishGame, 1000);
      return;
    }
    if(playerTurn != 3) {
      canClick = false;
      text.innerHTML = 'Ai Turn';
      setTimeout(aiMove, 1000);
    }
  }
  redraw();
}

function aiMove() {
  let move;
  let player = playerTurn == 2;
  move = aiDecide(mainBoard, player)[0];
  mainBoard = mainBoard.makeMove(move);
  redraw();
  if(mainBoard.winner != 0 || mainBoard.movesLeft == 0) {
    showWinner();
    setTimeout(finishGame, 3000);
    return;
  }
  text.innerHTML = 'Player Turn';
  canClick = true;
}

function updateMousePos() {
  mousePos[0] = event.clientX;
  mousePos[1] = event.clientY;
  if(gameStarted) {
    redraw();
  }
}

function showWinner() {
  let t;
  switch(playerTurn) {
    case 1:
      if(mainBoard.winner == 1) {
        t = 'You Win!';
      } else {
        t = 'Ai Wins!';
      }
      break;
    case 2:
      if(mainBoard.winner == 1) {
        t = 'Ai Wins!';
      } else {
        t = 'You Win!';
      }
      break;
    case 3:
      t = 'Player ' + mainBoard.winner + ' Wins!'; 
      break;
  }

  text.innerHTML = t;
}