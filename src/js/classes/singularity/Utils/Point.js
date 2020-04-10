export default class Point{
  constructor(x,y){
    this._x = x || 0;
    this._y = y || 0;
  }

  get x(){
    return this._x
  }

  set x(value){
    this._x = value
  }

  get y(){
    return this._y
  }

  set y(value){
    this._y = value
  }
}