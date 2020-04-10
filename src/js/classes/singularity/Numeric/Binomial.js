/**
* Binomial.as - Generate Binomial coefficients, either individually or as a single row in Pascal's triangle
*
* Copyright (c) 2007, Jim Armstrong.  All rights reserved.
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

export default class Binomial {
  // row number or 'n' in binomial coefficient (n k)

  constructor () {
    this.__n = 2
    this.__row = [1, 2]
  }

  /**
* @description coef( _n:uint, _k:uint ) - Generate the binomial coefficient (n k)
*
* @param _n:uint - n items
* @param _k:Numer  - k at a time
*
* @since 1.0
*
* @return Number: Binomial coefficient (n k)
*
*/
  coef (_n, _k) {
    if (_k > _n) { return 0 } else if (_k == _n) { return 1 }

    if (this.__n != _n) { this.__recurse(_n) }

    let j = this.__n % 2
    let e = (this.__n + 2 - j) / 2

    return (_k >= e) ? this.__row[_n - _k] : this.__row[_k]
  }

  /**
* @description getRow( _n:uint ) - Return the n-th full row of Pascal's triangle
*
* @param _n:uint - Index of desired row (beginning at zero)
*
* @since 1.0
*
* @return Array: Full n-th row of Pascal's triangle
*
* Note:  It is the caller's responsibility to delete the returned array if calling this method more than once
*
*/
  getRow (_n) {
    switch (_n) {
      case 0:
        return [1]
        break

      case 1:
        return [1, 1]
        break

      case 2:
        return [1, 2, 1]
        break

      default:
        let newRow = (_n == this.__n) ? this.__fillOut() : this.__recurse(_n)
        return newRow
        break
    }
  }

  // fill out nonsymmetric portion of current row, returning reference to full array
  __fillOut () {
    let j = this.__n % 2
    let e = (this.__n + 2 - j) / 2
    let arr = this.__row.slice(0, e + 1)

    if (j == 0) {
      for (let i = 0; i < e - 1; ++i) { arr[e + i] = arr[e - i - 2] }
    } else {
      for (let i = 0; i < e; ++i) { arr[e + i] = arr[e - i - 1] }
    }

    return arr
  }

  // recursively generate desired row from the current row
  __recurse (_r) {
    // forward or reverse?
    if (_r > this.__n) { this.__forward(_r) } else {
      // recurse backward or reset and move forward ... inquiring minds want to know :)
      if ((_r - 2) <= (this.__n - _r)) {
        // reset and move forward
        this.__row[1] = 2
        this.__n = 2
        this.__forward(_r)
      } else { this.__reverse(_r) }
    }

    this.__n = _r
    return this.__fillOut()
  }

  // run recursion forward
  __forward (_r) {
    for (let i = this.__n + 1; i <= _r; ++i) {
      // how many elements in the nonsymmetric portion of the current row?
      let j = i % 2
      let e = (i + 2 - j) / 2
      let h = this.__row[0]

      if (j == 1) {
        for (let k = 1; k < e; ++k) {
          let val = this.__row[k] + h
          h = this.__row[k]
          this.__row[k] = val
        }
      } else {
        for (let k = 1; k < e - 1; ++k) {
          let val = this.__row[k] + h
          h = this.__row[k]
          this.__row[k] = val
        }
        this.__row[e - 1] = 2 * h
      }
    }
  }

  // run recursion backwards
  __reverse (_r) {
    for (let i = this.__n - 1; i >= _r; i--) {
      // how many elements in the nonsymmetric portion of the current row?
      let j = i % 2
      let e = (i + 2 - j) / 2

      for (let k = 1; k < e; ++k) { this.__row[k] = this.__row[k] - this.__row[k - 1] }
    }
  }
}
