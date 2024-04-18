import { ColorRepresentation, Vector3 } from "three"

type CubeColor = [
  ColorRepresentation,
  ColorRepresentation,
  ColorRepresentation,
  ColorRepresentation,
  ColorRepresentation,
  ColorRepresentation
]
export interface CubeElement {
  color: ColorRepresentation
  pos: Vector3
  normal: Vector3
}

class CubeData {
  public elements: CubeElement[] = []

  public _size = 1
  private cubeOrder: number
  private colors: CubeColor
  constructor(cubeOrder = 3, colors: CubeColor = ['white', 'red', 'orange', 'yellow', 'green', 'blue']) {
    this.cubeOrder = cubeOrder
    this.colors = colors
    this.initElements()
  }
  private initElements() {

    // 由左上角方块的中心点开始，根据阶数来遍历生成，参考：https://zhuanlan.zhihu.com/p/33580374
    const leftUp = -(this.cubeOrder * this._size) / 2+this._size/2 
    for (let i = 0; i < this.cubeOrder; i++) {
      for (let j = 0; j < this.cubeOrder; j++) {
        this.elements.push({
          color: this.colors[0],
          pos: new Vector3(leftUp + i * this._size, leftUp + j * this._size, (this.cubeOrder * this._size) / 2),
          normal: new Vector3(0, 0, 1) //前
        })
        this.elements.push({
          color: this.colors[1],
          pos: new Vector3(leftUp + i * this._size, leftUp + j * this._size, -(this.cubeOrder * this._size) / 2),
          normal: new Vector3(0, 0, -1) //后
        })

        this.elements.push({
          color: this.colors[2],
          pos: new Vector3(-(this.cubeOrder * this._size) / 2, leftUp + i * this._size, leftUp + j * this._size),
          normal: new Vector3(-1, 0, 0) //左
        })

        this.elements.push({
          color: this.colors[3],
          pos: new Vector3((this.cubeOrder * this._size) / 2,leftUp + i * this._size, leftUp + j * this._size),
          normal: new Vector3(1, 0, 0) //右
        })

        this.elements.push({
          color: this.colors[4],
          pos: new Vector3(leftUp + i * this._size,(this.cubeOrder * this._size) / 2, leftUp + j * this._size),
          normal: new Vector3(0, 1, 0) //上
        })
        this.elements.push({
          color: this.colors[5],
          pos: new Vector3(leftUp + i * this._size,-(this.cubeOrder * this._size) / 2, leftUp + j * this._size),
          normal: new Vector3(0, -1, 0) //下
        })
      }
    }
  }
}

export default CubeData
