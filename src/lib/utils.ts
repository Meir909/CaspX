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
  const canvas = await cropImageToCanvas(file, options)
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

export async function resizeImageToFile(
  file: File,
  options: {
    width: number
    height: number
    quality?: number
    fileName?: string
  },
) {
  const canvas = await cropImageToCanvas(file, options)
  const blob = await canvasToBlob(canvas, options.quality ?? 0.86)

  return new File([blob], options.fileName || ensureJpegFileName(file.name), {
    type: 'image/jpeg',
  })
}

export async function createImageCollageDataUrl(
  files: File[],
  options: {
    width: number
    height: number
    quality?: number
  },
) {
  if (!files.length) return ''

  if (files.length === 1) {
    return cropAndResizeImage(files[0], options)
  }

  const images = await Promise.all(files.map((file) => readFileAsDataUrl(file).then(loadImage)))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return cropAndResizeImage(files[0], options)
  }

  canvas.width = options.width
  canvas.height = options.height

  context.fillStyle = '#081120'
  context.fillRect(0, 0, canvas.width, canvas.height)

  const gap = 12
  const isThree = images.length >= 3
  const leftWidth = isThree ? Math.round(canvas.width * 0.56) : Math.floor((canvas.width - gap * 3) / 2)
  const rightWidth = canvas.width - leftWidth - gap * 3

  drawCoverImage(context, images[0], gap, gap, leftWidth, canvas.height - gap * 2)

  if (images[1]) {
    const secondHeight = isThree ? Math.floor((canvas.height - gap * 3) / 2) : canvas.height - gap * 2
    drawCoverImage(context, images[1], leftWidth + gap * 2, gap, rightWidth, secondHeight)
  }

  if (images[2]) {
    const tileHeight = Math.floor((canvas.height - gap * 3) / 2)
    drawCoverImage(context, images[2], leftWidth + gap * 2, tileHeight + gap * 2, rightWidth, tileHeight)
  }

  return canvas.toDataURL('image/jpeg', options.quality ?? 0.82)
}

function ensureJpegFileName(fileName: string) {
  const normalized = fileName.replace(/\.[^.]+$/, '')
  return `${normalized || 'image'}.jpg`
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      quality,
    )
  })
}

async function cropImageToCanvas(
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
    throw new Error('Canvas context is not available')
  }

  canvas.width = options.width
  canvas.height = options.height

  drawCoverImage(context, image, 0, 0, options.width, options.height)
  return canvas
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceRatio = image.width / image.height
  const targetRatio = width / height

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

  context.drawImage(image, offsetX, offsetY, cropWidth, cropHeight, x, y, width, height)
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = source
  })
}
