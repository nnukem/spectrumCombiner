//
// PSpline3.as - Generate parametric cubic splines, x(t) and y(t), t in [0,1], given a set of knots.
//
// Reference:  http://www.algorithmist.net/spline.html
//
// copyright (c) 2005-2007, Jim Armstrong.  All Rights Reserved.
//
// This software program is supplied 'as is' without any warranty, express, implied,
// or otherwise, including without limitation all warranties of merchantability or fitness
// for a particular purpose.  Jim Armstrong shall not be liable for any special incidental, or
// consequential damages, including, without limitation, lost revenues, lost profits, or
// loss of prospective economic advantage, resulting from the use or misuse of this software
// program.
//
//        This code is built around the Spline3 class for clarity.  Additional performance could
//        be gained by merging the Spline3 code and eliminating redundant computations.
//
// Programmed by: Jim Armstrong, singularity (www.algorithmist.net)
//
// Note:  Set the container reference before calling any drawing methods
//

import Spline3 from './Spline3'
import Composite from './Composite'

export default class PSpline3 extends Composite {
/**
* @description 	Method: PSpline3() - Construct a new PSpline3 instance
*
* @return Nothing
*
* @since 1.0
*
*/
  constructor () {
  	super()

    this.__error.classname = 'PSpline3()'

    this.__t = []
    this.__x = []
    this.__y = []
    this.__d = []

    this.__invalidate = true
    this.__knots = 0

    this.__xSpline3 = new Spline3()
    this.__ySpline3 = new Spline3()
  }

  get knotCount () { return this.__knots }

  get chordLength () {
    if (this.__invalidate) { this.__computeKnots() }

    return this.__totalDist
  }

  /**
* @description 	Method: addControlPoint( _xKnot, _yKnot ) - Add a knot (x-y pair)
*
* @param _xKnot - x-coordinate of knot
* @param _yKnot - y-coordinate of knot
*
* @return Nothing
*
* @since 1.0
*
*/
  addControlPoint (_xKnot, _yKnot) {
    this.__error.methodname = 'addControlPoint()'

    if (isNaN(_xKnot)) {
      this.__error.message = 'invalid x-coordinate at knot: ' + (this.__knots + 1)
      this.emit(this.__error.errType, this.__error)
      return
    }

    if (isNaN(_yKnot)) {
      this.__error.message = 'invalid y-coordinate at knot: ' + (this.__knots + 1)
      this.emit(this.__error.errType, this.__error)
      return
    }

    this.__invalidate = true

    this.__x.push(_xKnot)
    this.__y.push(_yKnot)
    this.__knots++
  }

  // remove knot at index
  __remove (_indx) {
    for (let i = _indx; i < this.__knots; ++i) {
      this.__t[i] = this.__t[i + 1]
      this.__x[i] = this.__x[i + 1]
      this.__y[i] = this.__y[i + 1]
      this.__d[i] = this.__d[i + 1]
    }
    this.__t.pop()
    this.__x.pop()
    this.__y.pop()
    this.__d.pop()
    this.__knots--
  }

  /**
* @description 	Method: removeKnotAt( _indx ) - Delete knot at the specified index
*
* @param _indx - index of knot to delete
*
* @return Nothing
*
* @since 1.0
*
*/
  removeKnotAt (_indx) {
    this.__error.methodname = 'removeKnotAt()'

    if (_indx < 0 || _indx >= this.__knots) {
      this.__error.message = 'Index: ' + _indx.toString() + ' is out of range.'
      this.emit(this.__error.errType, this.__error)
      return
    };

    this.__remove(_indx)
    this.__invalidate = true
  }

  /**
* @description 	Method: reset() - Delete all knots from the collection and prepare for new knot input
*
*
* @return Nothing
*
* @since 1.0
*
*/
  reset () {
    this.__t.splice(0)
    this.__x.splice(0)
    this.__y.splice(0)
    this.__d.splice(0)

    this.__xSpline3.deleteAllKnots()
    this.__ySpline3.deleteAllKnots()

    this.__knots = 0
    this.__invalidate = true
  }

  /**
* @description 	Method: moveControlPoint( _i, _xKnot, _yKnot ) - Move the knot at the specified index to a new location
* with new x and y.
*
* @param _i       - Index of knot to replace
* @param _xKnot - x-coordinate of replacement knot
* @param _yKnot - y-coordinate of replacement knot
*
* @return Nothing - If index is valid, knot at that index is overwritten with new (x,y)
*
* @since 1.0
*
*/
  moveControlPoint (_i, _xKnot, _yKnot) {
    this.__error.methodname = 'moveControlPoint()'

    if (_i < 0 || _i > this.__knots - 1) {
      this.__error.message = 'Invalid index: ' + _i.toString()
      this.emit(this.__error.errType, this.__error)
      return
    }

    if (isNaN(_xKnot) || isNaN(_yKnot)) {
      this.__error.message = 'Invalid coordinates'
      this.emit(this.__error.errType, this.__error)
      return
    };

    this.__x[_i] = _xKnot
    this.__y[_i] = _yKnot

	 // this is faster than invalidate and recompute from scratch
    this.__updateKnots(_i)
    this.__invalidate = false
  }

  /**
* @description 	Method: getX( _t ) - Return x-coordinate for a given t
*
* @param _t - parameter value in [0,1]
*
* @return Number: - NaN if there are no knots
*                 - x[0] if there is only one knot
*                 - Spline x-coordinate at the input parameter value, if there are two or more knots
*
* @since 1.0
*
*/
  getX (_t) {
    if (this.__knots == 0) { return NaN } else if (this.__knots == 1) { return this.__x[0] } else {
      if (this.__invalidate) { this.__computeKnots() }

      return this.__xSpline3.eval2(_t)
    }
  }

  /**
* @description 	Method: getY( _t ) - Return y-coordinate for a given t
*
* @param _t - parameter value in [0,1]
*
* @return Number: - NaN if there are no knots
*                 - y[0] if there is only one knot
*                 - Spline y-coordinate at the input parameter value, if there are two or more knots
*
* @since 1.0
*
*/
  getY (_t) {
    if (this.__knots == 0) { return NaN } else if (this.__knots == 1) { return this.__y[0] } else {
      if (this.__invalidate) { this.__computeKnots() }

      return this.__ySpline3.eval2(_t)
    }
  }

  /**
* @description 	Method: draw(_t) - Draw the parametric spline using a point-to-point method
*
* @param _t - parameter value in [0,1] - defaults to entire spline
*
* @return Nothing - arc is drawn in designated container from t=0 to _t
*
* @since 1.0
*
* For performance reasons, error checking is at a minimum -- make sure container is set before calling any
* drawing methods!
*
*/
  /* draw(_t=1.0)
    {
      if( _t == 0 )
        return;

      let p = Math.max(1.0,_t);

      if( this.__invalidate )
        this.__computeKnots();

      let deltaT = 2.0/(p*this.__totalDist);
      let g:Graphics = __container.graphics;
      g.clear();
      g.lineStyle(this.__thickness, __color);

      g.moveTo(this.__x[0],this.__y[0]);
      for( let t=deltaT; t<=p; t+=deltaT )
        g.lineTo(getX(t), getY(t));
    }
*/
  // compute parameter values based on current knots - pass (t,x) and (t,y) onto Spline3 classes
  __computeKnots () {
    this.__totalDist = 0.0
    this.__d[0] = 0.0
    this.__t[0] = 0.0
    for (let i = 1; i < this.__knots; ++i) {
      let dX = this.__x[i] - this.__x[i - 1]
      let dY = this.__y[i] - this.__y[i - 1]
      this.__d[i] = Math.sqrt(dX * dX + dY * dY)
      this.__totalDist += this.__d[i]
    }

    this.__xSpline3.deleteAllKnots()
    this.__ySpline3.deleteAllKnots()

    this.__xSpline3.addControlPoint(0.0, this.__x[0])
    this.__ySpline3.addControlPoint(0.0, this.__y[0])

    let dist = 0.0
    for (let i = 1; i < this.__knots; ++i) {
      // dist measures cumulative (straight-line) distance along knots
      dist += this.__d[i]

      // normalize to [0,1] - chord-length parametrization;
      this.__t[i] = dist / this.__totalDist

      // add knots
      this.__xSpline3.addControlPoint(this.__t[i], this.__x[i])
      this.__ySpline3.addControlPoint(this.__t[i], this.__y[i])
    }

    this.__invalidate = false
  }

  // update parameter values based on changing only a single knot - pass (t,x) and (t,y) onto Spline3 classes
  __updateKnots (_i) {
    // first and last knots affect only one segment
    if (_i == 0) { this.__updateOne(1) } else if (_i == this.__knots - 1) { this.__updateOne(this.__knots - 1) } else {
      this.__updateOne(_i)
      this.__updateOne(_i + 1)
    }

    // recompute this.__t
    this.__recomputeT()

    this.__xSpline3.moveControlPoint(_i, this.__t[_i], this.__x[_i])
    this.__ySpline3.moveControlPoint(_i, this.__t[_i], this.__y[_i])
  }

  __updateOne (_i) {
    this.__totalDist -= this.__d[_i]
    let xD = this.__x[_i] - this.__x[_i - 1]
    let yD = this.__y[_i] - this.__y[_i - 1]
    this.__d[_i] = Math.sqrt(xD * xD + yD * yD)
    this.__totalDist += this.__d[_i]
  }

  __recomputeT () {
    let dist = 0.0
    for (let i = 1; i < this.__knots; ++i) {
      dist += this.__d[i]
      this.__t[i] = dist / this.__totalDist
    }
  }
}
