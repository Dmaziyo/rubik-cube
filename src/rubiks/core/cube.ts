import { Color, ColorRepresentation, Group, Vector2 } from 'three'
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
  //TODO rotate plane to create a cube
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
