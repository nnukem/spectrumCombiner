//
// Spline3.as - Generate natural cubic spline, given a set of knots.
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
//                      A future (faster) version will do this adaptively.
//

import Consts from '../Numeric/Consts'
import Composite from './Composite'

export default class Spline3 extends Composite {
/**
* @description 	Method: Spline3() - Construct a new Spline3 instance
*
* @return Nothing
*
* @since 1.0
*
*/
  constructor () {
    super()

    this.__error.classname = 'Spline3'

    this.__t = new Array()
    this.__y = new Array()
    this.__u = new Array()
    this.__v = new Array()
    this.__h = new Array()
    this.__b = new Array()
    this.__z = new Array()
    this.__hInv = new Array()

    this.__invalidate = true
    this.__delta = 0.0
    this.__knots = 0
  }

  // return knot count
  get knotCount () { return this.__knots }

  // return array of Objects with X and Y properties containing knot coordinates
  get knots () {
    let knotArr = new Array()
    for (let i = 0; i < this.__knots; ++i) { knotArr.push({ X: this.__t[i], Y: this.__y[i] }) }

    return knotArr
  }

  /**
* @description 	Method: addControlPoint( _xKnot, _yKnot ) - Add/Insert a knot in a manner that maintains
* non-overlapping intervals.  This method rearranges knot order, if necessary, to maintain non-overlapping intervals.
*
* @param _t - x-coordinate of knot to add
* @param _y - y-coordinate of knot to add
*
* @return Nothing
*
* @since 1.0
*
*/
  addControlPoint (_xKnot, _yKnot) {
    this.__error.methodname = 'addControlPoint()'

    if (isNaN(_xKnot)) {
      this.__error.message = 'invalid x-coordinate at knot: ' + this.__t.length
      this.emit(this.__error.errType, this.__error)
      return
    }
    if (isNaN(_yKnot)) {
      this.__error.message = 'invalid y-coordinate at knot: ' + this.__t.length
      this.emit(this.__error.errType, this.__error)
      return
    }

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
    for (let i = this.__knots - 1; i >= _indx; i--) {
      this.__t[i + 1] = this.__t[i]
      this.__y[i + 1] = this.__y[i]
    }
    this.__t[_indx] = _xKnot
    this.__y[_indx] = _yKnot
    this.__knots++
  }

  // remove knot at index
  __remove (_indx) {
    for (let i = _indx; i < this.__knots; ++i) {
      this.__t[i] = this.__t[i + 1]
      this.__y[i] = this.__y[i + 1]
    }
    this.__t.pop()
    this.__y.pop()
    this.__knots--
  }

  /**
* @description 	Method: removePointAt( _indx ) - Delete knot at the specified index
*
* @param _indx - index of knot to delete
*
* @return Nothing
*
* @since 1.0
*
*/
  removePointAt (_indx) {
    this.__error.methodname = 'removePointAt()'

    if (_indx < 0 || _indx >= this.__knots) {
      this.__error.message = 'Index: ' + _indx.toString() + ' is out of range.'
      this.emit(this.__error.errType, this.__error)
      return
    };

    this.__remove(_indx)
    this.__invalidate = true
  }

  /**
* @description 	Method: moveControlPoint( _indx, _xKnot, _yKnot ) - Move knot at the specified index within its interval
*
* @param _indx    - index of knot to replace
* @param _xKnot - new x-coordinate
* @param _yKnot - new y-coordinate
*
* @return Nothing - There is no testing to see if the move causes any intervals to overlap
*
* @since 1.0
*
*/
  moveControlPoint (_indx, _xKnot, _yKnot) {
    this.__error.methodname = 'moveControlPoint()'

    if (_indx < 0 || _indx >= this.__knots) {
      this.__error.message = 'Index: ' + _indx.toString() + ' is out of range.'
      this.emit(this.__error.errType, this.__error)
      return
    }

    if (isNaN(_xKnot)) {
      this.__error.message = 'Invalid x-coordinate'
      this.emit(this.__error.errType, this.__error)
      return
    }

    if (isNaN(_yKnot)) {
      this.__error.message = 'Invalid y-coordinate'
      this.emit(this.__error.errType, this.__error)
      return
    }

    this.__t[_indx] = _xKnot
    this.__y[_indx] = _yKnot
    this.__invalidate = true
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
* @description 	Method: removeKnotAtX( _xKnot ) - Delete knot at a given x-coordinate
*
* @param _xKnot - x-coordinate of knot to delete
*
* @return Nothing
*
* @since 1.0
*
*/
  removeKnotAtX (_xKnot) {
    this.__error.methodname = 'removeKnotAtX()'

    if (isNaN(_xKnot)) {
      this.__error.message = 'Invalid x-coordinate:'
      this.emit(this.__error.errType, this.__error)
      return
    };

    let i = -1
    for (let j = 0; j < this.__knots; ++j) {
      if (this.__t[j] == _xKnot) {
        i = j
        break
      }
    }

    if (i == -1) {
      this.__error.message = 'No knot at x-coordinate: ' + _xKnot.toString()
      this.emit(this.__error.errType, this.__error)
    } else {
      this.__remove(i)
      this.__invalidate = true
    }
  }

  /**
* @description 	Method: eval( _xKnot ) - Evaluate spline at a given x-coordinate
*
* @param _xKnot - x-coordinate to evaluate spline
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

      // trace(this.__knots-2,this.__knots)

      for (let j = this.__knots - 2; j >= 0; j--) {
        if (_xKnot >= this.__t[j]) {
          this.__delta = _xKnot - this.__t[j]
          i = j
          break
        }
      }

      let b = (this.__y[i + 1] - this.__y[i]) * this.__hInv[i] - this.__h[i] * (this.__z[i + 1] + 2.0 * this.__z[i]) * Consts.ONE_SIXTH
      let q = 0.5 * this.__z[i] + this.__delta * (this.__z[i + 1] - this.__z[i]) * Consts.ONE_SIXTH * this.__hInv[i]
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
