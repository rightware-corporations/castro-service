/** Projects coordinates onto the same centred cover image used by the flat preview. */
export function projectPanoramaPoint(yaw: number, pitch: number, imageWidth: number, imageHeight: number, width: number, height: number, zoom: number) {
  if (![yaw, pitch, imageWidth, imageHeight, width, height, zoom].every(Number.isFinite) || Math.min(imageWidth, imageHeight, width, height, zoom) <= 0) return null
  const scale = Math.max(width / imageWidth, height / imageHeight) * zoom
  const x = (((yaw + 180) % 360) + 360) % 360 / 360
  const y = (90 - Math.max(-90, Math.min(90, pitch))) / 180
  const left = width / 2 + (x - .5) * imageWidth * scale
  const top = height / 2 + (y - .5) * imageHeight * scale
  if (left < 0 || left > width || top < 0 || top > height) return null
  return { left, top }
}
