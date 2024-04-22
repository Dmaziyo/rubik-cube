import { Vector2, Vector3 } from 'three'
import { SquareMesh } from './square'

export interface RotateDirection {
  scrollDir: Vector2 //旋转的方向
  startSquare: SquareMesh
  endSquare: SquareMesh
}
export class CubeState {
  isRotating: boolean = false
  rotateAxisLocal: Vector3 | null = null
  rotateSquares: SquareMesh[] = []
  rotateDir: RotateDirection | null = null
  angleRotated: number = 0
  shuffing: boolean = false
  constructor() {}

  public setState(rotateAxisLocal: Vector3, rotateDir: RotateDirection, rotateSquares: SquareMesh[]) {
    this.isRotating = true
    this.rotateAxisLocal = rotateAxisLocal
    this.rotateSquares = rotateSquares
    this.rotateDir = rotateDir
  }
  public resetSate() {
    this.isRotating = false
    this.rotateAxisLocal = null
    this.rotateDir = null
    this.rotateSquares = []
    this.angleRotated = 0
    this.shuffing = false
  }
}
