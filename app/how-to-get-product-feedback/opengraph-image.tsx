import { contentOg, ogSize, ogContentType } from '@/lib/content-og'
export const size = ogSize
export const contentType = ogContentType
export default function Image() {
  return contentOg('GUIDE', 'How to get honest feedback on your product')
}
