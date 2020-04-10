//
// Bezier3.as - Generate cubic Bezier curve given four control points.  Curve evaluation using
// nested multiplication.  This version supports plotting via recursive subdivision, however the
// implementation is intended for *illustration* of a 'textbook' successive midpoint approximation --
// this class is NOT coded for performance.
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
// Note:  Set the container reference before calling any drawing methods
//
// Version 1.1 - Added Bezier y-at-x method
//         1.2 - New Parametric methods and updated for arc-length parameterization
//

import Point from '../Utils/Point'
import Consts from '../Numeric/Consts'
import Parametric from './Parametric'
import Cubic from './Cubic'
import Solve2x2 from '../Numeric/Solve2x2'
import SimpleRoot from '../Numeric/SimpleRoot'

export default class Bezier3 extends Parametric {
/**
* @description 	Method: Bezier3() - Construct a new Bezier3 instance
*
* @return Nothing
*
* @since 1.0
*
*/
  constructor () {
    super()
    // properties
    this.FIT = 1 // fitness metric for stopping subdivision -- ranges from 1-10.  1 = very tight fit.  10 = very loose fit.

    // core
    this.__p0X = 0 // x-coordinate, first control point
    this.__p0Y = 0 // y-coordinate, first control point
    this.__p1X = 0 // x-coordinate, second control point
    this.__p1Y = 0 // y-coordinate, second control point
    this.__p2X = 0 // x-coordinate, third control point
    this.__p2Y = 0 // y-coordinate, third control point
    this.__p3X = 0 // x-coordinate, fourth control point
    this.__p3Y = 0 // y-coordinate, fourth control point

    // subdivisions
    this.__cubicCage = [] // each element contains an array of four control points, describing the subdivided cage
    this.__distSQ = [] // tolerance (1-10) maps into this distance squared scale
    this.__isTol = [] // true if the ith segment is within tolerance
    this.__numSeg = 1 // number of cubic segments making up the complete curve
    this.__pX = 0 // x-coordinate of 'intersection' point of quad control cage
    this.__pY = 0 // y-coordinate of 'intersection' point of quad control cage
    // root-finding (y at x)

    this.__root = null
    this.__left = 0
    this.__right = 0
    this.__bisectIter = 0
    this.__bisectLimit = 0

    // four-point interpolation
    this.__t1 = 0
    this.__t2 = 0
    this.__solver = null

    this.__coef = new Cubic()
    this.__invalidate = true

    this.__distSQ[0] = 4
    this.__distSQ[1] = 9
    this.__distSQ[2] = 16
    this.__distSQ[3] = 25
    this.__distSQ[4] = 36
    this.__distSQ[5] = 49
    this.__distSQ[6] = 64
    this.__distSQ[7] = 81
    this.__distSQ[8] = 121
    this.__distSQ[9] = 144

    this.__tolerance = this.__distSQ[this.FIT - 1] // actual tolerance on distance squared between quad(0.5) and cubic(0.5)
    this.__error.classname = 'Bezier3'
  }

  /**
* @description 	Method: addControlPoint( _xCoord, _yCoord ) - Add a control point
*
* @param _xCoord - control point, x-coordinate
* @param _yCoord - control point, y-coordinate
*
* @return Nothing - Adds control points in order called up to two four.  Attempt to add more than
* the required number of control points results in an error.
*
* @since 1.0
*
*/
  addControlPoint (_xCoord, _yCoord) {
    if (this.__count == 4) {
      this.__error.methodname = 'addControlPoint()'
      this.__error.message = 'Point limit exceeded'
      this.emit(this.__error.errType, this.__error)
      return
    }

    switch (this.__count) {
      case 0 :
        this.__p0X = _xCoord
        this.__p0Y = _yCoord
        this.__count++
        break

      case 1 :
        this.__p1X = _xCoord
        this.__p1Y = _yCoord
        this.__count++
        break

      case 2 :
        this.__p2X = _xCoord
        this.__p2Y = _yCoord
        this.__count++
        break

      case 3 :
        this.__p3X = _xCoord
        this.__p3Y = _yCoord
        this.__count++
        break
    }
    this.__invalidate = true
  }

  /**
* @description 	Method: moveControlPoint(_indx, _newX, _newY) - Move a control point
*
* @param _indx - Index of control point (0, 1, 2, or 3)
* @param _newX - New x-coordinate
* @param _newY - New y-coordinate
*
* @return Nothing
*
* @since 1.0
*
*/
  moveControlPoint (_indx, _newX, _newY) {
    this.__error.methodname = 'moveControlPoint()'

    if (_indx < 0 || _indx > 3) {
      this.__error.message = 'Invalid index: ' + _indx.toString()
      this.emit(this.__error.errType, this.__error)
      return
    }

    if (isNaN(_newX)) {
      this.__error.message = 'Invalid x-coordinate.'
      this.emit(this.__error.errType, this.__error)
      return
    }

    if (isNaN(_newY)) {
      this.__error.message = 'Invalid y-coordinate.'
      this.emit(this.__error.errType, this.__error)
      return
    }

    switch (_indx) {
      case 0 :
        this.__p0X = _newX
        this.__p0Y = _newY
        break

      case 1 :
        this.__p1X = _newX
        this.__p1Y = _newY
        break

      case 2 :
        this.__p2X = _newX
        this.__p2Y = _newY
        break

      case 3 :
        this.__p3X = _newX
        this.__p3Y = _newY
        break
    }

    this.__invalidate = true
    this.__resetSubdiv()
  }

  /**
* @description 	Method: getControlPoint(_indx) - accesss the specified control point
*
* @param _indx - Index of control point (0, 1, 2, or 3)
*
* @return Point reference to a <code>Point</code> representing the control vertex or (0,0) if the index is out of range for a cubic curve
*
* @since 1.2
*
*/
  getControlPoint (_indx) {
    switch (_indx) {
      case 0:
        return new Point(this.__p0X, this.__p0Y)
        break

      case 1:
        return new Point(this.__p1X, this.__p1Y)
        break

      case 2:
        return new Point(this.__p2X, this.__p2Y)
        break

      case 3:
        return new Point(this.__p3X, this.__p3Y)
        break
    }

    return new Point(0, 0)
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
    this.__p0X = 0
    this.__p0Y = 0
    this.__p1X = 0
    this.__p1Y = 0
    this.__p2X = 0
    this.__p2Y = 0
    this.__p3X = 0
    this.__p3Y = 0
    this.__t1 = 0
    this.__t2 = 0

    this.__invalidate = true
    this.__count = 0

    this.__coef.reset()
    this.__resetSubdiv()
  }

  /**
* @description 	Method: getX( _t ) - Return x-coordinate for a given t
*
* @param _t - parameter value in [0,1]
*
* @return Number: x-coordinate of cubic Bezier curve provided input is in [0,1], otherwise return B(0) or B(1).
*
* @since 1.2
*
*/
  getX (_t) {
    let t = _t
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t

    if (this.__invalidate) this.__computeCoef()

    this.__setParam(t)
    return this.__coef.getX(__t)
  }

  /**
* @description 	Method: getY( _t ) - Return y-coordinate for a given t
*
* @param _t - parameter value in [0,1]
*
* @return Number: y-coordinate of cubic Bezier curve provided input is in [0,1], otherwise return B(0) or B(1).
*
* @since 1.2
*
*/
  getY (_t) {
    let t = _t
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t

    if (this.__invalidate) this.__computeCoef()

    this.__setParam(t)
    return this.__coef.getY(this.__t)
  }

  /**
* @description 	Method: getXPrime( _t ) - Return x-coordinate of first deriviative for a given t
*
* @param _t - parameter value in [0,1]
*
* @return Number: x-coordinate of first derivative of cubic bezier.
*
* @since 1.2
*
*/
  getXPrime (_t) {
    let t = _t
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t

    if (this.__invalidate) this.__computeCoef()

    return this.__coef.getXPrime(t)
  }

  /**
* @description 	Method: getYPrime( _t ) - Return y-coordinate of first derivative for a given t
*
* @param _t - parameter value in [0,1]
*
* @return Number: y-coordinate of first derivative of cubic Bezier.
*
* @since 1.2
*
*/
  getYPrime (_t) {
    let t = _t
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t

    if (this.__invalidate) this.__computeCoef()

    return this.__coef.getYPrime(t)
  }

  /**
* @description 	Method: draw(_t) - Draw the cubic Bezier up to the specified parameter
*
* @param _t - parameter value in [0,1]
*
* @return Nothing - cubic curve is plotted from t=0 to t=_t.
*
* @since 1.0
*
*/
  /*draw (_t) {
    if (_t <= 0 || _t > 1) {} else if (_t < 1)
    // this will be made more efficient in the future
    { this.__linePlot(_t) } else {
      	if (this.__invalidate) { this.__computeCoef() }

      // The following could be implemented with recursive calls in Flash, but serves to illustrate the process in
      // an easy to understand, if less elegant manner.  There is also (traditionally) a lot of overhead to
      // implement recursive calls at runtime in any programming language.
      let finished = false

      // compute tolerance based on current user-specified fit
      let __fit = Math.max(1, this.FIT)
      __fit = Math.min(10, __fit)
      this.__tolerance = this.__distSQ[__fit - 1]

      // You could add a segment counter to prohibit too many iterations
      while (!finished) {
        // test each segment
        finished = true
        for (let i = 0; i < this.__numSeg; ++i) {
          let knots = this.__cubicCage[i]
          this.__intersect(knots)
          if (this.__numSeg == 1) {
            // force at least one subdivision
            this.__isTol[i] = false
            finished = false
          } else {
            this.__isTol[i] = (this.__midpointDeltaSq(knots) <= this.__tolerance)
            finished = finished && this.__isTol[i]
          }
        }

        if (!finished) {
          let segs = this.__numSeg
          let j = 0
          for (let i = 0; i < segs; ++i) {
            if (!this.__isTol[j]) {
              this.__subdivide(0.5, j + 1)
              j += 2
            } else { j++ }
          }
        }
      }

      this.__plot()
    }
  }*/

  /**
* @description 	Method: arcLength() - Return arc-length of the *entire* curve by numerical integration
*
* @return Number: Estimate of total arc length of the curve
*
* @since 1.0
*
*/
  arcLength () {
    if (this.__invalidate) { this.__computeCoef() }

    return this.__integral.eval2(this.__integrand, 0, 1, 5)
  }

  /**
* @description 	Method: interpolate( _points ) - Compute control points so that cubic Bezier passes through four points
*
* @param _points - array of three Objects with x- and y-coordinates in .X and .Y properties.  These points represent the coordinates of the interpolation points.
*
* @return Nothing
*
* @since 1.0
*
*/
  interpolate (_points) {
    // no error-checking ... you break it, you buy it.
    let p0 = _points[0]
    this.__p0X = p0.X
    this.__p0Y = p0.Y

    let p1 = _points[1]
    let p2 = _points[2]

    let p3 = _points[3]
    this.__p3X = p3.X
    this.__p3Y = p3.Y

    // currently, this method auto-parameterizes the curve using chord-length parameterization.  A future version might allow inputting the two t-values, but this is more
    // user-friendly (what an over-used term :)  As an exercise, try uniform parameterization - t1 = 13/ and 52 = 2/3.
    let deltaX = p1.X - p0.X
    let deltaY = p1.Y - p0.Y
    let d1 = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    deltaX = p2.X - p1.X
    deltaY = p2.Y - p1.Y
    let d2 = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    deltaX = p3.X - p2.X
    deltaY = p3.Y - p2.Y
    let d3 = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    let d = d1 + d2 + d3
    this.__t1 = d1 / d
    this.__t2 = (d1 + d2) / d

    // there are four unknowns (x- and y-coords for P1 and P2), which are solved as two separate sets of two equations in two unknowns
    let t12 = this.__t1 * this.__t1
    let t13 = this.__t1 * t12

    let t22 = this.__t2 * this.__t2
    let t23 = this.__t2 * t22

    // x-coordinates of P1 and P2 (t = t1 and t2) - exercise: eliminate redudant computations in these equations
    let a11 = 3 * t13 - 6 * t12 + 3 * this.__t1
    let a12 = -3 * t13 + 3 * t12
    let a21 = 3 * t23 - 6 * t22 + 3 * this.__t2
    let a22 = -3 * t23 + 3 * t22

    let b1 = -t13 * this.__p3X + this.__p0X * (t13 - 3 * t12 + 3 * this.__t1 - 1) + p1.X
    let b2 = -t23 * this.__p3X + this.__p0X * (t23 - 3 * t22 + 3 * this.__t2 - 1) + p2.X

    if (this.__solver == null) {
      this.__solver = new Solve2x2()
    }

    // exercise - handle situation where determinant is less than or equal to zero tolerance - what happens with nearly or exactly coincident
    // interior interpolation points?
    let p = this.__solver.solve(a11, a12, a21, a22, b1, b2)
    this.__p1X = p.x
    this.__p2X = p.y

    // y-coordinates of P1 and P2 (t = t1 and t2)
    b1 = -t13 * this.__p3Y + this.__p0Y * (t13 - 3 * t12 + 3 * this.__t1 - 1) + p1.Y
    b2 = -t23 * this.__p3Y + this.__p0Y * (t23 - 3 * t22 + 3 * this.__t2 - 1) + p2.Y

    // resolving with same coefficients, but new RHS
    p = this.__solver.solve(a11, a12, a21, a22, b1, b2, 0.00001, true)
    this.__p1Y = p.x
    this.__p2Y = p.y

    this.__invalidate = true
    this.__count = 4
  }

  getParam (_seg) {
    switch (_seg) {
      case 1:
        return this.__t1
        break
      case 2:
        return this.__t2
        break
      default:
        return 0
    }
  }

  /**
* @description 	Method: yAtX( _x ) - Return the set of y-coordinates corresponding to the input x-coordinate
*
* @param _x x-coordinate at which the desired y-coordinates are desired
*
* @return Array set of (t,y)-coordinates at the input x-coordinate provided that the x-coordinate is inside the range
* covered by the quadratic Bezier in [0,1]; that is there must exist t in [0,1] such that Bx(t) = _x.  If the input
* x-coordinate is not inside the range covered by the Bezier curve, the returned array is empty.  Otherwise, the
* array contains either one or two y-coordinates.  There are issues with curves that are exactly or nearly (for
* numerical purposes) vertical in which there could theoretically be an infinite number of y-coordinates for a single
* x-coordinate.  This method does not work in such cases, although compensation might be added in the future.
*
* Each array element is a reference to an <code>Object</code> whose 't' parameter represents the Bezier t parameter.  The
* <code>Object</code> 'y' property is the corresponding y-value.  The returned (t,y) coordinates may be used by the caller
* to determine which of two returned y-coordinates might be preferred over the other.
*
* @since 1.1
*
*/
  // exercise - make the root-finding tolerance an optional parameter or provide a setter function to allow it to be
  // set by the caller in advance
  yAtX (_x) {
    if (isNaN(_x)) {
      return []
    }

    // the necessary y-coordinates are the intersection of the curve with the line x = _x.  The curve is generated in the
    // form c0 + c1*t + c2*t^2 + c3*t^3, so the intersection satisfies the equation
    // Bx(t) = _x or Bx(t) - _x = 0, or c0x-_x + c1x*t + c2x*t^2 + c3x*t^3 = 0.
    if (this.__invalidate) { this.__computeCoef() }

    // this is written out in individual steps for clarity
    let c0 = this.__coef.getCoef(0)
    let c1 = this.__coef.getCoef(1)
    let c2 = this.__coef.getCoef(2)
    let c3 = this.__coef.getCoef(3)
    let c0X = c0.X
    let c1X = c1.X
    let c2X = c2.X
    let c3X = c3.X

    // Find one root - any root - then factor out (t-r) to get a quadratic poly. for the remaining roots
    var f = function (_t) {
      return _t * (c1X + _t * (c2X + _t * (c3X))) + c0X - _x
    }

    if (this.__root == null) { this.__root = new SimpleRoot() }

    // some curves that loop around on themselves may require bisection
    this.__left = 0
    this.__right = 1
    this.__bisectLimit = 0.05
    this.__bisect(f, this.__left, this.__right)

    // experiment with tolerance - but not too tight :)
    let t0 = this.__root.findRoot(this.__left, this.__right, f, 50, 0.0000001)
    let ev = Math.abs(f(t0))
    if (ev > 0.0000001) { return [] } // compensate in case method quits due to error (no event listener here)

    let result = []
    if (t0 <= 1) { result.push({ t: t0, y: this.getY(t0) }) }

    // Factor theorem: t-r is a factor of the cubic polynomial if r is a root.  Use this to reduce to a quadratic poly.
    // using synthetic division
    let a = c3.X
    let b = t0 * a + c2.X
    let c = t0 * b + c1.X

    // process the quadratic for the remaining two possible roots
    let d = b * b - 4 * a * c
    if (d < 0) {
      return result
    }

    d = Math.sqrt(d)
    a = 1 / (a + a)
    let t1 = (d - b) * a
    let t2 = (-b - d) * a

    if (t1 >= 0 && t1 <= 1) { result.push({ t: t1, y: this.getY(t1) }) }

    if (t2 >= 0 && t2 <= 1) { result.push({ t: t2, y: this.getY(t2) }) }

    return result
  }

  // bisect the specified range to isolate an interval with a root.
  __bisect (_f, _left, _right) {
    if (Math.abs(_right - _left) <= this.__bisectLimit) {
      return
    }

    let left = _left
    let right = _right
    let middle = 0.5 * (left + right)
    if (_f(left) * _f(right) <= 0) {
      this.__left = left
      this.__right = right
    } else {
      this.__bisect(_f, left, middle)
      this.__bisect(_f, middle, right)
    }
  }

  // split the current control cage at t
  __subdivide (_t, _j) {
    let t1 = 1.0 - _t
    let left = [] // left cubic segment
    let right = [] // right cubic segment
    let knots = this.__cubicCage[_j - 1]

    // p1X = knots[0]; p1Y = knots[1]; p2X = knots[2]; p2Y = knots[3]; p3X = knots[4]; p3Y = knots[5]; p4X = knots[6]; p4Y = knots[7]
    left[0] = knots[0]
    left[1] = knots[1]

    let p11X = t1 * knots[0] + _t * knots[2]
    let p11Y = t1 * knots[1] + _t * knots[3]

    let p21X = t1 * knots[2] + _t * knots[4]
    let p21Y = t1 * knots[3] + _t * knots[5]

    let p31X = t1 * knots[4] + _t * knots[6]
    let p31Y = t1 * knots[5] + _t * knots[7]

    let p12X = t1 * p11X + _t * p21X
    let p12Y = t1 * p11Y + _t * p21Y

    let p22X = t1 * p21X + _t * p31X
    let p22Y = t1 * p21Y + _t * p31Y

    let p13X = t1 * p12X + _t * p22X
    let p13Y = t1 * p12Y + _t * p22Y

    left[2] = p11X
    left[3] = p11Y

    left[4] = p12X
    left[5] = p12Y

    left[6] = p13X
    left[7] = p13Y

    right[0] = p13X
    right[1] = p13Y

    right[2] = p22X
    right[3] = p22Y

    right[4] = p31X
    right[5] = p31Y

    right[6] = knots[6]
    right[7] = knots[7]

    if (this.__cubicCage.length == 1) {
      this.__cubicCage[0] = left
      this.__cubicCage[1] = right
    } else {
      delete this.__cubicCage[_j - 1]

      // index _j-1 is overwritten and index _j is inserted
      for (let i = this.__cubicCage.length; i > _j; i--) { this.__cubicCage[i] = this.__cubicCage[i - 1] }

      this.__cubicCage[_j] = right
      this.__cubicCage[_j - 1] = left
    }

    this.__numSeg++
  }

  /* __plot()
    {
      // show complete cubic and quad control cages as well as approximating plot
      let g:Graphics = __container.graphics;
      g.clear();
      g.lineStyle(__thickness, __color);

      for( let i=0; i<this.__numSeg; ++i )
      {
        // plot cubic cage for this segment
        let knots = this.__cubicCage[i];

        // compute middle control point for quad. bezier
        __intersect(knots);

        // quadratic segment
        g.moveTo(knots[0], knots[1]);
        g.curveTo(this.__pX, this.__pY, knots[6], knots[7]);
      }
    } */

  /* __linePlot(_t)
    {
      let p = Math.max(1.0,_t);

      // in the future, this method will be replaced by an initial subdivision at t=_t followed by
      // recursive midpoint subdivision on the left control cage.
      let d = p*this.arcLength();

      let deltaT = 2.0/d;
      let g:Graphics    = __container.graphics;
      g.clear();
      g.lineStyle(__thickness, __color);

      g.moveTo(this.__p0X,this.__p0Y);
      for( let t=deltaT; t<=p; t+=deltaT )
        g.lineTo(getX(t), getY(t));
    } */

  // compute intersection of p0-p1 and p3-p2 segments
  __intersect (_points) {
    let deltaX1 = _points[2] - _points[0]
    let deltaX2 = _points[4] - _points[6]
    let d1Abs = Math.abs(deltaX1)
    let d2Abs = Math.abs(deltaX2)
    let m1 = 0
    let m2 = 0

    if (d1Abs <= Consts.ZERO_TOL) {
      this.__pX = _points[0]
      m2 = (_points[5] - _points[7]) / deltaX2
      this.__pY = (d2Abs <= Consts.ZERO_TOL) ? (_points[0] + 3 * (_points[1] - _points[0])) : (m2 * (_points[0] - _points[6]) + _points[7])
    } else if (d2Abs <= Consts.ZERO_TOL) {
      this.__pX = _points[6]
      m1 = (_points[3] - _points[1]) / deltaX1
      this.__pY = (d1Abs <= Consts.ZERO_TOL) ? (_points[4] + 3 * (_points[4] - _points[6])) : (m1 * (_points[6] - _points[0]) + _points[1])
    } else if (Math.abs(m1) <= Consts.ZERO_TOL && Math.abs(m2) <= Consts.ZERO_TOL) {
      this.__pX = 0.5 * (_points[2] + _points[4])
      this.__pY = 0.5 * (_points[3] + _points[5])
    } else {
      m1 = (_points[3] - _points[1]) / deltaX1
      m2 = (_points[5] - _points[7]) / deltaX2

      if (Math.abs(m1) <= Consts.ZERO_TOL && Math.abs(m2) <= Consts.ZERO_TOL) {
        this.__pX = 0.5 * (_points[0] + _points[6])
        this.__pY = 0.5 * (_points[1] + _points[7])
      } else {
        let b1 = _points[1] - m1 * _points[0]
        let b2 = _points[7] - m2 * _points[6]
        this.__pX = (b2 - b1) / (m1 - m2)
        this.__pY = m1 * this.__pX + b1
      }
    }

    this.__invalidate = true
  }

  // compute square of distance between cubic and quad. segments at t=0.5
  __midpointDeltaSq (_points) {
    // cubic cage at points (_points[0], _points[1]), (_points[2], _points[3]), (_points[4], _points[5]), (_points[6], _points[7])
    // quadratic cage at points (_points[0], _points[1]), (this.__pX, this.__pY), (_points[6], _points[7])

    let deltaX = _points[0] + 4 * this.__pX - 3 * (_points[2] + _points[4]) + _points[6]
    let deltaY = _points[1] + 4 * this.__pY - 3 * (_points[3] + _points[5]) + _points[7]

    return 0.015625 * (deltaX * deltaX + deltaY * deltaY)
  }

  // reset subdivision because control point was moved
  __resetSubdiv () {
    this.__cubicCage.splice(0)
    this.__isTol.splice(0)

    this.__numSeg = 1
  }

  __computeCoef () {
    if (this.__count >= 3) {
      this.__coef.reset()

      this.__coef.addCoef(this.__p0X, this.__p0Y)

      let dX = 3.0 * (this.__p1X - this.__p0X)
      let dY = 3.0 * (this.__p1Y - this.__p0Y)
      this.__coef.addCoef(dX, dY)

      let bX = 3.0 * (this.__p2X - this.__p1X) - dX
      let bY = 3.0 * (this.__p2Y - this.__p1Y) - dY
      this.__coef.addCoef(bX, bY)

      this.__coef.addCoef(this.__p3X - this.__p0X - dX - bX,
        this.__p3Y - this.__p0Y - dY - bY)

      // copy original cage for use in subdivision.
      let c = []
      c[0] = this.__p0X
      c[1] = this.__p0Y
      c[2] = this.__p1X
      c[3] = this.__p1Y
      c[4] = this.__p2X
      c[5] = this.__p2Y
      c[6] = this.__p3X
      c[7] = this.__p3Y

      this.__cubicCage[0] = c

      this.__arcLength = -1
      this.__parameterize()
      this.__invalidate = false
    } else {
      this.__error.methodname = '__computeCoef()'
      this.__error.message = 'Insufficient number of control points'
      this.emit(this.__error.errType, this.__error)
    }
  }
}
