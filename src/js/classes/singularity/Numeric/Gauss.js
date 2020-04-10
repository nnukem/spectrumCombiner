//
// Gauss.as - Gauss-Legendre Numerical Integration.
//
// copyright (c) 2006-2007, Jim Armstrong.  All Rights Reserved.
//
// This software program is supplied 'as is' without any warranty, express, implied,
// or otherwise, including without limitation all warranties of merchantability or fitness
// for a particular purpose.  Jim Armstrong shall not be liable for any special
// incidental, or consequential damages, including, without limitation, lost
// revenues, lost profits, or loss of prospective economic advantage, resulting
// from the use or misuse of this software program.
//
// Programmed by:  Jim Armstrong, singularity (www.algorithmist.net)
//

import EventDispatcher from '../../nuke/utils/EventDispatcher'
import SingularityEvent from '../Events/SingularityEvent'

export default class Gauss extends EventDispatcher {
  static get MAX_POINTS () { return 8 };

  /**
* @description 	Method: Gauss() - Construct a new Gauss instance
*
* @return Nothing
*
* @since 1.0
*
*/
  constructor () {
    super(SingularityEvent.ALL_EVENTS)

    this.__abscissa = new Array()
    this.__weight = new Array()

    this.__error = new SingularityEvent(SingularityEvent.ERROR)
    this.__error.classname = 'Gauss'

    // N=2
    this.__abscissa.push(-0.5773502692)
    this.__abscissa.push(0.5773502692)

    this.__weight.push(1)
    this.__weight.push(1)

    // N=3
    this.__abscissa.push(-0.7745966692)
    this.__abscissa.push(0.7745966692)
    this.__abscissa.push(0)

    this.__weight.push(0.5555555556)
    this.__weight.push(0.5555555556)
    this.__weight.push(0.8888888888)

    // N=4
    this.__abscissa.push(-0.8611363116)
    this.__abscissa.push(0.8611363116)
    this.__abscissa.push(-0.3399810436)
    this.__abscissa.push(0.3399810436)

    this.__weight.push(0.3478548451)
    this.__weight.push(0.3478548451)
    this.__weight.push(0.6521451549)
    this.__weight.push(0.6521451549)

    // N=5
    this.__abscissa.push(-0.9061798459)
    this.__abscissa.push(0.9061798459)
    this.__abscissa.push(-0.5384693101)
    this.__abscissa.push(0.5384693101)
    this.__abscissa.push(0.0000000000)

    this.__weight.push(0.2369268851)
    this.__weight.push(0.2369268851)
    this.__weight.push(0.4786286705)
    this.__weight.push(0.4786286705)
    this.__weight.push(0.5688888888)

    // N=6
    this.__abscissa.push(-0.9324695142)
    this.__abscissa.push(0.9324695142)
    this.__abscissa.push(-0.6612093865)
    this.__abscissa.push(0.6612093865)
    this.__abscissa.push(-0.2386191861)
    this.__abscissa.push(0.2386191861)

    this.__weight.push(0.1713244924)
    this.__weight.push(0.1713244924)
    this.__weight.push(0.3607615730)
    this.__weight.push(0.3607615730)
    this.__weight.push(0.4679139346)
    this.__weight.push(0.4679139346)

    // N=7
    this.__abscissa.push(-0.9491079123)
    this.__abscissa.push(0.9491079123)
    this.__abscissa.push(-0.7415311856)
    this.__abscissa.push(0.7415311856)
    this.__abscissa.push(-0.4058451514)
    this.__abscissa.push(0.4058451514)
    this.__abscissa.push(0.0000000000)

    this.__weight.push(0.1294849662)
    this.__weight.push(0.1294849662)
    this.__weight.push(0.2797053915)
    this.__weight.push(0.2797053915)
    this.__weight.push(0.3818300505)
    this.__weight.push(0.3818300505)
    this.__weight.push(0.4179591837)

    // N=8
    this.__abscissa.push(-0.9602898565)
    this.__abscissa.push(0.9602898565)
    this.__abscissa.push(-0.7966664774)
    this.__abscissa.push(0.7966664774)
    this.__abscissa.push(-0.5255324099)
    this.__abscissa.push(0.5255324099)
    this.__abscissa.push(-0.1834346425)
    this.__abscissa.push(0.1834346425)

    this.__weight.push(0.1012285363)
    this.__weight.push(0.1012285363)
    this.__weight.push(0.2223810345)
    this.__weight.push(0.2223810345)
    this.__weight.push(0.3137066459)
    this.__weight.push(0.3137066459)
    this.__weight.push(0.3626837834)
    this.__weight.push(0.3626837834)
  }

  /**
* @description 	Method: eval(_f:Function, _a:Number, _b:Number, _n:Number) - Approximate integral over specified range
*
* @param _f:Function - Reference to function to be integrated - must accept a numerical argument and return
*                      the function value at that argument.
*
* @param _a:Number   - Left-hand value of interval.
* @param _b:Number   - Right-hand value of inteval.
* @param _n:Number   - Number of points -- must be between 2 and 8
*
* @return Number - approximate integral value over [_a, _b]
*
* @since 1.0
*
*/
  eval2 (_f, _a, _b, _n) {
    this.__error.methodname = 'eval()'
    if (isNaN(_a) || isNaN(_b)) {
      this.__error.message = 'Invalid interval values'
      this.emit(this.__error.errType, this.__error)
      return 0
    }

    if (_a >= _b) {
      this.__error.message = 'Left-hand interval value overlaps right-hand value'
      this.emit(this.__error.errType, this.__error)
      return 0
    }

    if (!(typeof _f === 'function')) {
      this.__error.message = 'Invalid function reference'
      this.emit(this.__error.errType, this.__error)
      return 0
    }

    if (isNaN(_n) || _n < 2) {
      this.__error.message = 'Invalid number of intervals: ' + _n.toString()
      this.emit(this.__error.errType, this.__error)
      return 0
    }

    let n = Math.max(_n, 2)
    n = Math.min(n, Gauss.MAX_POINTS)

    let l = (n == 2) ? 0 : n * (n - 1) / 2 - 1
    let sum = 0

    if (_a == -1 && _b == 1) {
      for (let i = 0; i < n; ++i) { sum += _f(this.__abscissa[l + i]) * this.__weight[l + i] }

      return sum
    } else {
      // change of letiable
      let mult = 0.5 * (_b - _a)
      let ab2 = 0.5 * (_a + _b)
      for (let i = 0; i < n; ++i) { sum += _f(ab2 + mult * this.__abscissa[l + i]) * this.__weight[l + i] }

      return mult * sum
    }
  }
}
