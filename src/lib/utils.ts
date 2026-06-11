import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export async function cropAndResizeImage(
  file: File,
  options: {
    width: number
    height: number
    quality?: number
  },
) {
  const source = await readFileAsDataUrl(file)
  const image = await loadImage(source)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return source
  }

  canvas.width = options.width
  canvas.height = options.height

  const sourceRatio = image.width / image.height
  const targetRatio = options.width / options.height

  let cropWidth = image.width
  let cropHeight = image.height
  let offsetX = 0
  let offsetY = 0

  if (sourceRatio > targetRatio) {
    cropWidth = image.height * targetRatio
    offsetX = (image.width - cropWidth) / 2
  } else {
    cropHeight = image.width / targetRatio
    offsetY = (image.height - cropHeight) / 2
  }

  context.drawImage(
    image,
    offsetX,
    offsetY,
    cropWidth,
    cropHeight,
    0,
    0,
    options.width,
    options.height,
  )

  return canvas.toDataURL('image/jpeg', options.quality ?? 0.9)
}

export async function readFilesAsDataUrls(
  files: File[],
  options: {
    width: number
    height: number
    quality?: number
  },
) {
  return Promise.all(files.map((file) => cropAndResizeImage(file, options)))
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = source
  })
}
