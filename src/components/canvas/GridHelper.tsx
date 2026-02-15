import { useMemo } from 'react'
import * as THREE from 'three'

interface GridHelperProps {
  width: number
  height: number
  gridSize: number
}

export function GridHelper({ width, height, gridSize }: GridHelperProps) {
  const lines = useMemo(() => {
    const points: THREE.Vector3[] = []

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      points.push(new THREE.Vector3(x, 0, 0.001))
      points.push(new THREE.Vector3(x, -height, 0.001))
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      points.push(new THREE.Vector3(0, -y, 0.001))
      points.push(new THREE.Vector3(width, -y, 0.001))
    }

    return points
  }, [width, height, gridSize])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setFromPoints(lines)
    return geo
  }, [lines])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#ffffff" opacity={0.06} transparent />
    </lineSegments>
  )
}
