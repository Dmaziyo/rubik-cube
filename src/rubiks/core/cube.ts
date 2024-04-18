import { Camera, Group, Vector2 } from 'three'
import { SquareMesh, createSquare } from './square'
import CubeData from './cubeData'
import { getSquareScreenPos } from '../../utils/transform'
import { CubeState, RotateDirection } from './cubeState'

// 获取方块中心向法向量的反方向收缩一半长度的位置
function getInnerPos(square: SquareMesh, squareSize: number) {
  const moveVector = square.element.normal.clone().multiplyScalar(-0.5 * squareSize)
  return square.element.pos.clone().sub(moveVector)
}

export class Cube extends Group {
  private cubeData: CubeData
  public state: CubeState

  constructor(order = 3) {
    super()
    this.cubeData = new CubeData(order)
    this.cubeData.elements.forEach(el => {
      const square = createSquare(el.color, el)
      this.add(square)
    })
    this.state = new CubeState()
  }

  public get squares() {
    return this.children as SquareMesh[]
  }

  public rotateOnePlane(
    mousePrePos: Vector2,
    mouseCurPos: Vector2,
    camera: Camera,
    controlSquare: SquareMesh,
    winSize: { width: number; height: number }
  ) {
    const scrollDir = mouseCurPos.sub(mousePrePos).normalize()
    // 判断是否有移动方向
    if (scrollDir.x === 0 && scrollDir.y === 0) return

    // 判断是否已经处于旋转状态，如果不是，则初始化旋转状态
    if (!this.state.isRotating) {
      // 判断可能旋转的方向, 获取法向量
      const squareNormal = controlSquare.element.normal
      controlSquare.getWorldDirection(squareNormal)

      // 获取当前方块垂直和水平方向相邻的方块
      const [square1, square2] = this.squares.filter(s => {
        // 这个distance===1有点瑕疵，tag一下
        return s !== controlSquare && squareNormal.equals(s.element.normal) && controlSquare.position.distanceTo(s.position) === 1
      })
      const squarePosInScreen = getSquareScreenPos(controlSquare, camera, winSize)
      const square1PosInScreen = getSquareScreenPos(square1, camera, winSize)
      const square2PosInScreen = getSquareScreenPos(square2, camera, winSize)

      // 列出可能的方向
      const rotateDirections: RotateDirection[] = [
        {
          scrollDir: square1PosInScreen.clone().sub(squarePosInScreen).normalize(),
          startSquare: controlSquare,
          endSquare: square1
        },
        {
          scrollDir: square1PosInScreen.clone().sub(squarePosInScreen).negate().normalize(),
          startSquare: square1,
          endSquare: controlSquare
        },

        {
          scrollDir: square2PosInScreen.clone().sub(squarePosInScreen).normalize(),
          startSquare: controlSquare,
          endSquare: square2
        },
        {
          scrollDir: square2PosInScreen.clone().sub(squarePosInScreen).negate().normalize(),
          startSquare: square2,
          endSquare: controlSquare
        }
      ]
      let miniAngle = scrollDir.angleTo(rotateDirections[0].scrollDir)
      let rotateDir = rotateDirections[0]
      for (let i = 1; i < rotateDirections.length; i++) {
        let curAngle = scrollDir.angleTo(rotateDirections[i].scrollDir)
        if (miniAngle > curAngle) {
          miniAngle = curAngle
          rotateDir = rotateDirections[i]
        }
      }
      // 旋转轴：通过叉积计算同时垂直于法向量和旋转向量的向量
      const rotateDirLocal = rotateDir.endSquare.position.clone().sub(rotateDir.startSquare.position).normalize() //在local space中旋转的方向
      const rotateAxis = squareNormal.cross(rotateDirLocal)

      // 旋转方块：通过找controlSquare的innerPos到其他方块的innerPos组成的向量与旋转轴是垂直的
      const controlInnerPos = getInnerPos(controlSquare, this.cubeData._size)
      const rotateSquares = this.squares.filter(square => {
        const tempInner = getInnerPos(square, this.cubeData._size)
        const vect = tempInner.clone().sub(controlInnerPos)
        return vect.dot(rotateAxis) === 0
      })

      // TODO 旋转方块
    }
  }
}
