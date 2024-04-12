import { Group } from 'three'
import { createSquare } from './square'
import CubeData from './cubeData'


export class Cube extends Group {
  private cubeData: CubeData

  constructor(order = 3) {
    super()
    this.cubeData = new CubeData(order)
    this.cubeData.elements.forEach((el)=>{
      const square = createSquare(el.color,el);
      this.add(square)
    })
  }
}
