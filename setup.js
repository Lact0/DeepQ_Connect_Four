//Vars
let width = window.innerWidth;
let height = window.innerHeight;
let canvas;
let ctx;
let mousePos = [0,0];

//Useful Functions
function max(n1, n2) {
  if(n1 > n2) {
    return n1;
  }
  return n2;
}

function min(n1, n2) {
  if(n1 < n2) {
    return n1;
  }
  return n2;
}

function randColor() {
  return 'rgba(' + rand(0,255) + ',' + rand(0,255) + ',' + rand(0,255) + ')';
}

function rand(min, max) {
  return Math.floor(Math.random() * (max-min+1)) + (min);
}
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function radToDeg(rad) {
  return rad / Math.PI * 180;
}

function drawLine(x1, y1, x2, y2, style = white, r = 1) {
  ctx.strokeStyle = style;
  ctx.lineWidth = r;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function equals(arr1, arr2) {
  if(arr1.length != arr2.length) {
    return false;
  }
  for(let i = 0; i < arr1.length; i++) {
    if(arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
}

function copy(arr) {
  return JSON.parse(JSON.stringify(arr));
}

function remove(arr, n) {
  const i = arr.indexOf(n);
  if(i >= 0) {
    arr.splice(i, 1);
    return true;
  }
  return false;
}

function shuffle(arr) {
  let m = arr.length - 1;
  while(m > 0) {
    const i = rand(0, m);
    const temp = arr[i];
    arr[i] = arr[m];
    arr[m] = temp;
    m--;
  }
  return arr;
}

function intersects(p11, p12, p21, p22) {
  const m1 = (p11.y - p12.y) / (p11.x - p12.x);
  const m2 = (p21.y - p22.y) / (p21.x - p22.x);
  const x = ((m1 * p11.x) - (m2 * p21.x) - p11.y + p21.y) / (m1 - m2);
  if((x > p11.x != x > p12.x) && (x > p21.x != p22.x)) {
    return {'x': x, 'y': m1 * (x - p11.x) + p11.y};
  }
  return false;
}

//Classes
class Vector {
  constructor(x = 0, y = 0, x0 = 0, y0 = 0) {
    this.x = x - x0;
    this.y = y - y0;
    this.getMag();
  }

  getMag() {
    this.mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize() {
    if(this.mag == 0) {
      return;
    }
    this.x /= this.mag;
    this.y /= this.mag;
    this.getMag();
  }

  setMag(mag) {
    this.normalize();
    this.x *= mag;
    this.y *= mag;
    this.mag = mag;
  }

  limit(mag) {
    this.getMag();
    if(this.mag > mag) {
      this.setMag(mag);
    }
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.getMag();
  }

  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.getMag();
  }

  distTo(vector) {
    return Math.sqrt(Math.pow(this.x - vector.x, 2) + Math.pow(this.y - vector.y, 2));
  }
}

class Board {
  constructor() {
    this.arr = [[0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],];
    this.toMove = 1;
    this.winner = 0;
    this.movesLeft = 42;
  }

  draw(x = 0, y = 0, w = width, h = height) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    const xSpace = w / 7;
    const ySpace = h / 6;
    const space = min(xSpace, ySpace);
    const xStart = (w - (space * 6)) / 2;
    const yStart = (h - (space * 5)) / 2;
    const r = space / 4;
    for(let i = 0; i < 7; i++) {
      for(let j = 0; j < 6; j++) {
        ctx.beginPath();
        ctx.arc(xStart + i * space, yStart + j * space, r, 0, Math.PI * 2);
        ctx.stroke();
        switch(this.arr[i][5 - j]) {
          case 1:
            ctx.fillStyle = 'blue';
            ctx.fill();
            break;
          case 2:
            ctx.fillStyle = 'red';
            ctx.fill();
            break;
        }
      }
    }
    const mouseX = Math.floor((mousePos[0] - xStart - (space * .5)) / space) + 1;
    if(mouseX >= 0 && mouseX < 7) {
      ctx.fillStyle = 'rgba(100, 100, 100, .5)';
      ctx.beginPath();
      ctx.arc(xStart + space * mouseX, yStart, r * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  getMoves() {
    let moves = [];
    for(let i = 0; i < 7; i++) {
      if(this.arr[i][5] == 0) {
        moves.push(i);
      }
    }
    return moves;
  }
  
  makeMove(row) {
    const newBoard = this.copy();
    
    if(this.arr[row][5] != 0) {
      return false;
    }
    let pos = 5;
    while(this.arr[row][pos] == 0 && pos >= 0) {
      pos -= 1;
    }
    pos++;
    newBoard.arr[row][pos] = this.toMove;
    newBoard.toMove = (this.toMove % 2) + 1;

    //Check for Win
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for(let dir of directions) {
      let n = 1;
      let p = {x: row, y: pos};
      for(let j = 0; j < 2; j++) {
        let mult = j * 2 - 1;
        let cont = true;
        let i = 1;
        while(cont) {
          let color;
          try {
            color = this.arr[p.x + dir[0] * i * mult][p.y + dir[1] * i * mult];
          } catch {
            break;
          }
          if(color != this.toMove) {
            break;
          }
          n++;
          i++;
        }
      }
      if(n >= 4) {
        newBoard.winner = this.toMove;
      }
    }
    newBoard.movesLeft--;
    return newBoard;
  }

  copy() {
    const newBoard = new Board();
    for(let i = 0; i < this.arr.length; i++) {
      for(let j = 0; j < this.arr[i].length; j++) {
        newBoard.arr[i][j] = this.arr[i][j];
      }
    }
    newBoard.toMove = this.toMove;
    newBoard.movesLeft = this.movesLeft;
    return newBoard;
  }

  getVal() {
    switch(this.winner) {
      case 1:
        return 10000;
      case 2:
        return -10000;
    }
    let ret = 0;
    return ret;
  }
}