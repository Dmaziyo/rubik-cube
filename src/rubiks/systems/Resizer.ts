import { PerspectiveCamera, WebGLRenderer } from 'three'

const setSize = function (container: Element, camera: PerspectiveCamera, renderer: WebGLRenderer) {
  camera.aspect = container.clientWidth / container.clientHeight

  // update the camera's frustum
  camera.updateProjectionMatrix()

  //update the size of canvas
  renderer.setSize(container.clientWidth, container.clientHeight)

  renderer.setPixelRatio(window.devicePixelRatio)
}

export class Resizer {
  constructor(container: Element, camera: PerspectiveCamera, renderer: WebGLRenderer) {
    setSize(container, camera, renderer)
    window.addEventListener('resize', () => {
      setSize(container, camera, renderer)
    })
  }
}
