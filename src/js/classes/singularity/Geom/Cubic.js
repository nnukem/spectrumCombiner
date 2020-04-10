//
// Cubic.as - Simple holder class for cubic polynomial coefficients.
//
// copyright (c) 2006-2007, Jim Armstrong.  All Rights Reserved.
//
// This software program is supplied 'as is' without any warranty, express, implied,
// or otherwise, including without limitation all warranties of merchantability or fitness
// for a particular purpose.  Jim Armstrong shall not be liable for any special incidental,
// or consequential damages, including, without limitation, lost revenues, lost profits,
// or loss of prospective economic advantage, resulting from the use or misuse of this
// software program.
//
// Programmed by Jim Armstrong, singularity (www.algorithmist.net)
//
//

export default class Cubic {
  constructor () {
    this.reset()
  }

  get degree () { return 3 }

  reset () {
    this.__c0X = 0
    this.__c1X = 0
    this.__c2X = 0
    this.__c3X = 0
    this.__c0Y = 0
    this.__c1Y = 0
    this.__c2Y = 0
    this.__c3Y = 0

    this.__count = 0
  }

  addCoef (_cX, _cY) {
    if (this.__count < 4 && !isNaN(_cX) && !isNaN(_cY)) {
      switch (this.__count) {
        case 0:
          this.__c0X = _cX
          this.__c0Y = _cY
          break

        case 1:
          this.__c1X = _cX
          this.__c1Y = _cY
          break

        case 2:
          this.__c2X = _cX
          this.__c2Y = _cY
          break

        case 3:
          this.__c3X = _cX
          this.__c3Y = _cY
          break
      }
      this.__count++
    }
  }

  getCoef (_indx) {
    if (_indx > -1 && _indx < 4) {
      var coef = {}
      switch (_indx) {
        case 0:
          coef.X = this.__c0X
          coef.Y = this.__c0Y
          break

        case 1:
          coef.X = this.__c1X
          coef.Y = this.__c1Y
          break

        case 2:
          coef.X = this.__c2X
          coef.Y = this.__c2Y
          break

        case 3:
          coef.X = this.__c3X
          coef.Y = this.__c3Y
          break
      }
    }
    return coef
  }

  getX (_t) {
    return (this.__c0X + _t * (this.__c1X + _t * (this.__c2X + _t * (this.__c3X))))
  }

  getY (_t) {
    return (this.__c0Y + _t * (this.__c1Y + _t * (this.__c2Y + _t * (this.__c3Y))))
  }

  getXPrime (_t) {
    return (this.__c1X + _t * (2.0 * this.__c2X + _t * (3.0 * this.__c3X)))
  }

  getYPrime (_t) {
    return (this.__c1Y + _t * (2.0 * this.__c2Y + _t * (3.0 * this.__c3Y)))
  }

  getDeriv (_t) {
    // use chain rule
    let dy = this.getYPrime(_t)
    let dx = this.getXPrime(_t)
    return dy / dx
  }

  toString () {
    let myStr = 'coef[0] ' + this.__c0X + ',' + this.__c0Y
    myStr += ' coef[1] ' + this.__c1X + ',' + this.__c1Y
    myStr += ' coef[2] ' + this.__c2X + ',' + this.__c2Y
    myStr += ' coef[3] ' + this.__c3X + ',' + this.__c3Y

    return myStr
  }
}
