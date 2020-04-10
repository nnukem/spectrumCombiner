//
// Bisect.as - A simple implementation of bisection to identify intervals of a function in which there is a sign change.
// This is a generic implementation, unlike the version inside the Bezier classes that is embedded for a bit extra
// performance.
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

export default class Bisect {
  static get BISECT_LIMIT () {
    return 0.05
  }
  /**
* @description 	Method: bisecttion( _f:Function, _left:Number, _right:Number ):Object
*
* @param _f:Function function whose root(s) are desired
* @param _left:Number leftmost x-coordinate of interval to be bisected
* @param _right:Number rightmost x-coordinate of interval to be bisected
*
* @return Object 'left' property contains the leftmost x-coordinate of the interval and 'right' property contains the rightmost x-coordinate of the interval
*
* @since 1.0
*
*/

  bisection (_f, _left, _right) {
    if (Math.abs(_right - _left) <= Bisect.BISECT_LIMIT) {
      return
    }

    let leftInterval = _left
    let rightInterval = _right

    let left = _left
    let right = _right
    let middle = 0.5 * (left + right)
    if (_f(left) * _f(right) <= 0) {
      leftInterval = left
      rightInterval = right
      return
    } else {
      __bisect(_f, left, middle)
      __bisect(_f, middle, right)
    }

    return { left: leftInterval, right: rightInterval }
  }
}
