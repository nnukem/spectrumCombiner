
//
// Bezier.as - Arbitrary-order Bezier curve.  This class is intended to illustrate numerical issues and
// a very general application of DeCasteljau's method.  For educational purposes only - this class has
// little practical benefit other than as a teaching tool.
//
// copyright (c) 2006-2007, Jim Armstrong.  All Rights Reserved.
//
// This software program is supplied 'as is' without any warranty, express, implied,
// or otherwise, including without limitation all warranties of merchantability or fitness
// for a particular purpose.  Jim Armstrong shall not be liable for any special incidental, or
// consequential damages, including, without limitation, lost revenues, lost profits, or
// loss of prospective economic advantage, resulting from the use or misuse of this software
// program.
//
// Programmed by Jim Armstrong, singularity (www.algorithmist.net)
//
//
import Coef from './Coef'
import Binomial from '../Numeric/Binomial'

export default class Bezier {
  // properties

  /**
* @description 	Method: Bezier() - Construct a new Bezier instance
*
* @return Nothing
*
* @since 1.0
*
*/
  constructor () {
    this.__useCoef = false // true if precomputed coefficients are generated and used

    this.__x = [] // array of x-coordinates
    this.__y = [] // array of y-coordinates

    this.__binomial = new Binomial() // binomial coefficients
    this.__pascal = [] // specific row of Pascal's triangle for naive evaluation
    this.__coef = new Coef() // used for pregenerated and stored coefficients
    this.__invalidate = false // true if previous coef. computations are invalid
  }

  set useCoef (_b) {
    this.__useCoef = _b
    this.__invalidate = true
  }

  /**
* @description 	Method: addControlPoint( _xCoord:Number, _yCoord:Number ) - Add a control point
*
* @param _xCoord:Number - control point, x-coordinate
* @param _yCoord:Number - control point, y-coordinate
*
* @return Nothing - Adds control points in order called.
*
* @since 1.0
*
*/
  addControlPoint (_xCoord, _yCoord) {
    this.__x.push(_xCoord)
    this.__y.push(_yCoord)

    this.__invalidate = true
  }

  /**
* @description 	Method: reset() - Remove control points
*
*
* @return Nothing
*
* @since 1.0
*
*/
  reset () {
    this.__x.splice(0)
    this.__y.splice(0)
    this.__pascal.splice(0)

    this.__coef.reset()
  }

  /**
* @description 	Method: getX( _t:Number ) - Return x-coordinate for a given t
*
* @param _t:Number - parameter value in [0,1]
*
* @return Number: x-coordinate of Bezier curve provided input is in [0,1], otherwise return B(0) or B(1).
*
* @since 1.0
*
*/
  getX (_t) {
    let t = _t
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t

    if (this.__invalidate) { this.__computeCoef() }

    return this.__useCoef ? this.__coef.getX(t) : this.__naiveX(t)
  }

  // return x(t) using the naive or direct formula
  __naiveX (_t) {
    // yes, this is pretty naive :)
    let t1 = 1.0 - _t
    let ev = 0

    // kids, don't do this at home ...
    let n = this.__x.length
    for (let i = 0; i < n; ++i) {
      ev += this.__pascal[i] * this.__x[i] * Math.pow(t1, n - i - 1) * Math.pow(_t, i)
    }

    return ev
  }

  /**
* @description 	Method: getY( _t:Number ) - Return y-coordinate for a given t
*
* @param _t:Number - parameter value in [0,1]
*
* @return Number: y-coordinate of cubic Bezier curve provided input is in [0,1], otherwise return B(0) or B(1).
*
* @since 1.0
*
*/
  getY (_t) {
    let t = _t
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t

    if (this.__invalidate) { this.__computeCoef() }

    return this.__useCoef ? this.__coef.getY(t) : this.__naiveY(t)
  }

  // return y(t) using the naive or direct formula
  __naiveY (_t) {
    // again, very naive :)
    let t1 = 1.0 - _t
    let ev = 0

    // kids, don't do this at home, especially since the power computations are duplicated from computing x(t)
    let n = this.__y.length
    for (let i = 0; i < n; ++i) { ev += this.__pascal[i] * this.__y[i] * Math.pow(t1, n - i - 1) * Math.pow(_t, i) }

    return ev
  }

  __computeCoef () {
    // straight evaluation or precompute coefficients???
    if (!this.__useCoef) {
      this.__pascal.splice(0)
      this.__pascal = this.__binomial.getRow(this.__x.length - 1)
    } else {
      this.__coef.reset()

      // direct and straightforward, but a bit on the naive side ... how about getting rid of those factorials?
      let n = this.__x.length - 1
      let nFact = this.__factorial(n)
      for (let j = 0; j <= n; ++j) {
        let myObj = this.__summation(j)
        let xC = myObj.x
        let yC = myObj.y

        let mult = nFact / this.__factorial(n - j)
        xC *= mult
        yC *= mult

        this.__coef.addCoef(xC, yC)
      }
    }

    this.__invalidate = false
  }

  // as an exercise, try manually in-lining this function and optimizing the computations across outer loop iterations
  __summation (_j) {
    let iFact = 1.0
    let minusOne = (_j % 2 == 0) ? 1.0 : -1

    // this directly implements the formula, but is not optimized
    let xSum = 0
    let ySum = 0
    for (let i = 0; i <= _j; ++i) {
      let jmiFact = this.__factorial(_j - i)
      let denom = iFact * jmiFact
      xSum += (minusOne * this.__x[i]) / denom
      ySum += (minusOne * this.__y[i]) / denom
      iFact *= parseFloat(i + 1)
      minusOne *= -1.0
    }

    return { x: xSum, y: ySum }
  }

  // hint - inline and optimize ...
  __factorial (_i) {
    if (_i == 0) { return 1.0 }

    let j = _i
    let k = _i
    while (--j > 0) { k *= j }

    return parseFloat(k)
  }
}
