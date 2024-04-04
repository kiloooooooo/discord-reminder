import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import RemindersDBWrapper from '../db/wrapper'
import { scheduledJobs } from 'node-schedule'

export default {
    data: new SlashCommandBuilder()
        .setName('cancel-reminder')
        .setDescription('リマインダーをキャンセル')
        .addNumberOption(option =>
            option
                .setName('id')
                .setDescription('リマインダーID')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const id = interaction.options.getNumber('id')!
        const cancelledReminder = await RemindersDBWrapper.getInstance().deleteReminder(id.toString())

        scheduledJobs[cancelledReminder.id].cancel()

        await interaction.reply({
            content: `キャンセルされました:\n\`${cancelledReminder.id}\`\n> ${cancelledReminder.message}`
        })
    }
}
