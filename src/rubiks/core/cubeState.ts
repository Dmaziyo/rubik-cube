import { Vector2 } from "three"
import { SquareMesh } from "./square";

export interface RotateDirection{
  scrollDir:Vector2; //旋转的方向
  startSquare:SquareMesh;
  endSquare:SquareMesh;
}
export class CubeState {
  isRotating: boolean = false
  constructor() {}

  public setRotating() {
    this.isRotating = true
  }
}
