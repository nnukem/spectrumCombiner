//
// FastCubicSpline.as - Natural cubic spline without the generality of the Composite::Spline 3 class.
//
// Reference:  http://www.algorithmist.net/spline.html
//
// copyright (c) 2005-2007, Jim Armstrong.  All Rights Reserved.
//
// This software program is supplied 'as is' without any warranty, express, implied,
// or otherwise, including without limitation all warranties of merchantability or fitness
// for a particular purpose.  Jim Armstrong shall not be liable for any special
// incidental, or consequential damages, including, without limitation, lost
// revenues, lost profits, or loss of prospective economic advantage, resulting
// from the use or misuse of this software program.
//
//
// Note:  Although some attempt has been made to optimize operation count and complexity, this code
//        is written more for clarity than Actionscript performance.
//
// Programmed by Jim Armstrong, singularity (www.algorithmist.net)
//
//
// Important notes:  1) Intervals must be non-overlapping.  Insertion preserves this constraint.
//
//                   2) Knot insertion/deletion causes a complete regeneration of coefficients.
//                      This version of the code is optimized for a single set of knots.
//

export default class FastCubicSpline {
/**
* @description 	Method: Spline3() - Construct a new Spline3 instance
*
* @return Nothing
*
* @since 1.0
*
*/
  constructor () {
    this.__t = []
    this.__y = []
    this.__u = []
    this.__v = []
    this.__h = []
    this.__b = []
    this.__z = []
    this.__hInv = []

    this.__invalidate = true
    this.__delta = 0.0
    this.__knots = 0
  }

  // return knot count
  get knotCount () { return this.__knots }

  // return array of Objects with X and Y properties containing knot coordinates
  get knots () {
    let knotArr = []
    for (let i = 0; i < this.__knots; ++i) { knotArr.push({ X: this.__t[i], Y: this.__y[i] }) }

    return knotArr
  }

/**
* @description 	Method: addControlPoint( _xKnot:Number, _yKnot:Number ) - Add/Insert a knot in a manner that maintains
* non-overlapping intervals.  This method rearranges knot order, if necessary, to maintain non-overlapping intervals.
*
* @param _t:Number - x-coordinate of knot to add
* @param _y:Number - y-coordinate of knot to add
*
* @return Nothing
*
* @since 1.0
*
*/
  addControlPoint (_xKnot, _yKnot) {
    this.__invalidate = true

    if (this.__t.length == 0) {
      this.__t.push(_xKnot)
      this.__y.push(_yKnot)
      this.__knots++
    } else {
      if (_xKnot > this.__t[this.__knots - 1]) {
        this.__t.push(_xKnot)
        this.__y.push(_yKnot)
        this.__knots++
      } else if (_xKnot < this.__t[0]) { this.__insert(_xKnot, _yKnot, 0) } else {
        if (this.__knots > 1) {
          for (let i = 0; i < this.__knots - 1; ++i) {
            if (_xKnot > this.__t[i] && _xKnot < this.__t[i + 1]) { this.__insert(_xKnot, _yKnot, i + 1) }
          }
        }
      }
    }
  }

  // insert knot at index
  __insert (_xKnot, _yKnot, _indx) {
    this.__t.splice(_indx, 0, _xKnot)
    this.__y.splice(_indx, 0, _yKnot)

    this.__knots++
  }

  /**
* @description 	Method: deleteAllKnots() - Delete all knots
*
* @return Nothing
*
* @since 1.0
*
*/
  deleteAllKnots () {
    this.__t.splice(0)
    this.__y.splice(0)

    this.__knots = 0
    this.__invalidate = true
  }

  /**
* @description 	Method: eval( _xKnot:Number ) - Evaluate spline at a given x-coordinate
*
* @param _xKnot:Number - x-coordinate to evaluate spline
*
* @return Number: - NaN if there are no knots
*                 - y[0] if there is only one knot
*                 - Spline value at the input x-coordinate, if there are two or more knots
*
* @since 1.0
*
*/
  eval2 (_xKnot) {
    if (this.__knots == 0) { return NaN } else if (this.__knots == 1) { return this.__y[0] } else {
      if (this.__invalidate) { this.__computeZ() }

      // determine interval
      let i = 0
      this.__delta = _xKnot - this.__t[0]
      for (let j = this.__knots - 2; j >= 0; j--) {
        if (_xKnot >= this.__t[j]) {
          this.__delta = _xKnot - this.__t[j]
          i = j
          break
        }
      }

      let b = (this.__y[i + 1] - this.__y[i]) * this.__hInv[i] - this.__h[i] * (this.__z[i + 1] + 2.0 * this.__z[i]) * 0.1666666666666667
      let q = 0.5 * this.__z[i] + this.__delta * (this.__z[i + 1] - this.__z[i]) * 0.1666666666666667 * this.__hInv[i]
      let r = b + this.__delta * q
      let s = this.__y[i] + this.__delta * r

      return s
    }
  }

  // compute z[i] based on current knots
  __computeZ () {
    // reference the white paper for details on this code

    // pre-generate h^-1 since the same quantity could be repeatedly calculated in eval()
    for (let i = 0; i < this.__knots - 1; ++i) {
      this.__h[i] = this.__t[i + 1] - this.__t[i]
      this.__hInv[i] = 1.0 / this.__h[i]
      this.__b[i] = (this.__y[i + 1] - this.__y[i]) * this.__hInv[i]
    }

    // recurrence relations for u(i) and v(i) -- tridiagonal solver
    this.__u[1] = 2.0 * (this.__h[0] + this.__h[1])
    this.__v[1] = 6.0 * (this.__b[1] - this.__b[0])

    for (let i = 2; i < this.__knots - 1; ++i) {
      this.__u[i] = 2.0 * (this.__h[i] + this.__h[i - 1]) - (this.__h[i - 1] * this.__h[i - 1]) / this.__u[i - 1]
      this.__v[i] = 6.0 * (this.__b[i] - this.__b[i - 1]) - (this.__h[i - 1] * this.__v[i - 1]) / this.__u[i - 1]
    }

    // compute z(i)
    this.__z[this.__knots - 1] = 0.0
    for (let i = this.__knots - 2; i >= 1; i--) { this.__z[i] = (this.__v[i] - this.__h[i] * this.__z[i + 1]) / this.__u[i] }

    this.__z[0] = 0.0

    this.__invalidate = false
  }
}
