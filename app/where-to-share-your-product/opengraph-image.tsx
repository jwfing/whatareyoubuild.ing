import { contentOg, ogSize, ogContentType } from '@/lib/content-og'
export const size = ogSize
export const contentType = ogContentType
export default function Image() {
  return contentOg('GUIDE', 'Where to share what you are building')
}
