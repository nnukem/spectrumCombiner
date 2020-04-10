//
// Coef.as - polynomial coefficients for parametric polynomials of arbitrary order.    
//
// copyright (c) 2006-2007, Jim Armstrong.  All Rights Reserved.
//
// This software program is supplied 'as is' without any warranty, express, implied, 
// or otherwise, including without limitation all warranties of merchantability or fitness
// for a particular purpose.  Jim Armstrong shall not be liable for any special incidental, 
// or consequential damages, including, without limitation, lost revenues, lost profits, 
// or loss of prospective economic advantage, resulting from the use or misuse of this 
// software program.
//
// Programmed by Jim Armstrong, singularity (www.algorithmist.net)
//
// Note:  This is a crude implementation, meant to support the aribitrary-order Bezier curve which is itself
// used only for teaching purposes.
//
//

  export default class Coef
  {
    // properties

    
    constructor()
    {

      this.__cX  = [];
      this.__cY  = [];
      this.__len = 0;
    }
    
    get degree() { return this.__cX.length; }

    reset()
    {
      this.__cX.splice(0);
      this.__cY.splice(0);
      this.__len = 0;
    }
    
    addCoef( _cX, _cY )
    {
      this.__cX.push(_cX);
      this.__cY.push(_cY);
      this.__len++;
    }
    
    getCoef( _indx ) 
    { 
      return {X:this.__cX[_indx], Y:this.__cY[_indx]}
    }

    getX(_t)
    {
      if( this.__len > 1 )
      {
        let p = this.__cX[this.__len-1];
        for( let i=this.__len-2; i>=0; i-- )
          p = _t*p + this.__cX[i];
               
        return p;
      }
      else
        return this.__cX[0];
    }

    getY(_t)
    {
      if( this.__len > 1 )
      {
        let p = this.__cY[this.__len-1];
        for( let i=this.__len-2; i>=0; i-- )
          p = _t*p + this.__cY[i];
        
        return p;
      }
      else
        return this.__cY[0];
    }
  }
