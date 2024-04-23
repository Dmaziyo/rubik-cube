import { Camera, Group, Matrix4, Vector2, Vector3 } from 'three'
import { SquareMesh, createSquare } from './square'
import CubeData from './cubeData'
import { getSquareScreenPos, vector3Calibration, worldToScreen } from '../../utils/transform'
import { CubeState, RotateDirection } from './cubeState'
import TWEEN from '@tweenjs/tween.js'

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
      this.setCubeState(false, controlSquare, camera, winSize, scrollDir)
    }
    const rotateAxisLocal = this.state.rotateAxisLocal!
    const rotateSquares = this.state.rotateSquares
    const rotateDir = this.state.rotateDir!

    // 旋转的角度=投影的长度/魔方宽度*90°，旋转弧度可以自定义
    // 投影：屏幕滑动方向在旋转方向上的投影,这也就是计算屏幕距离的另外一个用处
    const projLen = Math.cos(scrollDir.angleTo(rotateDir.scrollDir)) * scrollDir.length()
    const cubeSize = this.getCubeScreenSize(camera, winSize)
    // 因为scrollDir一直是从down到move计算的，是累加的，所以这个计算得出的是总共旋转角度
    const angleRotated = (projLen / cubeSize) * Math.PI
    // 需要旋转的角度

    const rotateAngle = angleRotated - this.state.angleRotated
    this.state.angleRotated = angleRotated

    // 使用transform 矩阵来旋转方块
    const rotateMat = new Matrix4().makeRotationAxis(rotateAxisLocal, rotateAngle)

    // 相对于local space的旋转轴进行旋转
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
  // 将平面旋转调整至90°的倍数，并且修改squareElement的数据，因为要pos来获取innerPos，normal来获取平面方块
  public afterRotate() {
    let angleRotated = this.state.angleRotated
    // 将已经旋转的角度%90°计算超出的度数
    const rotateSquares = this.state.rotateSquares

    const exceedAnglePI = Math.abs(angleRotated) % (Math.PI * 0.5)

    let needRotateAngle = exceedAnglePI > Math.PI * 0.25 ? Math.PI * 0.5 - exceedAnglePI : -exceedAnglePI
    needRotateAngle = angleRotated > 0 ? needRotateAngle : -needRotateAngle
    // 调整位置
    const rotateMat = new Matrix4().makeRotationAxis(this.state.rotateAxisLocal!, needRotateAngle)
    rotateSquares.forEach(square => {
      square.applyMatrix4(rotateMat)
      square.updateMatrix()
    })

    angleRotated += needRotateAngle

    // 每次旋转完都要更新，因为每次旋转完后都会产生小数点的偏差
    rotateSquares.forEach(square => {
      const normal = square.element.normal.clone()
      const pos = square.element.pos.clone()
      square.element.normal = vector3Calibration(
        normal.applyMatrix4(new Matrix4().makeRotationAxis(this.state.rotateAxisLocal!, angleRotated))
      )
      // 以pos为基准是因为pos没有在旋转的时候发生变更，而position在旋转的时候数字变成了浮点数，偏差较大
      square.element.pos = vector3Calibration(pos.applyMatrix4(new Matrix4().makeRotationAxis(this.state.rotateAxisLocal!, angleRotated)))
      //微调位置，因为旋转的时候radian不是整数，所以会形变
      square.position.copy(square.element.pos)
      square.updateMatrix()
    })

    this.state.resetSate()
  }

  public async shuffle(camera: Camera, winSize: { width: number; height: number }) {
    const shuffleTimes = 15
    for (let i = 0; i < shuffleTimes; i++) {
      // 随机选取一个方块
      const controlSquare = this.squares[Math.floor(Math.random() * this.squares.length)]
      this.setCubeState(true, controlSquare, camera, winSize, new Vector2(0, 0))

      // 在-180~180之间随机
      const rotateAngle = Math.random() > 0.5 ? Math.PI * (Math.random() * 0.5 + 0.5) : -Math.PI * (Math.random() * 0.5 + 0.5)

      const rotateAxisLocal = this.state.rotateAxisLocal!
      const rotateSquares = this.state.rotateSquares

      // 进行旋转动画
      await this.rotateAnimation(rotateSquares, rotateAxisLocal, rotateAngle)
    }
  }
  private rotateAnimation(rotateSquares: SquareMesh[], rotateAxisLocal: Vector3, rotateAngle: number) {
    const current = { rad: 0 }
    const end = { rad: rotateAngle }
    const time = Math.abs(rotateAngle) * (500 / Math.PI)
    const previous = { rad: current.rad }
    return new Promise((resolve, reject) => {
      try {
        new TWEEN.Tween(current)
          .to(end, time)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate(() => {
            // 使用transform 矩阵来旋转方块
            const rotateMat = new Matrix4().makeRotationAxis(rotateAxisLocal, current.rad - previous.rad)
            previous.rad = current.rad
            // 相对于local space的旋转轴进行旋转
            rotateSquares.forEach(square => {
              square.applyMatrix4(rotateMat)
              square.updateMatrix()
            })
          })
          .onComplete(cur => {
            // 更新旋转角度
            this.state.angleRotated = rotateAngle
            // 重置状态
            this.afterRotate()
            resolve(cur)
          })
          .start(undefined)
      } catch (err) {
        reject(err)
      }
    })
  }

  // 抽离shuffle和rotatePlane的公共部分
  private setCubeState(
    isShuffle: boolean = false,
    controlSquare: SquareMesh,
    camera: Camera,
    winSize: { width: number; height: number },
    scrollDir: Vector2
  ) {
    // 判断可能旋转的方向, 获取法向量
    const squareNormal = controlSquare.element.normal

    // 获取当前方块垂直和水平方向相邻的方块
    const [square1, square2] = this.squares.filter(s => {
      // 这个distance===1有点瑕疵，tag一下
      return s !== controlSquare && squareNormal.equals(s.element.normal) && controlSquare.element.pos.distanceTo(s.element.pos) === 1
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

    let rotateDir: RotateDirection
    if (isShuffle) {
      rotateDir = rotateDirections[Math.floor(Math.random() * rotateDirections.length)]
    } else {
      let miniAngle = scrollDir.angleTo(rotateDirections[0].scrollDir)
      rotateDir = rotateDirections[0]
      for (let i = 1; i < rotateDirections.length; i++) {
        let curAngle = scrollDir.angleTo(rotateDirections[i].scrollDir)
        if (miniAngle > curAngle) {
          miniAngle = curAngle
          rotateDir = rotateDirections[i]
        }
      }
    }

    // 旋转轴：通过叉积计算同时垂直于法向量和旋转向量的向量
    const rotateDirLocal = rotateDir.endSquare.element.pos.clone().sub(rotateDir.startSquare.element.pos).normalize() //在local space中旋转的方向
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

  public restore() {
    // 清除所有子元素
    this.clear()
    // 重新生成方块
    this.cubeData = new CubeData(this.order)
    this.cubeData.elements.forEach(el => {
      const square = createSquare(el.color, el)
      this.add(square)
    })
  }
}
