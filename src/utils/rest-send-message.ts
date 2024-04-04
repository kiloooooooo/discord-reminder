import { configDotenv } from 'dotenv'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, Snowflake } from 'discord.js'
import { logger } from './logger'

export async function sendMessage(message: string, channelId: Snowflake) {
    const env = configDotenv()
    if (!env.parsed) {
        throw new Error('Failed to read .env file!')
    }

    const token = env.parsed['DISCORD_TOKEN']
    const apiVersion = env.parsed['DISCORD_API_VERSION']

    const rest = new REST({ version: apiVersion }).setToken(token)

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setLabel('完了')
                .setCustomId('done')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setLabel('再通知')
                .setCustomId('snooze')
                .setStyle(ButtonStyle.Secondary)
        ])

    try {
        await rest.post(
            Routes.channelMessages(channelId), {
                body: {
                    content: message,
                    components: [actionRow]
                }
            }
        )
    } catch (error) {
        logger.error(`Error sending message via REST API: ${error}`)
    }
}
