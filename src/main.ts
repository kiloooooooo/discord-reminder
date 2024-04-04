import { Client, Events } from 'discord.js'
import { configDotenv } from 'dotenv'
import { logger } from './utils/logger'
import { defaultErrorHandlers } from './commands/default-error-handlers'
import { deleteAllCommands, deployCommands } from './utils/command-deployer'
import remindCommand from './commands/remind'
import remindInteraction from './interactions/remind'
import RemindersDBWrapper from './db/wrapper'
import schedule from 'node-schedule'
import listReminder from './commands/list-reminder'
import { getReminderSender } from './utils/send-reminder'
import cancelReminder from './commands/cancel-reminder'

async function main() {
    const env = configDotenv()
    if (!env.parsed) {
        logger.fatal('Error loading .env file')
        return
    }

    const discordToken = env.parsed['DISCORD_TOKEN']
    const appID = env.parsed['DISCORD_APP_ID']
    const guildID = env.parsed['DISCORD_GUILD_ID']
    const client = new Client({ intents: [] })

    await RemindersDBWrapper.getInstance().initDatabase()
    const undoneReminders = await RemindersDBWrapper.getInstance().queryReminders(new Date())
    undoneReminders.map(reminder => {
        console.log(reminder)
        schedule.scheduleJob(reminder.id, reminder.date, getReminderSender(reminder))
    })

    client.once(Events.ClientReady, readyClient => {
        logger.info('Client is running')
    })

    client.on(Events.InteractionCreate, async interaction => {
        if (interaction.isChatInputCommand()) {
            switch (interaction.commandName) {
                case remindCommand.data.name:
                    try {
                        await remindCommand.execute(interaction)
                    } catch (error) {
                        await defaultErrorHandlers(interaction, error)
                    }
                    break
                case listReminder.data.name:
                    try {
                        await listReminder.execute(interaction)
                    } catch (error) {
                        await defaultErrorHandlers(interaction, error)
                    }
                    break
                case cancelReminder.data.name:
                    try {
                        await cancelReminder.execute(interaction)
                    } catch (error) {
                        await defaultErrorHandlers(interaction, error)
                    }
                    break
                default:
                    await interaction.reply({ content: 'No such command', ephemeral: true })
                    break
            }
        } else if (interaction.isButton()) {
            switch (interaction.customId) {
                case 'done':
                    await remindInteraction.done(interaction)
                    break
                case 'snooze':
                    await remindInteraction.snooze(interaction)
                    break
                default:
                    break
            }
        } else if (interaction.isModalSubmit()) {
            await remindInteraction.snoozeModalSubmit(interaction)
        }
    })

    await deployCommands(discordToken, appID, guildID)
    await client.login(discordToken)

    const cleanup = () => {
        logger.info('Cleaning up...')
        deleteAllCommands(discordToken, appID, guildID)
        client.user?.setStatus('invisible')
        client.destroy()
        // Object.entries(scheduledJobs).map((entry => entry[1].cancel()))
        schedule.gracefulShutdown()
    }

    process.addListener('SIGTERM', cleanup)
    process.addListener('SIGINT', cleanup)
}

main().then(() => {
})
