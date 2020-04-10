//
// BezierUtils.as - A small collection of static utilities for use with single-segment Bezier curves, or more generally
// any curve implementing the IParametric interface
//
// copyright (c) 2006-2008, Jim Armstrong.  All Rights Reserved.
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
// Version 1.0
//

import Point from './Point'

export default class BezierUtils {
  constructor () {
    this.MAX_DEPTH = 64 // maximum recursion depth
    this.EPSILON = 1.0 * Math.pow(2, -this.MAX_DEPTH - 1) // flatness tolerance

    this.Z_CUBIC = [1.0, 0.6, 0.3, 0.1, 0.4, 0.6, 0.6, 0.4, 0.1, 0.3, 0.6, 1.0]
    this.Z_QUAD = [1.0, 2 / 3, 1 / 3, 1 / 3, 2 / 3, 1.0]

    this.__dMinimum = 0
  }

  /**
* minDistance():Number [get] access the minimum distance
*
* @return Number mimimum distance from specified point to point on the Bezier curve.  Call after <code>closestPointToBezier()</code>.
*
* @since 1.0
*
*/
  get minDistance () {
    return this.__dMinimum
  }

  /**
* closestPointToBezier( _curve:IParametric, _p:Point ):Number
*
* @param _curve:IParametric reference (must be Bezier2 or Bezier3) to a Bezier curve
* @param _p:Point reference to <code>Point</code> to which the closest point on the Bezier curve is desired
*
* @return Number t-parameter of the closest point on the parametric curve.  The <code>getX</code> and <code>getY</code> methods may be called to
* return the (x,y) coordinates on the curve at that t-value.  Returns 0 if the input is <code>null</code> or not a reference to a Bezier curve.
*
* This code is derived from the Graphic Gem, "Solving the Nearest-Point-On-Curve Problem", by P.J. Schneider, published in 'Graphic Gems',
* A.S. Glassner, ed., Academic Press, Boston, 1990, pp. 607-611.
*
* @since 1.0
*
*/
  closestPointToBezier (_curve, _p) {
    if (_curve == null) {
      	return 0
    }

    // tbd - dispatch a warning event in this instance
    if (!(_curve instanceof Bezier2) && !(_curve instanceof Bezier3)) {
      	return 0
    }

    // record distances from point to endpoints
    let x0 = _curve.getX(0)
    let y0 = _curve.getY(0)
    let deltaX = x0 - _p.x
    let deltaY = y0 - _p.y
    let d0 = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    let x1 = _curve.getX(1)
    let y1 = _curve.getY(1)
    deltaX = x1 - _p.x
    deltaY = y1 - _p.y
    let d1 = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    let n = _curve.degree // degree of input Bezier curve

    // array of control points
    var v = []
    for (let i = 0; i <= n; ++i) {
      	v.push(_curve.getControlPoint(i))
    }

    // instaead of power form, convert the function whose zeros are required to Bezier form
    var w = this.toBezierForm(_p, v)

    // Find roots of the Bezier curve with control points stored in 'w' (algorithm is recursive, this is root depth of 0)
    var roots = this.findRoots(w, 2 * n - 1, 0)

    // compare the candidate distances to the endpoints and declare a winner :)
    if (d0 < d1) {
      	var tMinimum = 0
      	this.__dMinimum = d0
    } else {
      	tMinimum = 1
      	this.__dMinimum = d1
    }

    // tbd - compare 2-norm squared
    for (let i = 0; i < roots.length; ++i) {
      	let t = roots[i]
      	if (t >= 0 && t <= 1) {
      	  deltaX = _curve.getX(t) - _p.x
      	  deltaY = _curve.getY(t) - _p.y
      	  var d = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      	  if (d < this.__dMinimum) {
      	    tMinimum = t
      	    this.__dMinimum = d
      	  }
      	}
    }

    // tbd - alternate optima.
    return tMinimum
  }

  // compute control points of the polynomial resulting from the inner product of B(t)-P and B'(t), constructing the result as a Bezier
  // curve of order 2n-1, where n is the degree of B(t).
  toBezierForm (_p, _v) {
    let row = 0 // row index
    let column = 0	// column index

    let c = [] // V(i) - P
    let d = [] // V(i+1) - V(i)
    let w = [] // control-points for Bezier curve whose zeros represent candidates for closest point to the input parametric curve

    let n = _v.length - 1 // degree of B(t)
    let degree = 2 * n - 1 // degree of B(t) . P

    let pX = _p.x
    let pY = _p.y

    for (let i = 0; i <= n; ++i) {
      let v = _v[i]
      c[i] = new Point(v.x - pX, v.y - pY)
    }

    let s = n
    for (let i = 0; i <= n - 1; ++i) {
      	let v = _v[i]
      	let v1 = _v[i + 1]
      	d[i] = new Point(s * (v1.x - v.x), s * (v1.y - v.y))
    }

    let cd = []

    // inner product table
    for (row = 0; row <= n - 1; ++row) {
      	var di = d[row]
      	var dX = di.x
      	var dY = di.y

      	for (let col = 0; col <= n; ++col) {
      	  let k = this.getLinearIndex(n + 1, row, col)
      	  cd[k] = dX * c[col].x + dY * c[col].y
      	  k++
      	}
    }

    // Bezier is uniform parameterized
    let dInv = 1.0 / degree
    for (let i = 0; i <= degree; ++i) {
      	w[i] = new Point(i * dInv, 0)
    }

    // reference to appropriate pre-computed coefficients
    let z = n == 3 ? this.Z_CUBIC : this.Z_QUAD

    // accumulate y-coords of the control points along the skew diagonal of the (n-1) x n matrix of c.d and z values
    let m = n - 1
    for (let k = 0; k <= n + m; ++k) {
      let lb = Math.max(0, k - m)
      let ub = Math.min(k, n)
      for (let i = lb; i <= ub; ++i) {
        let j = k - i
        let p = w[i + j]
        let index = this.getLinearIndex(n + 1, j, i)
        p.y += cd[index] * z[index]
        w[i + j] = p
      }
    }

    return w
  }

  // convert 2D array indices in a k x n matrix to a linear index (this is an interim step ahead of a future implementation optimized for 1D array indexing)
  getLinearIndex (_n, _row, _col) {
    // no range-checking; you break it ... you buy it!
    return _row * _n + _col
  }

  // how many times does the Bezier curve cross the horizontal axis - the number of roots is less than or equal to this count
  crossingCount (_v, _degree) {
    let nCrossings = 0
    let sign = _v[0].y < 0 ? -1 : 1
    let oldSign = sign
    for (let i = 1; i <= _degree; ++i) {
      sign = _v[i].y < 0 ? -1 : 1
      if (sign != oldSign) { nCrossings++ }

      oldSign = sign
    }

    return nCrossings
  }

  // is the control polygon for a Bezier curve suitably linear for subdivision to terminate?
  isControlPolygonLinear (_v, _degree) {
    // Given array of control points, _v, find the distance from each interior control point to line connecting v[0] and v[degree]

    // implicit equation for line connecting first and last control points
    let a = _v[0].y - _v[_degree].y
    let b = _v[_degree].x - _v[0].x
    let c = _v[0].x * _v[_degree].y - _v[_degree].x * _v[0].y

    let abSquared = a * a + b * b
    let distance = [] // Distances from control points to line

    for (let i = 1; i < _degree; ++i) {
      // Compute distance from each of the points to that line
      distance[i] = a * _v[i].x + b * _v[i].y + c
      if (distance[i] > 0.0) {
        distance[i] = (distance[i] * distance[i]) / abSquared
      }
      if (distance[i] < 0.0) {
        distance[i] = -((distance[i] * distance[i]) / abSquared)
      }
    }

    // Find the largest distance
    let maxDistanceAbove = 0.0
    let maxDistanceBelow = 0.0
    for (let i = 1; i < _degree; ++i) {
      if (distance[i] < 0.0) {
        maxDistanceBelow = Math.min(maxDistanceBelow, distance[i])
      }
      if (distance[i] > 0.0) {
        maxDistanceAbove = Math.max(maxDistanceAbove, distance[i])
      }
    }

    // Implicit equation for zero line
    let a1 = 0.0
    let b1 = 1.0
    let c1 = 0.0

    // Implicit equation for "above" line
    let a2 = a
    let b2 = b
    let c2 = c + maxDistanceAbove

    let det = a1 * b2 - a2 * b1
    let dInv = 1.0 / det

    let intercept1 = (b1 * c2 - b2 * c1) * dInv

    //  Implicit equation for "below" line
    a2 = a
    b2 = b
    c2 = c + maxDistanceBelow

    let intercept2 = (b1 * c2 - b2 * c1) * dInv

    // Compute intercepts of bounding box
    let leftIntercept = Math.min(intercept1, intercept2)
    let rightIntercept = Math.max(intercept1, intercept2)

    let error = 0.5 * (rightIntercept - leftIntercept)

    return error < this.EPSILON
  }

  // compute intersection of line segnet from first to last control point with horizontal axis
  computeXIntercept (_v, _degree) {
    let XNM = _v[_degree].x - _v[0].x
    let YNM = _v[_degree].y - _v[0].y
    let XMK = _v[0].x
    let YMK = _v[0].y

    let detInv = -1.0 / YNM

    return (XNM * YMK - YNM * XMK) * detInv
  }

  // return roots in [0,1] of a polynomial in Bernstein-Bezier form
  findRoots (_w, _degree, _depth) {
    let t = [] // t-values of roots
    let m = 2 * _degree - 1

    switch (this.crossingCount(_w, _degree)) {
      case 0:
        return []
        break
      case 1:
        // Unique solution - stop recursion when the tree is deep enough (return 1 solution at midpoint)
        if (_depth >= this.MAX_DEPTH) {
          t[0] = 0.5 * (_w[0].x + _w[m].x)
          return t
        }

        if (this.isControlPolygonLinear(_w, _degree)) {
          t[0] = this.computeXIntercept(_w, _degree)
          return t
        }
        break
    }

    // Otherwise, solve recursively after subdividing control polygon
    let left = []
    let right = []

    // child solutions

    this.subdivide(_w, 0.5, left, right)
    let leftT = this.findRoots(left, _degree, _depth + 1)
    let rightT = this.findRoots(right, _degree, _depth + 1)

    // Gather solutions together
    for (let i = 0; i < leftT.length; ++i) { t[i] = leftT[i] }

    for (let i = 0; i < rightT.length; ++i) { t[i + leftT.length] = rightT[i] }

    return t
  }

  /**
* subdivide( _c:Array, _t:Number, _left:Array, _right:Array ) - deCasteljau subdivision of an arbitrary-order Bezier curve
*
* @param _c:Array array of control points for the Bezier curve
* @param _t:Number t-parameter at which the curve is subdivided (must be in (0,1) = no check at this point
* @param _left:Array reference to an array in which the control points, <code>Array</code> of <code>Point</code> references, of the left control cage after subdivision are stored
* @param _right:Array reference to an array in which the control points, <code>Array</code> of <code>Point</code> references, of the right control cage after subdivision are stored
* @return nothing
*
* @since 1.0
*
*/
  subdivide (_c, _t, _left, _right) {
    let degree = _c.length - 1
    let n = degree + 1
    let p = _c.slice()
    let t1 = 1.0 - _t

    for (let i = 1; i <= degree; ++i) {
      for (let j = 0; j <= degree - i; ++j) {
        let vertex = new Point()
        let ij = getLinearIndex(n, i, j)
        let im1j = getLinearIndex(n, i - 1, j)
        let im1jp1 = getLinearIndex(n, i - 1, j + 1)

        vertex.x = t1 * p[im1j].x + _t * p[im1jp1].x
        vertex.y = t1 * p[im1j].y + _t * p[im1jp1].y
        p[ij] = vertex
      }
    }

    for (let j = 0; j <= degree; ++j) {
      let index = this.getLinearIndex(n, j, 0)
      _left[j] = p[index]
    }

    for (let j = 0; j <= degree; ++j) {
      	let index = this.getLinearIndex(n, degree - j, j)
      _right[j] = p[index]
    }
  }
}
