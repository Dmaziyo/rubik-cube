import { Camera, Group, Vector2, Vector3 } from 'three'
import { SquareMesh, createSquare } from './square'
import CubeData from './cubeData'
import { ndcToScreen } from '../../utils/transform'
import { CubeState } from './cubeState'

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

  private getSquareScreenPos(square: SquareMesh, camera: Camera, winSize: { width: number; height: number }) {
    // 获取物体的世界坐标系位置，并转换成NDC坐标
    let vect3 = new Vector3()
    square.getWorldPosition(vect3)
    this.position.project(camera)

    // 转换成屏幕坐标
    return ndcToScreen(vect3.x, vect3.y, winSize.width, winSize.height)
  }

  public rotateOnePlane(
    mousePrePos: Vector2,
    mouseCurPos: Vector2,
    camera: Camera,
    square: SquareMesh,
    winSize: { width: number; height: number }
  ) {
    const scrollDir = mouseCurPos.sub(mousePrePos).normalize()
    // 判断是否有移动方向
    if (scrollDir.x === 0 && scrollDir.y === 0) return

    // 判断是否已经处于旋转状态，如果不是，则初始化旋转状态
    if (!this.state.isRotating) {
      // 判断可能旋转的方向
      const squareNormal = new Vector3()
      const local = new Vector3()
      // 获取法向量
      square.getWorldDirection(squareNormal)

      // 获取当前方块垂直和水平方向相邻的方块
      const [square1, square2] = this.squares.filter(s => {
        const normal = new Vector3()
        // 这个distance===1有点瑕疵，tag一下
        return s !== square && squareNormal.equals(s.getWorldDirection(normal)) && square.position.distanceTo(s.position) === 1
      })
      // square1.material.color.set(Math.random() * 0xffffff)
      // square2.material.color.set(Math.random() * 0xffffff)
    }
    // TODO 根据鼠标移动的方向与可能旋转的方向的夹角判断最终移动方向，然后计算旋转轴，旋转平面
  }
}
