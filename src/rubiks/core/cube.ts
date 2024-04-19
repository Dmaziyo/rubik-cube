import { Camera, Group, Matrix4, Vector2, Vector3 } from 'three'
import { SquareMesh, createSquare } from './square'
import CubeData from './cubeData'
import { getSquareScreenPos, worldToScreen } from '../../utils/transform'
import { CubeState, RotateDirection } from './cubeState'

// 获取方块中心向法向量的反方向收缩一半长度的位置
function getInnerPos(square: SquareMesh, squareSize: number) {
  const moveVector = square.element.normal.clone().multiplyScalar(-0.5 * squareSize)
  return square.element.pos.clone().add(moveVector)
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

  public get order() {
    return this.cubeData.cubeOrder
  }

  public rotateOnePlane(
    mousePrePos: Vector2,
    mouseCurPos: Vector2,
    camera: Camera,
    controlSquare: SquareMesh,
    winSize: { width: number; height: number }
  ) {
    const scrollDir = mouseCurPos.sub(mousePrePos)
    // 判断是否有移动方向
    if (scrollDir.x === 0 && scrollDir.y === 0) return

    // 判断是否已经处于旋转状态，如果不是，则初始化旋转状态
    if (!this.state.isRotating) {
      // 判断可能旋转的方向, 获取法向量
      const squareNormal = controlSquare.element.normal

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
      // 注意不能直接cross，会改变原有数据
      const rotateAxisLocal = squareNormal.clone().cross(rotateDirLocal)

      // 旋转方块：通过找controlSquare的innerPos到其他方块的innerPos组成的向量与旋转轴是垂直的
      const controlInnerPos = getInnerPos(controlSquare, this.cubeData._size)
      const rotateSquares = this.squares.filter(square => {
        const tempInner = getInnerPos(square, this.cubeData._size)
        const vect = tempInner.clone().sub(controlInnerPos)
        return vect.dot(rotateAxisLocal) === 0
      })

      // 更新方块状态
      this.state.setState(rotateAxisLocal, rotateDir, rotateSquares)
    }
    const rotateAxisLocal = this.state.rotateAxisLocal!
    const rotateSquares = this.state.rotateSquares
    const rotateDir = this.state.rotateDir!

    // 旋转的角度=投影的长度/魔方宽度*90°，旋转弧度可以自定义
    // 投影：屏幕滑动方向在旋转方向上的投影,这也就是计算屏幕距离的另外一个用处
    const projLen = Math.cos(scrollDir.angleTo(rotateDir.scrollDir)) * scrollDir.length()
    const cubeSize = this.getCubeScreenSize(camera, winSize)
    // 因为scrollDir一直是从down到move计算的，是累加的，所以这个计算得出的是总共旋转角度
    const angleRotated = ((projLen / cubeSize) * Math.PI) / 2
    // 需要旋转的角度

    const rotateAngle = angleRotated - this.state.angleRotated
    this.state.angleRotated = angleRotated

    // 使用transform 矩阵来旋转方块
    const rotateMat = new Matrix4().makeRotationAxis(rotateAxisLocal, rotateAngle)

    rotateSquares.forEach(square => {
      square.applyMatrix4(rotateMat)
      square.updateMatrix()
    })
  }

  // 将cube的大小转换成屏幕大小
  private getCubeScreenSize(camera: Camera, winSize: { width: number; height: number }) {
    const localWidth = this.order * this.cubeData._size
    const leftScreenPos = worldToScreen(new Vector3(-localWidth, 0, 0), camera, winSize).length()
    const rightScreenPos = worldToScreen(new Vector3(localWidth, 0, 0), camera, winSize).length()
    return Math.abs(leftScreenPos - rightScreenPos)
  }
}
