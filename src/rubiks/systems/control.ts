import { PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from 'three'
import { Cube } from '../core/cube'
import { throttle } from '../../utils/throttle'
import { rotateAroundWorldAxis } from '../../utils/transform'
import { SquareMesh } from '../core/square'

export class Control {
  private renderer: WebGLRenderer
  private scene: Scene
  private cube: Cube
  private camera: PerspectiveCamera
  private mouseDown = false
  private _square: SquareMesh | null = null
  private rotateSpeed = 0.06
  private raycaster = new Raycaster()
  private get domElement() {
    return this.renderer.domElement
  }

  constructor(renderer: WebGLRenderer, scene: Scene, cube: Cube, camera: PerspectiveCamera) {
    this.renderer = renderer
    this.scene = scene
    this.cube = cube
    this.camera = camera
    this.init()
  }

  private init() {
    this.domElement.addEventListener('mousedown', this.mouseDownHandler.bind(this))
    this.domElement.addEventListener('mouseup', this.mouseUpHandler.bind(this))
    this.domElement.addEventListener('mousemove', throttle(this.mouseMoveHandler.bind(this), 0.02))
  }
  private mouseDownHandler(e: MouseEvent) {
    this.mouseDown = true
    this._square = this.getSquareClicked(e)
  }
  private mouseUpHandler() {
    if (this._square) {
      // 停止旋转，修改cube状态
      // TODO 修正平面为90度

      this._square = null
    }
    this.mouseDown = false
  }
  private mouseMoveHandler(e: MouseEvent) {
    if (this.mouseDown) {
      // 选中方块的时候，移动平面
      if (this._square) {
        // TODO rotate plane
      }
      // 当没有选中方块的时候，移动cube
      else {
        // 计算移动向量位置
        const moveVector = new Vector2(e.movementX, -e.movementY)

        //因为鼠标移动的时候物体是以垂直于移动向量的法向量作为轴转动的
        const rotateDir = moveVector.rotateAround(new Vector2(0, 0), Math.PI / 2).normalize()

        rotateAroundWorldAxis(this.cube, new Vector3(rotateDir.x, rotateDir.y), this.rotateSpeed)
        this.renderer.render(this.scene, this.camera)
      }
    }
  }

  private getSquareClicked(e: MouseEvent) {
    // 将其转换为NDC坐标,因为当前坐标是以左上角为(0,0)开头的,要转换为中心为(0,0)并且左右范围为[-1,1]的坐标
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(new Vector2(x, y), this.camera)

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children)

    if (intersects.length > 0) {
      return intersects[0].object as SquareMesh
    }

    return null
  }
}
