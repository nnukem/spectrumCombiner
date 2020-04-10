//
// Solve2x2.as - A simple solver for two equations and two unknowns using Cramer's rule.  If the determinant is close to zero
// a zero vector is returned as the solution.
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

import Point from '../Utils/Point'

export default class Solve2x2 {
  constructor () {
    this.__determinant = 0
  }

  get determinant () { return this.__determinant }

  /**
* @description 	Method: solve( _a11, _a12, _a21, _a22, _a, _b, _zerTol=0.00001, _resolve=false )
*
* @param _a11 coefficient of x in first equation
* @param _a12 coefficient of y in first equation
* @param _a21 coefficient of x in second equation
* @param _a22 coefficient of y in second equation
* @param _b1 right-hand side value in first equation
* @param _b2 right-hand side value in second equation
* @param _zeroTol optional zero-tolerance for determinant
* @default 0.00001
* @param _resolve true if resolving a new system of equations with same coefficients, but different RHS
* @default false
*
* @return Point contains solution values or zero-vector if determinant is less than or equal to zero tolerance
*
* @since 1.0
*
*/
  solve (_a11, _a12, _a21, _a22, _b1, _b2, _zeroTol = 0.00001, _resolve = false) {
    if (!_resolve) {
      this.__determinant = _a11 * _a22 - _a12 * _a21
    }

    // exercise - dispatch an event if the determinant is near zero
    if (this.__determinant > _zeroTol) {
      var x = (_a22 * _b1 - _a12 * _b2) / this.__determinant
      var y = (_a11 * _b2 - _a21 * _b1) / this.__determinant

      return new Point(x, y)
    }

    return new Point(0, 0)
  }
}
