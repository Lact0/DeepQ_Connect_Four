function softMax(arr) {
  let ret = [];
  let sum = 0;
  for(let n of arr) {
    sum += Math.exp(n);
  }
  for(let n of arr) {
    ret.push(Math.exp(n) / sum);
  }
  return ret;
}

class DeepQ {
  constructor(numIn, dim, params = {}) {
    this.eps = params.eps || .8;
    this.lr = params.lr || .2;
    this.discount = params.lr || .9;
    this.numIn = numIn;
    this.dim = dim;
    this.mainNet = params.mainNet || new NeuralNetwork(numIn, dim, params);
    this.targetNet = this.mainNet.copy();
  }

  //You should have an array of moves, put in length,
  //return the index for the array.
  getAction(state, numMoves, reward = 0) {
    if(!(state in this.table)) {
      let moves = [];
      for(let i = 0; i < numMoves; i++) {
        moves.push(0);
      }
      this.table[state] = moves;
    }
    let probabilities = softMax(this.table[state]);
    let move = 0;
    let n = Math.random();
    while(n > 0) {
      n -= probabilities[move];
      move++;
    }
    move--;
    //Update the old Q Value
    if(this.old) {
      const oldQ = this.table[this.old[0]][this.old[1]];
      let sum = 0;
      for(let i = 0; i < probabilities.length; i++) {
        probabilities[i] * this.table[state][i];
      }
      const newQ = reward + this.discount * sum;
      const td = newQ - oldQ;
      this.table[this.old[0]][this.old[1]] += td * this.lr;
    }
    this.old = [state, move];
    return move;
  }
}
