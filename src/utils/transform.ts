import { Camera, Matrix4, Object3D, Vector2, Vector3 } from 'three'
import { SquareMesh } from '../rubiks/core/square'

export function rotateAroundWorldAxis(object: Object3D, axis: Vector3, radians: number) {
  const mat = new Matrix4()
  // 让矩阵绕axis为轴旋转radians变成transform matrix
  mat.makeRotationAxis(axis, radians)
  //   注意不能交换
  object.matrix.premultiply(mat)

  //   让物体旋转
  object.rotation.setFromRotationMatrix(object.matrix)
}

export function ndcToScreen(x: number, y: number, winW: number, winH: number) {
  return new Vector2(((x + 1) * winW) / 2, -((y - 1) * winH) / 2)
}

// 将世界坐标转换成屏幕坐标
export function worldToScreen(pos: Vector3, camera: Camera, winSize: { width: number; height: number }) {
  // 转换成ndc坐标系
  pos.project(camera)
  // 转换成屏幕坐标
  return ndcToScreen(pos.x, pos.y, winSize.width, winSize.height)
}
export function getSquareScreenPos(square: SquareMesh, camera: Camera, winSize: { width: number; height: number }) {
  // 获取物体的世界坐标系位置，并转换成NDC坐标
  let vect3 = new Vector3()
  square.getWorldPosition(vect3)
  return worldToScreen(vect3, camera, winSize)
}

// 进行精度校准，0.9->1  0.1->0 0.53->0.5 1.49->1.5
export function roundToNearest(num: number) {
  return Math.round(num * 2) / 2
}
export function vector3Calibration(vect3: Vector3) {
  return new Vector3(roundToNearest(vect3.x), roundToNearest(vect3.y), roundToNearest(vect3.z))
}
