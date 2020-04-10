//
// Consts.as - Constants used in a variety of applications.
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

export default class Consts {
  static get ZERO_TOL () { return 0.0001 } // zero tolerance

  static get PI_2 () { return 0.5 * Math.PI };
  static get PI_4 () { return 0.25 * Math.PI }
  static get PI_8 () { return 0.125 * Math.PI }
  static get PI_16 () { return 0.0625 * Math.PI }
  static get TWO_PI () { return 2.0 * Math.PI }
  static get THREE_PI_2 () { return 1.5 * Math.PI }
  static get ONE_THIRD () { return 1.0 / 3.0 }
  static get TWO_THIRDS () { return Consts.ONE_THIRD + Consts.ONE_THIRD }
  static get ONE_SIXTH () { return 1.0 / 6.0 }
  static get DEG_TO_RAD () { return Math.PI / 180 }
  static get RAD_TO_DEG () { return 180 / Math.PI }

  static get CIRCLE_ALPHA () { return 4 * (Math.sqrt(2) - 1) / 3.0 }

  static get ON () { return true };
  static get OFF () { return false };

  static get AUTO () { return 'A' }
  static get DUPLICATE () { return 'D' }
  static get EXPLICIT () { return 'E' }
  static get CHORD_LENGTH () { return 'C' }
  static get ARC_LENGTH () { return 'AL' }
  static get UNIFORM () { return 'U' }
  static get FIRST () { return 'F' }
  static get LAST () { return 'L' }
  static get POLAR () { return 'P' }

  // Machine-dependent

  constructor () {
    // Machine epsilon ala Eispack
    let __fourThirds = 4.0 / 3.0
    let __third = __fourThirds - 1.0
    let __one = __third + __third + __third
    this.__epsilon = Math.abs(1.0 - __one)
  }

  get EPSILON () { return this.__epsilon }
}
