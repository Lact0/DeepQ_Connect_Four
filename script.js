window.onresize = changeWindow;
let mainBoard = new Board();
let gameStarted = false;
let overlay;
let text;
let playerTurn;
let canClick = false;
let bot1 = new QBot({table: JSON.parse(table1)});

function load() {
  canvas = document.querySelector('.canvas');
  ctx = canvas.getContext('2d');
  overlay = document.getElementById("overlay");
  text = document.getElementById("topText");
  canvas.width = width;
  canvas.height = height;
  document.onkeydown = keyPress;
  document.onmousemove = updateMousePos;
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

function aiDecide(board, maxPlayer) {
  
}

function changeWindow() {
  width = window.innerWidth;
  height = window.innerHeight;
  //REDRAW SCREEN
}

function keyPress(key) {
  if(key.keyCode == 32) {
    navigator.clipboard.writeText(JSON.stringify(bot.table));
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
      setTimeout(finishGame, 3000);
      return;
    }
    if(playerTurn != 3) {
      canClick = false;
      text.innerHTML = 'Ai Turn';
      setTimeout(aiMove, 100);
    }
  }
  redraw();
}

function aiMove() {
  let moves = mainBoard.getMoves();
  let val = mainBoard.getVal() * (playerTurn == 1? -1: 1);
  let move = bot1.getAction(encode(), moves.length, val);
  mainBoard = mainBoard.makeMove(moves[move]);
  redraw();
  if(mainBoard.winner != 0 || mainBoard.movesLeft == 0) {
    showWinner();
    setTimeout(finishGame, 3000);
    return;
  }
  text.innerHTML = 'Player Turn';
  canClick = true;
}

function encode() {
  let str = '';
  for(let row of mainBoard.arr) {
    for(let n of row) {
      str = str.concat(n);
    }
  }
  return str;
}

function updateMousePos() {
  mousePos[0] = event.clientX;
  mousePos[1] = event.clientY;
  if(gameStarted) {
    redraw();
  }
}

function showWinner() {
  bot1.setQ(mainBoard.getVal() * (playerTurn == 1? -1: 1));
  bot1.reset();
  let t;
  if(mainBoard.movesLeft == 0) {
    text.innerHTML = 'Tie!';
    return;
  }
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