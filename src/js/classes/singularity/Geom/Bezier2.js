//
// Bezier2.as - Quadratic Bezier.
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
// Version 1.1 - added y-at-x method
//

import Quad from './Quad'
import Parametric from './Parametric'
import Point from '../Utils/Point'

export default class Bezier2 extends Parametric {
/**
* @description 	Method: Bezier2() - Construct a new Bezier2 instance
*
* @return Nothing
*
* @since 1.0
*
*/
  constructor () {
    super()

    this.__p0X = 0
    this.__p0Y = 0
    this.__p1X = 0
    this.__p1Y = 0
    this.__p2X = 0
    this.__p2Y = 0

    this.__cX = 0
    this.__cY = 0
    this.__pX = 0
    this.__pY = 0

    this.__error.classname = 'Bezier2'

    this.__coef = new Quad()
    this.__container = null
  }

  toString () {
    let myStr = this.constructor.name + '::'
    myStr += '(' + this.__p0X + ',' + this.__p0Y + '), '
    myStr += '(' + this.__p1X + ',' + this.__p1Y + '), '
    myStr += '(' + this.__p2X + ',' + this.__p2Y + ')'

    return myStr
  }

  /**
* @description 	Method: getParam( _seg:uint ) - Add a control point
*
* @param _xCoord:Number - control point, x-coordinate
* @param _yCoord:Number - control point, y-coordinate
*
* @return uint - Adds control points in order called up to to three
*
* @since 1.0
*
*/
  getParam (_seg) {
    return this.__autoParam
  }

  /**
* @description 	Method: addControlPoint( _xCoord:Number, _yCoord:Number ) - Add a control point
*
* @param _xCoord:Number - control point, x-coordinate
* @param _yCoord:Number - control point, y-coordinate
*
* @return Nothing - Adds control points in order called up to to three
*
* @since 1.0
*
*/
  addControlPoint (_xCoord, _yCoord) {
    if (this.__count == 3) {
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
    }
    this.__invalidate = true
  }

  /**
  * @description 	getControlPointAsObject(_index:uint) - Return an <code>Object</code> containing the x- and y-coordinates of the specified control point
  *
  * @param _index:uint - index of the desired control point, 0, 1, or 2.
  *
  * @return Object - 'X' property contains the x-coordinate of the control point, 'Y' property contains the y-coordinateof the control point.
  *
  * @since 1.0
  *
  * Note:  For performance reasons, no error checking is performed
  *
  */
  getControlPointAsObject (_index) {
    switch (_index) {
      case 0:
        return { X: this.__p0X, Y: this.__p0Y }
        break

      case 1:
        return { X: this.__p1X, Y: this.__p1Y }
        break

      case 2:
        return { X: this.__p2X, Y: this.__p2Y }
        break
    }

    return null
  }

  /**
* @description 	Method: getControlPoint(_indx:uint) - accesss the specified control point
*
* @param _indx:uint - Index of control point (0, 1, 2)
*
* @return Point reference to a <code>Point</code> representing the control vertex or (0,0) if the index is out of range for a quadratic curve
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
    }

    return new Point(0, 0)
  }

  /**
* @description 	Method: moveControlPoint(_indx:uint, _newX:Number, _newY:Number) - Move a control point
*
* @param _indx:Number - Index of control point (0, 1, or 2)
* @param _newX:Number - New x-coordinate
* @param _newY:Number - New y-coordinate
*
* @return Nothing
*
* @since 1.0
*
*/
  moveControlPoint (_indx, _newX, _newY) {
    this.__error.methodname = 'moveControlPoint()'

    if (_indx < 0 || _indx > 2) {
      this.__error.message = 'Invalid index: ' + _indx.toString()
      this.emit(this.__error.errType, this.__error)
      return
    }

    if (isNaN(_newX)) {
      this.__error.message = 'Invalid x-coordinate.'
      this.emit(this.__error.errType, this.error)
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
    }

    this.__invalidate = true
  }

  /**
* @description 	Method: reset() - Reset control points
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
    this.__cX = 0
    this.__cY = 0
    this.__pX = 0
    this.__pY = 0
    this.__count = 0
    this.__autoParam = 0
    this.__arcLength = -1
    this.__invalidate = true

    this.__coef.reset()
  }

  /**
* @description 	Method: draw(_t:Number) - Draw the cubic Bezier using a quadratic approximation, based on subdivision
*
* @param _t:Number - parameter value in [0,1]
*
* @return Nothing - arc is drawn in designated container from t=0 to _t
*
* @since 1.0
*
* Note:  For performance reasons, no error checking is performed
*
*/
  /* draw(_t)
    {
      if( _t == 0 ) return;

      let g = this.__container.graphics;
      g.lineStyle(this.__thickness, this.__color);

      if( _t >= 1 ){
        g.moveTo(this.__p0X, this.__p0Y);
        g.curveTo( this.__p1X, this.__p1Y, this.__p2X, this.__p2Y );
      }else if( _t <= 0 ){
        g.clear();
      }else{
        this.__subdivide(_t);
	      // plot only segment from 0 to _t
	      g.moveTo(this.__p0X, this.__p0Y);
        g.curveTo( this.__cX, this.__cY, this.__pX, this.__pY );
	    }
    } */

  __subdivide (_t) {
    let t1 = 1.0 - _t

    this.__cX = _t * this.__p1X + t1 * this.__p0X
    this.__cY = _t * this.__p1Y + t1 * this.__p0Y

    let p21X = _t * this.__p2X + t1 * this.__p1X
    let p21Y = _t * this.__p2Y + t1 * this.__p1Y

    this.__pX = _t * p21X + t1 * this.__cX
    this.__pY = _t * p21Y + t1 * this.__cY
  }

  /**
* @description 	Method: getX( _t:Number ) - Return x-coordinate for a given t
*
* @param _t:Number - parameter value in [0,1]
*
* @return Number: Value of Quadratic Bezier curve provided input is in [0,1], otherwise return B(0) or B(1).
*
* @since 1.0
*
*/
  getX (_t) {
    let t = _t
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t

    if (this.__invalidate) { this.__computeCoef() }

    this.__setParam(t)
    return this.__coef.getX(this.__t)
  }

  /**
* @description 	Method: getY( _t:Number ) - Return y-coordinate for a given t
*
* @param _t:Number - parameter value in [0,1]
*
* @return Number: Value of Quadratic Bezier curve provided input is in [0,1], otherwise return B(0) or B(1).
*
* @since 1.0
*
*/
  getY (_t) {
    let t = _t
    t = (t < 0) ? 0 : t
    t = (t > 1) ? 1 : t

    if (this.__invalidate) { this.__computeCoef() }

    this.__setParam(t)
    return this.__coef.getY(this.__t)
  }

  /**
* @description 	Method: interpolate( _points:Array ) - Compute control points so that quad. Bezier passes through three points
*
* @param _points:Array - array of three Objects with x- and y-coordinates in .X and .Y properties.  These points represent the coordinates of the interpolation points.
*
* @return Nothing
*
* @since 1.0
*
*/
  interpolate (_points) {
    // compute t-value using chord-length parameterization
    let dX = _points[1].X - _points[0].X
    let dY = _points[1].Y - _points[0].Y
    let d1 = Math.sqrt(dX * dX + dY * dY)
    let d = d1

    dX = _points[2].X - _points[1].X
    dY = _points[2].Y - _points[1].Y
    d += Math.sqrt(dX * dX + dY * dY)

    let t = d1 / d

    let t1 = 1.0 - t
    let tSq = t * t
    let denom = 2.0 * t * t1

    this.__p0X = _points[0].X
    this.__p0Y = _points[0].Y

    this.__p1X = (_points[1].X - t1 * t1 * _points[0].X - tSq * _points[2].X) / denom
    this.__p1Y = (_points[1].Y - t1 * t1 * _points[0].Y - tSq * _points[2].Y) / denom

    this.__p2X = _points[2].X
    this.__p2Y = _points[2].Y

    this.__invalidate = true
    this.__autoParam = t
    this.__count = 2 // make sure count is properly set for coef. generation
  }

  /**
* @description 	Method: tAtMinX() - Return the parameter value at which the x-coordinate is a minimum
*
* @return Nothing - Parameter value in [0,1] at which the curve's x-coordinate is a minimum
*
* @since 1.0
*
*/
  tAtMinX () {
    let tStar = (this.__p0X - this.__p1X) / (this.__p0X - 2 * this.__p1X + this.__p2X)
    let t = 0
    let minX = this.getX(0)

    if (this.getX(1) < minX) {
      t = 1
      minX = this.getX(1)
    }

    if (tStar > 0 && tStar < 1) {
      if (this.getX(tStar) < minX) {
        t = tStar
      }
    }

    return t
  }

  /**
* @description 	Method: tAtMaxX() - Return the parameter value at which the x-coordinate is a maximum
*
* @return Nothing - Parameter value in [0,1] at which the curve's x-coordinate is a maximum
*
* @since 1.0
*
*/
  tAtMaxX () {
    let tStar = (this.__p0X - this.__p1X) / (this.__p0X - 2 * this.__p1X + this.__p2X)
    let t = 0
    let maxX = this.getX(0)

    if (this.getX(1) > maxX) {
      t = 1
      maxX = this.getX(1)
    }

    if (tStar > 0 && tStar < 1) {
      if (this.getX(tStar) > maxX) {
        t = tStar
      }
    }

    return t
  }

  /**
* @description 	Method: tAtMinY() - Return the parameter value at which the y-coordinate is a minimum
*
* @return Nothing - Parameter value in [0,1] at which the curve's y-coordinate is a minimum
*
* @since 1.0
*
*/
  tAtMinY () {
    let tStar = (this.__p0Y - this.__p1Y) / (this.__p0Y - 2 * this.__p1Y + this.__p2Y)
    let t = 0
    let minY = this.getY(0)

    if (this.getY(1) < minY) {
      t = 1
      minY = this.getY(1)
    }

    if (tStar > 0 && tStar < 1) {
      if (this.getY(tStar) < minY) {
        t = tStar
      }
    }

    return t
  }

  /**
* @description 	Method: tAtMaxY() - Return the parameter value at which the y-coordinate is a maximum
*
* @return Nothing - Parameter value in [0,1] at which the curve's y-coordinate is a maximum
*
* @since 1.0
*
*/
  tAtMaxY () {
    let tStar = (this.__p0Y - this.__p1Y) / (this.__p0Y - 2 * this.__p1Y + this.__p2Y)
    let t = 0
    let maxY = this.getY(0)

    if (this.getY(1) > maxY) {
      t = 1
      maxY = this.getY(1)
    }

    if (tStar > 0 && tStar < 1) {
      if (this.getY(tStar) > maxY) {
        t = tStar
      }
    }

    return t
  }

  /**
* @description 	Method: yAtX( _x:Number ) - Return the set of y-coordinates corresponding to the input x-coordinate
*
* @param _x:Number x-coordinate at which the desired y-coordinates are desired
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
  yAtX (_x) {
    if (isNaN(_x)) {
      return []
    }

    // check bounds
    let xMax = this.getX(this.tAtMaxX())
    let xMin = this.getX(this.tAtMinX())

    if (_x < xMin || _x > xMax) {
      return []
    }

    // the necessary y-coordinates are the intersection of the curve with the line x = _x.  The curve is generated in the
    // form c0 + c1*t + c2*t^2, so the intersection satisfies the equation Bx(t) = _x or Bx(t) - _x = 0, or c0x-_x + c1x*t + c2x*t^2 = 0,
    // which is quadratic in t.  I wonder what formula can be used to solve that ????
    if (this.__invalidate) { this.__computeCoef() }

    // this is written out in individual steps for clarity
    let c0 = this.__coef.getCoef(0)
    let c1 = this.__coef.getCoef(1)
    let c2 = this.__coef.getCoef(2)

    let c = c0.X - _x
    let b = c1.X
    let a = c2.X

    let d = b * b - 4 * a * c
    if (d < 0) {
      return []
    }

    d = Math.sqrt(d)
    a = 1 / (a + a)
    let t0 = (d - b) * a
    let t1 = (-b - d) * a

    let result = []
    if (t0 <= 1) { result.push({ t: t0, y: this.getY(t0) }) }

    if (t1 >= 0 && t1 <= 1) { result.push({ t: t1, y: this.getY(t1) }) }

    return result
  }

  __computeCoef () {
  	  if (this.__count < 2) {
  	    this.__error.methodname = '__computeCoef()'
  	    this.__error.message = 'Insufficient number of control points'
  	    this.emit(this.__error.errType, this.__error)
  	  } else {
  	  	this.__coef.reset()
      this.__coef.addCoef(this.__p0X, this.__p0Y)

      this.__coef.addCoef(2.0 * (this.__p1X - this.__p0X), 2.0 * (this.__p1Y - this.__p0Y))

      this.__coef.addCoef(this.__p0X - 2.0 * this.__p1X + this.__p2X, this.__p0Y - 2.0 * this.__p1Y + this.__p2Y)

      this.__invalidate = false
      this.__arcLength = -1
      this.__parameterize()
    }
  }
}
