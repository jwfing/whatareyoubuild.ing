import { contentOg, ogSize, ogContentType } from '@/lib/content-og'
export const size = ogSize
export const contentType = ogContentType
export default function Image() {
  return contentOg('GUIDES', 'Playbooks for builders')
}
