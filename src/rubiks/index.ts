import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { createCamera } from './components/camera'
import { createScene } from './components/scene'
import { createRenderer } from './components/renderer'
import { createCube } from './core/cube'

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
    // TODO control camera
    this.camera = createCamera()
    this.scene = createScene('black')
    this.renderer = createRenderer()
    const cube = createCube()
    this.scene.add(cube)
    container.append(this.renderer.domElement)

    setSize(container, this.camera, this.renderer)
    this.render()
    // TODO resizer
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
  }
}
