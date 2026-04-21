import { PLUGIN_NAME } from '../constants'
import type { PluginContext } from '../types'

type LoggerContext = Pick<PluginContext, 'logger'>

export function warn(ctx: LoggerContext, message: string): void {
  const normalized = `[${PLUGIN_NAME}] ${message}`
  if (ctx.logger) {
    ctx.logger.warn(normalized)
    return
  }
  // eslint-disable-next-line no-console
  console.warn(normalized)
}
