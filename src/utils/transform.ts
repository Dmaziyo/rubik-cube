import { Matrix4, Object3D, Vector3 } from 'three'

export function rotateAroundWorldAxis(object: Object3D, axis: Vector3, radians: number) {
  const mat = new Matrix4()
  // 让矩阵绕axis为轴旋转radians变成transform matrix
  mat.makeRotationAxis(axis, radians)
  //   注意不能交换
  object.matrix.premultiply(mat)

  //   让物体旋转
  object.rotation.setFromRotationMatrix(object.matrix)
}
