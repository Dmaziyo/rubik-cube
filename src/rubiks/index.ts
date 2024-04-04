import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { createCamera } from './components/camera'
import { createScene } from './components/scene'
import { createRenderer } from './components/renderer'

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

  public constructor(container: Element) {
    this.camera = createCamera()
    this.scene = createScene('blue')
    this.renderer = createRenderer()
    container.append(this.renderer.domElement)

    setSize(container, this.camera, this.renderer);

    // TODO resizer
  }

  public render(){
    this.renderer.render(this.scene, this.camera)
  }
}
