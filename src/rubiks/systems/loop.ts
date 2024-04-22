import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import TWEEN from '@tweenjs/tween.js'
const clock = new Clock()
export class Loop {
  public updatables: any[]

  private camera: PerspectiveCamera
  private scene: Scene
  private renderer: WebGLRenderer

  constructor(camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer) {
    this.camera = camera
    this.scene = scene
    this.renderer = renderer
    this.updatables = []
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      this.tick()
      TWEEN.update()
      this.renderer.render(this.scene,this.camera)
    })
  }
  stop() {
    this.renderer.setAnimationLoop(null)
  }
  private tick() {
    const delta = clock.getDelta()
    for (const object of this.updatables) {
      object.tick(delta)
    }
  }
}
