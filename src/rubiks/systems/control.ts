import { PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from 'three'
import { Cube } from '../core/cube'
import { throttle } from '../../utils/throttle'
import { rotateAroundWorldAxis } from '../../utils/transform'


export class Control {
  private renderer: WebGLRenderer
  private scene: Scene
  private cube: Cube
  private camera: PerspectiveCamera
  private mouseDown = false
  private rotateSpeed = 0.06

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
    this.domElement.addEventListener('mousemove', throttle(this.mouseMoveHandler.bind(this), 0.03))
  }
  private mouseDownHandler() {
    this.mouseDown = true
  }
  private mouseUpHandler() {
    this.mouseDown = false
  }
  private mouseMoveHandler(e:MouseEvent) {
    if(this.mouseDown){
      // 计算移动向量位置
      const moveVector = new Vector2(e.movementX, -e.movementY);

      //因为鼠标移动的时候物体是以垂直于移动向量的法向量作为轴转动的
      const rotateDir = moveVector.rotateAround(new Vector2(0, 0), Math.PI / 2).normalize();

      rotateAroundWorldAxis(this.cube,new Vector3(rotateDir.x,rotateDir.y),this.rotateSpeed)
      this.renderer.render(this.scene,this.camera)
    }
  }
}
