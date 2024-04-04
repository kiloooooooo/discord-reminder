import { REST, Routes } from 'discord.js'
import { logger } from './logger'
import { configDotenv } from 'dotenv'
import remind from '../commands/remind'
import listReminder from '../commands/list-reminder'
import cancelReminder from '../commands/cancel-reminder'

export async function deployCommands(token: string, appID: string, guildID: string) {
    const env = configDotenv()
    if (!env.parsed) {
        logger.fatal('Error loading .env file')
        return
    }

    const commands = [
        remind.data.toJSON(),
        listReminder.data.toJSON(),
        cancelReminder.data.toJSON()
    ]
    const rest = new REST({ version: env.parsed['DISCORD_API_VERSION'] }).setToken(token)

    try {
        await rest.put(
            Routes.applicationGuildCommands(appID, guildID),
            { body: commands }
        )
        logger.info(`Commands registered: ${commands.map(cmd => cmd.name)}`)
    } catch (error) {
        logger.error(`Failed to register the command: ${error}`)
    }
}

export async function deleteAllCommands(token: string, appID: string, guildID: string) {
    const env = configDotenv()
    if (!env.parsed) {
        logger.fatal('Error loading .env file')
        return
    }
    const rest = new REST({ version: env.parsed['DISCORD_API_VERSION'] }).setToken(token)
    try {
        await rest.put(Routes.applicationGuildCommands(appID, guildID), { body: [] })
        logger.info('Successfully deleted all the application commands')
    } catch (error) {
        logger.error(`Error deleting application commands: ${error}`)
    }
}
