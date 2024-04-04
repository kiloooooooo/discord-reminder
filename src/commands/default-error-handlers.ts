import { ChatInputCommandInteraction } from 'discord.js'
import { logger } from '../utils/logger'

export async function defaultErrorHandlers(interaction: ChatInputCommandInteraction, error: any) {
    logger.error(error)
    const msgContent = 'コマンドの実行に失敗'

    const msg = { content: msgContent, ephemeral: true }
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg)
    } else {
        await interaction.reply(msg)
    }
}
