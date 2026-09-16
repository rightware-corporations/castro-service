import { describe, expect, it } from 'vitest'
import { projectPanoramaPoint } from './panoramaGeometry'
describe('flat panorama cover geometry', () => {
  it('keeps the centre fixed while zooming', () => {
    expect(projectPanoramaPoint(0, 0, 2000, 1000, 1000, 600, 2)).toEqual({ left: 500, top: 300 })
  })
  it('accounts for cover crop and moves a point with zoom', () => {
    expect(projectPanoramaPoint(90, 0, 2000, 1000, 1000, 600, 1)).toEqual({ left: 800, top: 300 })
    expect(projectPanoramaPoint(90, 0, 2000, 1000, 1000, 600, 1.5)).toEqual({ left: 950, top: 300 })
    expect(projectPanoramaPoint(90, 0, 2000, 1000, 1000, 600, 2)).toBeNull()
  })
  it('excludes points cropped out of a portrait viewport', () => {
    expect(projectPanoramaPoint(90, 0, 2000, 1000, 320, 600, 1)).toBeNull()
    expect(projectPanoramaPoint(0, 45, 2000, 1000, 320, 600, 1)).toEqual({ left: 160, top: 150 })
  })
  it('rejects invalid measurements', () => {
    expect(projectPanoramaPoint(0, 0, 0, 1000, 320, 600, 1)).toBeNull()
    expect(projectPanoramaPoint(NaN, 0, 2000, 1000, 320, 600, 1)).toBeNull()
  })
})
