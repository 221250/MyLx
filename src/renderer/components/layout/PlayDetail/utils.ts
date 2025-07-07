import ColorThief from 'color-thief-browser'
import { appSetting } from '@renderer/store/setting'  // 修改这行


interface ColorResult {
  dominant: [number, number, number]
  textColor: string
  isDark: boolean
}

const colorCache = new Map<string, ColorResult>()

const calculateBrightness = (r: number, g: number, b: number): number => {
  return (r * 299 + g * 587 + b * 114) / 1000
}

export const getImageColors = async (imgUrl: string): Promise<ColorResult | null> => {
  if (!imgUrl) return null
  if (colorCache.has(imgUrl)) return colorCache.get(imgUrl)!

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
      try {
        const colorThief = new ColorThief()
        const color = colorThief.getColor(img)
        const brightness = calculateBrightness(color[0], color[1], color[2])
        const isDark = brightness < 128

        const result = {
          dominant: color,
          textColor: isDark ? '#ffffff' : '#000000',
          isDark
        }
        
        colorCache.set(imgUrl, result)
        resolve(result)
      } catch (err) {
        console.warn('Failed to extract color:', err)
        resolve(null)
      }
    }

    img.onerror = () => resolve(null)

    img.src = imgUrl
  })
}
