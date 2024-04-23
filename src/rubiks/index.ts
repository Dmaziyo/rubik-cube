import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { createCamera } from './components/camera'
import { createScene } from './components/scene'
import { createRenderer } from './components/renderer'
import { Resizer } from './systems/Resizer'
import { Loop } from './systems/loop'
import { Control } from './systems/control'
import { Cube } from './core/cube'

const setSize = (container: Element, camera: PerspectiveCamera, renderer: WebGLRenderer) => {
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()

  renderer.setSize(container.clientWidth, container.clientHeight)

  renderer.setPixelRatio(window.devicePixelRatio)
}

export class Rubik {
  private camera: PerspectiveCamera
  private scene: Scene
  private renderer: WebGLRenderer
  private loop: Loop
  private control: Control
  private cube: Cube

  public constructor(container: Element) {
    this.camera = createCamera()
    this.scene = createScene('gray')
    this.renderer = createRenderer()
    this.cube = new Cube(3)
    this.scene.add(this.cube)

    // 实现动画效果以及摄像头控制
    this.loop = new Loop(this.camera, this.scene, this.renderer)
    this.control = new Control(this.renderer, this.scene, this.cube, this.camera)

    container.append(this.renderer.domElement)

    const resizer = new Resizer(container, this.camera, this.renderer)
    setSize(container, this.camera, this.renderer)
    this.start()
  }

  public render() {
    this.renderer.render(this.scene, this.camera)
  }

  public start() {
    this.loop.start()
  }
  public stop() {
    this.loop.stop()
  }
  public shuffle() {
    this.control.shuffle()
  }
  public restore() {
    this.cube.restore()
  }
}
