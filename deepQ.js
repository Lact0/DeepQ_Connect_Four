function argMax(arr) {
  let max = arr[0];
  let maxInd = 0;
  for(let i = 1; i < arr.length; i++) {
    if(arr[i] > max) {
      max = arr[i];
      maxInd = i;
    }
  }
  return maxInd;
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
    //One piece of memory is [state, action, nextState, reward]
    this.memory = [];
  }

  //You should have an array of moves, put in length,
  //return the index for the array.
  getAction(state, reward = 0) {
    if(this.memory.length > 0) {
      const end = this.memory.length - 1;
      this.memory[end][2] = (state);
      this.memory[end][3] += (reward);
    }

    const values = this.mainNet.pass(state);
    let action = parseInt(Math.random() * values.length);
    if(Math.random() < this.eps) {
      action = argMax(values);
    }

    let memory = [state, action, 0, 0];
    this.memory.push(memory);
    return action;
  }

  addReward(r) {
    this.memory[this.memory.length - 1][3] += r;
  }

  finishEp() {
    this.memory = [];
    this.setTarget();
  }

  setTarget() {
    this.targetNet = this.mainNet.copy();
  }

  trainLatestQ() {
    if(this.memory.length < 2) {
      return false;
    }
    let mem = this.memory[this.memory.length - 2];
    const s1 = mem[0];
    const a = mem[1];
    const s2 = mem[2];
    const r = mem[3];
    let qvalues = this.mainNet.pass(s1);
    let futureVals = this.targetNet.pass(s2);
    let maxq = futureVals.reduce((a, b) => Math.max(a, b), -Infinity);
    qvalues[a] = r + this.discount * maxq;
    this.mainNet.trainBatch([s1], [qvalues], this.lr);
  }
}
