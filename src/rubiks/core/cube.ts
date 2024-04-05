import { Box3, Color, ColorRepresentation, Group, Vector2, Vector3 } from 'three'
import { createSquare } from './square'

const colors: ColorRepresentation[] = ['white', 'red', 'orange', 'yellow', 'green', 'blue']

export const createCube = () => {
  const squarePos: Vector2[] = []
  const gridSize = 1.1
  for (let x = gridSize; x >= -gridSize; x -= gridSize) {
    for (let y = gridSize; y >= -gridSize; y -= gridSize) {
      squarePos.push(new Vector2(x, y))
    }
  }
  const planes: Group[] = []
  for (let i = 0; i < colors.length; i++) {
    planes.push(createPlane(colors[i], squarePos))
  }
  // 计算平面的尺寸
  const size = new Vector3()
  let box = new Box3().setFromObject(planes[0])
  box.getSize(size)

  const length = size.x
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

  for (let i = 0; i < planes.length; i++) {
    if (!!transforms[i].rotateX) {
      planes[i].rotateX(transforms[i].rotateX)
    } else {
      planes[i].rotateY(transforms[i].rotateY)
    }
    planes[i].translateZ(length / 2)
  }
  return planes.reduce((acc, cur) => acc.add(cur), new Group())
}

const createPlane = (color: ColorRepresentation, squarePos: Vector2[]) => {
  const plane: Group = new Group()
  for (let i = 0; i < squarePos.length; i++) {
    const square = createSquare(new Color(color))
    square.translateX(squarePos[i].x)
    square.translateY(squarePos[i].y)
    plane.add(square)
  }
  return plane
}
