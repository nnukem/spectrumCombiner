//
// Composite.js - Base class for composite or piecewise curves.
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
//

import SingularityEvent from '../Events/SingularityEvent'
import Consts from '../Numeric/Consts'
import FastCubicSpline from './FastCubicSpline'
import Gauss from '../Numeric/Gauss'
import EventDispatcher from '../../nuke/utils/EventDispatcher'

export default class Composite extends EventDispatcher {
/**
* @description 	Method: Composite() - Construct a new base composite curve
*
* @return Nothing
*
* @since 1.0
*
*/
  constructor () {
    super(SingularityEvent.ALL_EVENTS)

    this.__color = 0x0000ff
    this.__thickness = 1
    this.__count = 0
    this.__invalidate = true
    this.__container = null
    this.__arcLength = -1

    this.__error = new SingularityEvent(SingularityEvent.ERROR)
    this.__error.classname = 'Composite'

    this.__consts = new Consts()
    this.__spline = new FastCubicSpline()

    this.__integral = new Gauss()
  }

  set color (_c) {
    this.__color = _c
  }

  set thickness (_t) {
    this.__thickness = Math.round(_t)
  }

  /* set container(_s)
    {
      this.__container = _s;
    } */

  set parameterize (_s) {
    if (_s == Consts.ARC_LENGTH || _s == Consts.UNIFORM) {
      this.__param = _s
      this.__invalidate = true
    }
  }

  /* reColor(_c)
    {
      var g:Graphics = this.__container.graphics;

      var colorXForm:ColorTransform = this.__container.transform.colorTransform;
      colorXForm.color = _c;
      this.__container.transform.colorTransform = colorXForm;
    }

    reDraw()
    {
      var g:Graphics = this.__container.graphics;

      var colorXForm:ColorTransform = this.__container.transform.colorTransform;
      colorXForm.color = this.__color;
      this.__container.transform.colorTransform = colorXForm;
    } */

  // Following methods should be overridden in subclass
  __integrand (_t) { throw new Error('Composite::__integrand() must be overriden') }

  arcLength () { throw new Error('Composite::arcLength() must be overriden') }

  arcLengthAt (_t) { throw new Error('Composite::arcLengthAt() must be overriden') }

  addControlPoint (_xCoord, _yCoord) { throw new Error('Composite::addControlPoint() must be overriden') }

  moveControlPoint (_indx, _newX, _newY) { throw new Error('Composite::addControlPoint() must be overriden') }

  draw (_t = 1.0) { throw new Error('Composite::draw() must be overriden') }

  reset () { throw new Error('Composite::reset() must be overriden') }

  getX (_t) { throw new Error('Composite::getX() must be overriden') }

  getY (_t) { throw new Error('Composite::getY() must be overriden') }
}
