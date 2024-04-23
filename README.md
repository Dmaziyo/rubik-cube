**背景**：想学习一下three.js，并且做个魔方，同时把三阶魔方学会。 

**参考**:
- https://github.com/pengfeiw/rubiks-cube
- https://zhuanlan.zhihu.com/p/33580374

- [Todos](#todos)
- [问题](#问题)
    - [使用live with server无法访问js或者其他asset文件](#使用live-with-server无法访问js或者其他asset文件)
    - [初始环境配置](#初始环境配置)
    - [构建方块](#构建方块)
    - [构建平面](#构建平面)
    - [为了能够将平面组成一个正方体，需要根据平面的长度进行移动，如何计算平面呢？](#为了能够将平面组成一个正方体需要根据平面的长度进行移动如何计算平面呢)
    - [构建正方体](#构建正方体)
    - [引用插件出现路径错误](#引用插件出现路径错误)
    - [实现n阶魔方自动生成，因为之前写的是死的，只能生成三阶魔方](#实现n阶魔方自动生成因为之前写的是死的只能生成三阶魔方)
    - [魔法视角移动](#魔法视角移动)
    - [实现鼠标选中方块](#实现鼠标选中方块)
    - [如何通过mesh的世界坐标位置获取到浏览器二维屏幕坐标位置?](#如何通过mesh的世界坐标位置获取到浏览器二维屏幕坐标位置)
    - [确定需要旋转的平面](#确定需要旋转的平面)
    - [旋转方块](#旋转方块)
    - [更新方块状态](#更新方块状态)
    - [打包部署](#打包部署)
    - [如何实现shuffle旋转动画](#如何实现shuffle旋转动画)
    - [如何把方块空隙周围变黑，当前魔方只有在scene背景设置为黑色的时候才是正常颜色，其余情况都比较丑](#如何把方块空隙周围变黑当前魔方只有在scene背景设置为黑色的时候才是正常颜色其余情况都比较丑)
    - [魔方还原](#魔方还原)


## Todos
- [x] 搭建初始化环境
    - [x] ts环境
    - [x] web-dev-server作运行环境
- [x] 构建rubik-cube
  - [x] 构建方块
  - [x] 构建平面
  - [x] 构建魔方
  - [x] 缩放适配
  - [x] n阶魔方自动生成
  - [x] 魔方视角移动
- [x] 实现操作功能
  - [x] 鼠标选中方块
  - [x] 找出要旋转的方向
  - [x] 确认需要旋转的方块
  - [x] 旋转面
    - [x] 旋转方块
    - [x] 更新方块位置
- [x] 打乱操作
- [ ] 还原操作
- [ ] 更改阶数

## 问题

#### 使用live with server无法访问js或者其他asset文件
```
原因：live with server插件只能包含当前运行目录和子目录的文件，如果是目录外的，通过相邻方式是无法访问的。
参考:https://stackoverflow.com/questions/56808188/live-server-not-loading-css
```

#### 初始环境配置
```js
{
  "name": "rubik-cube-maziyo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "tsc:watch": "tsc --watch",
    "start": "concurrently --kill-others --names tsc,web-dev-server \"npm run tsc:watch\" \"web-dev-server --config web-dev-server.config.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/three": "^0.163.0",
    "@web/dev-server": "^0.4.3",
    "concurrently": "^8.2.2",
    "rimraf": "^5.0.5",
    "typescript": "^5.4.3"
  },
  "dependencies": {
    "three": "^0.163.0"
  }
}

```

#### 构建方块
```js
// 利用three.js提供的shape，在二维平面上构建东西,画好线后可以使用geometry构建形状
export const createSquare = (color: Color) => {
  const squareShape = new Shape()
  const x = 0,
    y = 0
  // top
  squareShape.moveTo(x - 0.4, y + 0.5)
  squareShape.lineTo(x + 0.4, y + 0.5)
  // 为了使得方块边缘更平滑,贝塞斯曲线，头次真正了解啊
  squareShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.5, y + 0.5, x + 0.5, y + 0.4)

  // right
  squareShape.lineTo(x + 0.5, y - 0.4)
  squareShape.bezierCurveTo(x + 0.5, y - 0.5, x + 0.5, y - 0.5, x + 0.4, y - 0.5)

  // bottom
  squareShape.lineTo(x - 0.4, y - 0.5)
  squareShape.bezierCurveTo(x - 0.5, y - 0.5, x - 0.5, y - 0.5, x - 0.5, y - 0.4)

  // left
  squareShape.lineTo(x - 0.5, y + 0.4)
  squareShape.bezierCurveTo(x - 0.5, y + 0.5, x - 0.5, y + 0.5, x - 0.4, y + 0.5)

  const geometry = new ShapeGeometry(squareShape)
  const material = new MeshBasicMaterial({ color })
  const mesh = new SquareMesh(geometry, material)
  return mesh
}
```
#### 构建平面
```js
// 根据小方块的位置生成平面
const createPlane = (color: ColorRepresentation, squarePos: Vector2[]) => {
  const square = createSquare(new Color(color))

  const plane: Group = new Group()
  for (let i = 0; i < squarePos.length; i++) {
    const squareClone = square.clone()
    squareClone.translateX(squarePos[i].x)
    squareClone.translateY(squarePos[i].y)
    plane.add(squareClone)
  }
  return plane
}
```
#### 为了能够将平面组成一个正方体，需要根据平面的长度进行移动，如何计算平面呢？
```js
// 使用box3来构建一个最小程度装下平面的盒子
// 参考：https://stackoverflow.com/questions/59493236/how-can-i-get-the-dimensions-of-a-three-js-group
  const size = new Vector3()
  let box = new Box3().setFromObject(plane)
  box.getSize(size)
  console.log(size)
```
#### 构建正方体
```js
  const transforms = [
    {
      rotateX: Math.PI * 0.5, // 上
      rotateY: 0
    },
    {
      rotateX: -Math.PI * 0.5, // 下
      rotateY: 0
    },
    {
      rotateX: 0,
      rotateY: Math.PI * 0.5 // 左
    },
    {
      rotateX: 0,
      rotateY: -Math.PI * 0.5 //右
    },
    {
      rotateX: 0, //前
      rotateY: 0
    },
    {
      rotateX: -Math.PI, //前
      rotateY: 0
    }
  ]
  //通过旋转平面，然后进行前后平移
  for (let i = 0; i < planes.length; i++) {
    if (!!transforms[i].rotateX) {
      planes[i].rotateX(transforms[i].rotateX)
    } else {
      planes[i].rotateY(transforms[i].rotateY)
    }
    //因为translate是相对于local space进行移动，无需调整
    planes[i].translateZ(length / 2)
  }
  return planes.reduce((acc, cur) => acc.add(cur), new Group())
```
#### 引用插件出现路径错误
```js
参考：https://discourse.threejs.org/t/error-relative-references-must-start-with-either-or/13573/18
他是看了官网别人的examples是如何使用cdn来引用插件的方法
    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.module.js",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/"
        }
      }
    </script>
通过写映射的方法来实现引入
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
export function log() {
  console.log(OrbitControls)
}

```

#### 实现n阶魔方自动生成，因为之前写的是死的，只能生成三阶魔方
```js
// 根据传入阶数来确定一个面的方块数
  private initElements() {

    // 由左上角方块的中心点开始，根据阶数来遍历生成，参考：https://zhuanlan.zhihu.com/p/33580374
    const leftUp = -(this.cubeOrder * this._size) / 2+this._size/2 
    for (let i = 0; i < this.cubeOrder; i++) {
      for (let j = 0; j < this.cubeOrder; j++) {
        this.elements.push({
          color: this.colors[0],
          pos: new Vector3(leftUp + i * this._size, leftUp + j * this._size, (this.cubeOrder * this._size) / 2),
          direction: new Vector3(0, 0, 1) //前
        })
        this.elements.push({
          color: this.colors[1],
          pos: new Vector3(leftUp + i * this._size, leftUp + j * this._size, -(this.cubeOrder * this._size) / 2),
          direction: new Vector3(0, 0, -1) //后
        })

        this.elements.push({
          color: this.colors[2],
          pos: new Vector3(-(this.cubeOrder * this._size) / 2, leftUp + i * this._size, leftUp + j * this._size),
          direction: new Vector3(-1, 0, 0) //左
        })

        this.elements.push({
          color: this.colors[3],
          pos: new Vector3((this.cubeOrder * this._size) / 2,leftUp + i * this._size, leftUp + j * this._size),
          direction: new Vector3(1, 0, 0) //右
        })

        this.elements.push({
          color: this.colors[4],
          pos: new Vector3(leftUp + i * this._size,(this.cubeOrder * this._size) / 2, leftUp + j * this._size),
          direction: new Vector3(0, 1, 0) //上
        })
        this.elements.push({
          color: this.colors[5],
          pos: new Vector3(leftUp + i * this._size,-(this.cubeOrder * this._size) / 2, leftUp + j * this._size),
          direction: new Vector3(0, -1, 0) //下
        })
      }
    }
  }
```
#### 魔法视角移动
```js
/* 一开始想使用orbitControl来着，但是orbitControl无法360°旋转，然后看了下参考项目的源码，发现是自己写了一个视角控制器
   然后在网上搜了下，发现还有个提供的controls trackballControls能够360°旋转，但是不会写多个控制器的操作逻辑，不知道怎么解决后续方块移动，所以还是参考源码的写吧
*/ 
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
export function rotateAroundWorldAxis(object: Object3D, axis: Vector3, radians: number) {
  const mat = new Matrix4()
  // 让矩阵绕axis为轴旋转radians变成transform matrix
  mat.makeRotationAxis(axis, radians)
  //   注意不能交换
  object.matrix.premultiply(mat)

  //   让物体旋转
  object.rotation.setFromRotationMatrix(object.matrix)
}
```

#### 实现鼠标选中方块
```js
// 使用raycaster
  private mouseDownHandler(e: MouseEvent) {
    this.mouseDown = true

    // 将其转换为NDC坐标,因为当前坐标是以左上角为(0,0)开头的,要转换为中心为(0,0)并且左右范围为[-1,1]的坐标
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(new Vector2(x, y), this.camera)

    // calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children)

    if (intersects.length > 0) {
      // Intersections are returned sorted by distance, closest first.
      ;(intersects[0].object as SquareMesh).material.color.set(Math.random() * 0xff0000)
      this.renderer.render(this.scene, this.camera)
    }
  }
```

#### 如何通过mesh的世界坐标位置获取到浏览器二维屏幕坐标位置?
```js
//通过mesh的世界坐标位置进行camera投射，然后将标准坐标转换成屏幕坐标即可
// 参考：https://discourse.threejs.org/t/how-to-converting-world-coordinates-to-2d-mouse-coordinates-in-threejs/2251/2
  function getSquareScreenPos(square: SquareMesh, camera: Camera, winSize: { w: number; h: number }) {
    if (!this.squares.includes(square)) {
      return null
    }

    const { w, h } = winSize
    let vect3 = new Vector3()
    square.getWorldPosition(vect3)
    vect3.project(camera)
    vect3.x = ((vect3.x + 1) * winSize.w) / 2
    vect3.y = (-(vect3.y - 1) * winSize.h) / 2
    vect3.z = 0

    return {
      x: vect3.x,
      y: vect3.y
    }
  }
```
#### 确定需要旋转的平面
```js

      let miniAngle = scrollDir.angleTo(rotateDirections[0].scrollDir)
      let rotateDir = rotateDirections[0]
      for (let i = 1; i < rotateDirections.length; i++) {
        let curAngle = scrollDir.angleTo(rotateDirections[i].scrollDir)
        if (miniAngle > curAngle) {
          miniAngle = curAngle
          rotateDir = rotateDirections[i]
        }
      }
      // 旋转轴：通过叉积计算同时垂直于法向量和旋转向量的向量
      const rotateDirLocal = rotateDir.endSquare.position.clone().sub(rotateDir.startSquare.position).normalize() //在local space中旋转的方向
      const rotateAxis = squareNormal.cross(rotateDirLocal)


      // 因为生成的方块是平面,不是立体的，所以需要通过innerPos来确认中心
      // 旋转方块：通过找controlSquare的innerPos到其他方块的innerPos组成的向量与旋转轴是垂直的
      const controlInnerPos = getInnerPos(controlSquare, this.cubeData._size)
      const rotateSquares = this.squares.filter(square => {
        const tempInner = getInnerPos(square, this.cubeData._size)
        const vect = tempInner.clone().sub(controlInnerPos)
        return vect.dot(rotateAxis) === 0
      })
```
#### 旋转方块
```js
    const rotateAxisLocal = this.state.rotateAxisLocal!
    const rotateSquares = this.state.rotateSquares
    const rotateDir = this.state.rotateDir!

    // 旋转的角度=投影的长度/魔方宽度*90°，旋转弧度可以自定义
    // 投影：屏幕滑动方向在旋转方向上的投影,这也就是计算屏幕距离的另外一个用处
    const projLen = Math.cos(scrollDir.angleTo(rotateDir.scrollDir)) * scrollDir.length()
    const cubeSize = this.getCubeScreenSize(camera, winSize)
    // 因为scrollDir一直是从down到move计算的，是累加的，所以这个计算得出的是总共旋转角度
    const angleRotated = ((projLen / cubeSize) * Math.PI) / 2
    // 需要旋转的角度

    const rotateAngle = angleRotated - this.state.angleRotated
    this.state.angleRotated = angleRotated
    console.log(rotateAngle)

    // 使用transform 矩阵来旋转方块
    const rotateMat = new Matrix4().makeRotationAxis(rotateAxisLocal, rotateAngle)

    rotateSquares.forEach(square => {
      square.applyMatrix4(rotateMat)
      square.updateMatrix()
    })
```

#### 更新方块状态
```js
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
```

#### 打包部署
```js
打包参考文档：https://open-wc.org/docs/building/rollup/
照着文档复制粘贴然后配置入口文件即可
部署参考：https://github.com/JamesIves/github-pages-deploy-action
  "scripts": {
    "tsc:watch": "tsc --watch",
    "start": "concurrently --kill-others --names tsc,web-dev-server \"npm run tsc:watch\" \"web-dev-server --config web-dev-server.config.js",
    "build": "rimraf dist && tsc && rollup -c rollup.config.js"
  },

  //workflow
  name: Build and Deploy
on:
  push:
    branches:
      - main
permissions:
  contents: write
jobs:
  build-and-deploy:
    concurrency: ci-${{ github.ref }} # Recommended if you intend to make multiple deployments in quick succession.
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install and Build 🔧 # This example project is built using npm and outputs the result to the 'build' folder. Replace with the commands required to build your project, or remove this step entirely if your site is pre-built.
        run: |
          npm i
          npm run build

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist

```
#### 如何实现shuffle旋转动画
```js
// 参考：https://github.com/Aaron-Bird/rubiks-cube
//随机选取一个方块，然后计算可能的方向，然后随机选取，最后再从-180-180旋转
    const controlSquare = this.squares[Math.floor(Math.random() * this.squares.length)]
    rotateDir = rotateDirections[Math.floor(Math.random() * rotateDirections.length)]
    const rotateAngle = Math.random() > 0.5 ? Math.PI * (Math.random() * 0.5 + 0.5) : -Math.PI * (Math.random() * 0.5 + 0.5)
// 旋转动画，使用tween.js提供的方法来实现补间效果
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
```
#### 如何把方块空隙周围变黑，当前魔方只有在scene背景设置为黑色的时候才是正常颜色，其余情况都比较丑
```js
// 在mesh的local space添加一个黑色方块
  const material2 = new MeshBasicMaterial({
    color: 'black',
    side: DoubleSide
  })

  const plane = new Mesh(geometry, material2)
  // 移动靠后一点，防止重叠
  plane.position.set(0, 0, -0.1) 
  // 盖住整个魔方
  plane.scale.copy(new Vector3(1.1, 1.1, 1.1)) 
  mesh.scale.copy(scale)
  mesh.add(plane)
```

#### 魔方还原
```js
// 将方块数据重置，然后再把scene清空，重新添加
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
```