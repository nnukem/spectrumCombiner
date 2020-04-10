//
// SingularityEvent.as - Common event manager for singularity library.
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
// programmed by Jim Armstrong, singularity (www.algorithmist.net)
//
//

export default class SingularityEvent {
  static get ERROR () { return 'E' }
  static get WARNING () { return 'W' }
  static get INIT () { return 'I' }
  static get COMPLETE () { return 'C' }
  static get ROLL_OVER () { return 'OVR' }
  static get ROLL_OUT () { return 'OUT' }
  static get SELECTED () { return 'S' }
  static get ID () { return 'ID' }
  static get ALL_EVENTS() { return ['E','W','I', 'C', 'OVR','OUT','S', 'ID']}


  constructor (_typ) {
    this.__type = _typ
    this.__message = ''
    this.__class = ''
    this.__method = ''
  }

  get classname () { return this.__class }
  get methodname () { return this.__method }
  get errType () { return this.__type }

  set classname (_s) {
    if (_s != '') { this.__class = _s }
  }

  set methodname (_m) {
    if (_m != '') { this.__method = _m }
  }

  set message (_m) {
    if (_m != '') { this.__message = _m }
  }

  clone () {
    return new SingularityEvent(this.__type)
  }

  toString () {
    return 'From: ' + this.__class + '::' + this.__method + ' , message: ' + this.__message
  }
}
