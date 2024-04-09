import { PerspectiveCamera } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function createControls(camera: PerspectiveCamera, canvas: HTMLElement) {
  const controls = new OrbitControls(camera, canvas) as OrbitControls & { tick: Function } 
  controls.enableDamping = true
  controls.tick = () => {
    controls.update()
  }

  return controls
}
