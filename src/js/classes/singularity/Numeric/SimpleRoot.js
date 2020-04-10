/**
* <p>SimpleRoot.as - A straight port of Jack Crenshaw's TWBRF method for simple roots in an interval.  To use, identify an interval in which
* the function whose zero is desired has a sign change (via bisection, for example).  Call the <code>findRoot</code> method.</p>
*
* Copyright (c) 2008, Jim Armstrong.  All rights reserved.
*
* This software program is supplied 'as is' without any warranty, express,
* implied, or otherwise, including without limitation all warranties of
* merchantability or fitness for a particular purpose.  Jim Armstrong shall not
* be liable for any special incidental, or consequential damages, including,
* witout limitation, lost revenues, lost profits, or loss of prospective
* economic advantage, resulting from the use or misuse of this software program.
*
* @author Jim Armstrong, singularity (www.algorithmist.net)
*
* @version 1.0
*/

import EventDispatcher from '../../nuke/utils/EventDispatcher'
import SingularityEvent from '../Events/SingularityEvent'

export default class SimpleRoot extends EventDispatcher {
  static get TOL () { return 0.000001 };
  static get MAX_ITER () { return 100 };

  constructor () {
    super(SingularityEvent.ALL_EVENTS)

    this.__iter = 0
  }

  get iterations () { return this.__iter }

  /**
* <code>findRoot</code> finds a single root given an interval
*
* @param _x0 root isolated in interval [_x0, _x2]
* @param _x2 root isolated in interval [_x0, _x2]
* @param _f reference to function whose root in the interval is desired.  Function accepts a single <code>Number</code> argument.
* @param _imax maximum number of iterations
* @default MAX_ITER
* @param _eps tolerance value for root
* @default TOL
*
* @since 1.0
*
* @return Number: Approximation of desired root within specified tolerance and iteration limit.  In addition to too small
* an iteration limit or too tight a tolerance, some patholotical numerical conditions exist under which the method may
* incorrectly report a root.
*
*/
  findRoot (_x0, _x2, _f, _imax = SimpleRoot.MAX_ITER, _eps = SimpleRoot.TOL) {
    let x0
    let x1
    let x2
    let y0
    let y1
    let y2
    let b
    let c
    let y10
    let y20
    let y21
    let xm
    let ym
    let temp


    let xmlast = _x0
    y0 = _f(_x0)

    if (y0 == 0.0) { return _x0 }

    y2 = _f(_x2)
    if (y2 == 0.0) { return _x2 }

    console.log("czekujemy|", y2 , y0 , _f )

    if (y2 * y0 > 0.0) {
      //console.error('Invalid interval - no sign change - no root')
      return _x0
    }

    this.__iter = 0
    x0 = _x0
    x2 = _x2
    for (let i = 0; i < _imax; ++i) {
      this.__iter++

      x1 = 0.5 * (x2 + x0)
      y1 = _f(x1)
      if (y1 == 0.0) { return x1 }

      if (Math.abs(x1 - x0) < _eps) { return x1 }

      if (y1 * y0 > 0.0) {
        temp = x0
        x0 = x2
        x2 = temp
        temp = y0
        y0 = y2
        y2 = temp
      }

      y10 = y1 - y0
      y21 = y2 - y1
      y20 = y2 - y0
      if (y2 * y20 < 2.0 * y1 * y10) {
        x2 = x1
        y2 = y1
      } else {
        b = (x1 - x0) / y10
        c = (y10 - y21) / (y21 * y20)
        xm = x0 - b * y0 * (1.0 - c * y1)
        ym = _f(xm)
        if (ym == 0.0) { return xm }

        if (Math.abs(xm - xmlast) < _eps) { return xm }

        xmlast = xm
        if (ym * y0 < 0.0) {
          x2 = xm
          y2 = ym
        } else {
          x0 = xm
          y0 = ym
          x2 = x1
          y2 = y1
        }
      }
    }

    //console.error('Invalid interval - no sign change - no root')
    return x1
  }
}
