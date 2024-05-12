import { PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from 'three'
import { Cube } from '../core/cube'
import { throttle } from '../../utils/throttle'
import { rotateAroundWorldAxis } from '../../utils/transform'
import { SquareMesh } from '../core/square'
import { isTouchDevice } from '../../utils/_is'

export class Control {
  private renderer: WebGLRenderer
  private scene: Scene
  private cube: Cube
  private camera: PerspectiveCamera
  private mouseDown = false
  private mouseDownPos = new Vector2()
  private touchStartPos = new Vector2()
  private _square: SquareMesh | null = null
  private rotateSpeed = 0.1
  private raycaster = new Raycaster()
  private isShuffling = false
  private get domElement() {
    return this.renderer.domElement
  }

	constructor(
		renderer: WebGLRenderer,
		scene: Scene,
		cube: Cube,
		camera: PerspectiveCamera
	) {
		this.renderer = renderer;
		this.scene = scene;
		this.cube = cube;
		this.camera = camera;
		this.init();
	}

  private init() {
    // TODO: 是都注册还是按需注册，是个考量
    // 按需注册：在浏览器切换手机端模式，会出现触摸事件失效的问题；但这个场景并不会在真是用户场景下出现
    if (isTouchDevice()) {
      // 添加触摸事件监听器
      this.domElement.addEventListener('touchstart', this.touchStartHandler.bind(this))
      this.domElement.addEventListener('touchend', this.touchEndHandler.bind(this))
      this.domElement.addEventListener('touchmove', throttle(this.touchMoveHandler.bind(this), 0))
    } else {
      this.domElement.addEventListener('mousedown', this.mouseDownHandler.bind(this))
      this.domElement.addEventListener('mouseup', this.mouseUpHandler.bind(this))
      this.domElement.addEventListener('mousemove', throttle(this.mouseMoveHandler.bind(this), 0))
    }
  }

  public async shuffle() {
    this.isShuffling = true
    await this.cube.shuffle(this.camera, {
      width: this.domElement.width,
      height: this.domElement.height
    })

    this.isShuffling = false
  }

  private getSquareClicked(event: MouseEvent | TouchEvent) {
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY
    const x = (clientX / window.innerWidth) * 2 - 1
    const y = -(clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(new Vector2(x, y), this.camera)

    const intersects = this.raycaster.intersectObjects(this.scene.children)

    if (intersects.length > 0) {
      if (intersects[0].object instanceof SquareMesh) {
        return intersects[0].object
      }
      return intersects[0].object.parent as SquareMesh
    }

    return null
  }

  private mouseDownHandler(e: MouseEvent) {
    this.mouseDown = true
    this._square = this.getSquareClicked(e)
    if (this._square) {
      this.mouseDownPos = new Vector2(e.clientX, e.clientY)
    }
  }

  private mouseUpHandler() {
    if (this._square && !this.isShuffling) {
      this.cube.afterRotate()
      this._square = null
      this.renderer.render(this.scene, this.camera)
    }
    this.mouseDown = false
  }

  private mouseMoveHandler(e: MouseEvent) {
    if (this.mouseDown) {
      // 选中方块的时候，移动平面
      if (this._square && !this.isShuffling) {
        this.cube.rotateOnePlane(this.mouseDownPos, new Vector2(e.clientX, e.clientY), this.camera, this._square, {
          width: this.domElement.width,
          height: this.domElement.height
        })
      }
      // 当没有选中方块的时候，移动cube
      else {
        // 计算移动向量位置
        const moveVector = new Vector2(e.movementX, -e.movementY)

        // 因为鼠标移动的时候物体是以垂直于移动向量的法向量作为轴转动的
        const rotateDir = moveVector.rotateAround(new Vector2(0, 0), Math.PI / 2).normalize()

        rotateAroundWorldAxis(this.cube, new Vector3(rotateDir.x, rotateDir.y), this.rotateSpeed)
      }
      this.renderer.render(this.scene, this.camera)
    }
  }

  private touchStartHandler(e: TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0]
    this.touchStartPos = new Vector2(touch.clientX, touch.clientY)
    this._square = this.getSquareClicked(e)
  }

  private touchEndHandler() {
    if (this._square && !this.isShuffling) {
      this.cube.afterRotate()
      this._square = null
      this.renderer.render(this.scene, this.camera)
    }
  }

  private touchMoveHandler(e: TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0]
    // Calculate movement vector
    const moveVector = new Vector2(touch.clientX - this.touchStartPos.x, this.touchStartPos.y - touch.clientY)

    if (this._square && !this.isShuffling) {
      this.cube.rotateOnePlane(this.touchStartPos, new Vector2(touch.clientX, touch.clientY), this.camera, this._square, {
        width: this.domElement.width,
        height: this.domElement.height
      })
    } else {
      const rotateDir = moveVector.rotateAround(new Vector2(0, 0), Math.PI / 2).normalize()

      rotateAroundWorldAxis(this.cube, new Vector3(rotateDir.x, rotateDir.y), this.rotateSpeed)
    }

    this.renderer.render(this.scene, this.camera)
  }
}
