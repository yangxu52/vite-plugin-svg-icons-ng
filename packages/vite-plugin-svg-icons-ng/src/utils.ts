import { createHash } from 'node:crypto'

export function getWeakETag(str: string) {
  return str.length === 0 ? 'W/"2jmj7l5rSw0yVb/vlWAYkK/YBwk="' : `W/"${createHash('sha1').update(str, 'utf8').digest('base64')}"`
}
