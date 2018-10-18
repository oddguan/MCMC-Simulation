'use strict';

class Operation {
  constructor(a, b) {
    this._a = a;
    this._b = b;
  }

  get a() {
    return this._a;
  }

  get b() {
    return this._b;
  }

  addPoints() {
    let sum = this.a + this.b;
    return sum;
  }
}

let o = new Operation(1, 2);
console.log(o.addPoints());

module.exports = { Operation };
