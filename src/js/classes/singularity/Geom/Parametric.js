//
// Parametric.as - Base class for single-segment parametric curves.
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
// Programmed by:  Jim Armstrong, singularity (www.algorithmist.net)

import EventDispatcher from '../../nuke/utils/EventDispatcher'
import SingularityEvent from '../Events/SingularityEvent'
import Gauss from '../Numeric/Gauss'
import Consts from '../Numeric/Consts'
import FastCubicSpline from './FastCubicSpline'

export default class Parametric extends EventDispatcher {
/**
* @description 	Method: Parameteric() - Construct a new base parametric curve
*
* @return Nothing
*
* @since 1.0
*
*/
  constructor () {
    super()
    // drawing
    this.__color = 0x0000ff // arc color
    this.__thickness = 1 // arc thickness

    this.__count = 0 // count number of points added
    this.__invalidate = true // true if current coefficients are invalid
    this.__container = null

    this.__error = new SingularityEvent(SingularityEvent.ERROR)
    this.__error.classname = 'Parametric'

    this.__integrand = function (_t) {
      var x = this.__coef.getXPrime(_t)
      var y = this.__coef.getYPrime(_t)

      return Math.sqrt(x * x + y * y)
    }

    this.__integral = new Gauss()
    this.__integral.on(SingularityEvent.ERROR, this.__onError)

    this.__spline = new FastCubicSpline()

    this.__param = Consts.UNIFORM
    this.__arcLength = -1
    this.__t = 0
    this.__s = 0
  }

  __onError (_e) {
    this.__error.message = _e.toString() + ' during numerical integration.'
    this.emit(this.__error.errType, this.__error)
  }

  get degree () { return this.__coef.degree }

  set parameterize (_s) {
    if (_s == Consts.ARC_LENGTH || _s == Consts.UNIFORM) {
      this.__param = _s
      this.__invalidate = true
    }
  }

  set color (_c) {
    this.__color = _c
  }

  set thickness (_t) {
    this.__thickness = Math.round(_t)
  }

  set container (_s) {
    this.__container = _s
  }

  /**
* @description 	Method: arcLength() - Return arc-length of the *entire* curve by numerical integration
*
* @return Number: Estimate of total arc length of the curve
*
* @since 1.0
*
*/
  arcLength () {
    if (this.__arcLength != -1) { return this.__arcLength }

    if (this.__invalidate) { this.__computeCoef() }

    var len = this.__integral.eval2(this.__integrand, 0, 1, 5)
    this.__arcLength = len

    return len
  }

  /**
* @description 	Method: arcLengthAt(_t:Number) - Return arc-length of curve segment on [0,_t].
*
* @param _t:Number - parameter value to describe partial curve whose arc-length is desired
*
* @return Number: Estimate of arc length of curve segment from t=0 to t=_t.
*
* @since 1.0
*
*/
  arcLengthAt (_t) {
    if (this.__invalidate) { this.__computeCoef() }

    var t = (_t < 0) ? 0 : _t
    t = (t > 1) ? 1 : t

    return this.__integral.eval2(this.__integrand, 0, t, 8)
  }

  /**
* @description 	Method: getCoef(_i:uint) - Return the i-th coefficient of the parameteric curve (coefficients used to evaluate the curve in nested form)
*
* @return Object - no range-checking on the argument; you break it ... you buy it!
*
* @since 1.1
*
*/
  getCoef (_i) {
    return this.__coef.getCoef(_i)
  }

  // parameterize curve
  __parameterize () {
    if (this.__param == Consts.ARC_LENGTH) {
      if (this.__spline.knotCount > 0) { this.__spline.deleteAllKnots() }

      var arcLen = []
      var len = this.__integral.eval2(this.__integrand, 0, 0.1, 8)
      arcLen[0] = len

      len += this.__integral.eval2(this.__integrand, 0.1, 0.2, 8)
      arcLen[1] = len

      len += this.__integral.eval2(this.__integrand, 0.2, 0.3, 8)
      arcLen[2] = len

      len += this.__integral.eval2(this.__integrand, 0.3, 0.4, 8)
      arcLen[3] = len

      len += this.__integral.eval2(this.__integrand, 0.4, 0.5, 8)
      arcLen[4] = len

      len += this.__integral.eval2(this.__integrand, 0.5, 0.6, 8)
      arcLen[5] = len

      len += this.__integral.eval2(this.__integrand, 0.6, 0.7, 8)
      arcLen[6] = len

      len += this.__integral.eval2(this.__integrand, 0.7, 0.8, 8)
      arcLen[7] = len

      len += this.__integral.eval2(this.__integrand, 0.8, 0.9, 8)
      arcLen[8] = len

      len += this.__integral.eval2(this.__integrand, 0.9, 1.0, 8)
      arcLen[9] = len

      var normalize = 1.0 / len

      // x-coordinate of spline knot is normalized arc-length, y-coordinate is t-value for uniform parameterization
      this.__spline.addControlPoint(0.0, 0.0)

      var l = arcLen[0] * normalize
      this.__spline.addControlPoint(l, 0.1)

      l = arcLen[1] * normalize
      this.__spline.addControlPoint(l, 0.2)

      l = arcLen[2] * normalize
      this.__spline.addControlPoint(l, 0.3)

      l = arcLen[3] * normalize
      this.__spline.addControlPoint(l, 0.4)

      l = arcLen[4] * normalize
      this.__spline.addControlPoint(l, 0.5)

      l = arcLen[5] * normalize
      this.__spline.addControlPoint(l, 0.6)

      l = arcLen[6] * normalize
      this.__spline.addControlPoint(l, 0.7)

      l = arcLen[7] * normalize
      this.__spline.addControlPoint(l, 0.8)

      l = arcLen[8] * normalize
      this.__spline.addControlPoint(l, 0.9)

      // last control point, t=1, normalized arc-length = 1
      this.__spline.addControlPoint(1.0, 1.0)
    }
  }

  // assign the t-parameter for this evaluation
  __setParam (_t) {
    var t = (_t < 0) ? 0 : _t
    t = (t > 1) ? 1 : t

    // if arc-length parameterization, approximate L^-1(s)
    if (this.__param == Consts.ARC_LENGTH) {
      if (t != this.__s) {
        this.__t = this.__spline.eval2(t)
        this.__s = t
      }
    } else {
      if (t != this.__t) { this.__t = t }
    }
  }

  toString () {
    return this.constructor.name
  }

  // Pseudo-abstract methods should be implemented in subclass

  getParam (_seg) { throw new Error('Parametric::getParam() must be overriden') }

  addControlPoint (_xCoord, _yCoord) { throw new Error('Parametric::addControlPoint() must be overriden') }

  moveControlPoint (_indx, _newX, _newY) { throw new Error('Parametric::moveControlPoint() must be overriden') }

  getControlPoint (_indx) { throw new Error('Parametric::getControlPoint() must be overriden') }

  draw (_t) { throw new Error('Parametric::draw() must be overriden') }

  reColor (_c) { throw new Error('Parametric::reColor() must be overriden') }

  reDraw () { throw new Error('Parametric::reDraw() must be overriden') }

  reset () { throw new Error('Parametric::reset() must be overriden') }

  getX (_t) { throw new Error('Parametric::getX() must be overriden') }

  getY (_t) { throw new Error('Parametric::getY() must be overriden') }

  getXPrime (_t) { throw new Error('Parametric::getXPrime() must be overriden') }

  getYPrime (_t) { throw new Error('Parametric::getYPrime() must be overriden') }

  interpolate (_points) { throw new Error('Parametric::interpolate() must be overriden') }

  __computeCoef () { throw new Error('Parametric::__computeCoef() must be overriden') }

  tAtMinX () { throw new Error('Parametric::tAtMinX() not implemented in this Class') }

  tAtMinY () { throw new Error('Parametric::tAtMinY() not implemented in this Class') }

  tAtMaxX () { throw new Error('Parametric::tAtMaxX() not implemented in this Class') }

  tAtMaxY () { throw new Error('Parametric::tAtMaxY() not implemented in this Class') }
}
