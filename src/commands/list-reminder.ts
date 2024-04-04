import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import RemindersDBWrapper from '../db/wrapper'
import { formatToTimeZone } from 'date-fns-timezone'
import Reminder from '../db/models/reminder'

export default {
    data: new SlashCommandBuilder()
        .setName('list-reminders')
        .setDescription('リマインダー一覧')
        .addNumberOption(option =>
            option
                .setName('count')
                .setDescription('取得する件数')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const count = interaction.options.getNumber('count') || 5
        const dbWrapper = RemindersDBWrapper.getInstance()
        const reminders = await dbWrapper.queryReminders(new Date())

        if (reminders.length === 0) {
            await interaction.reply({
                content: 'リマインダーは登録されていません'
            })
            return
        }

        const displayReminder = (reminder: Reminder) => {
            const displayDate = formatToTimeZone(reminder.date, 'YY/MM/DD HH:mm:ss', { timeZone: 'Asia/Tokyo' })
            return `\`${reminder.id}\`・at \`${displayDate}\`\n${reminder.message}`
        }

        const message = reminders
            .slice(0, count)
            .map(displayReminder)
            .reduce((a, b) => `${a}\n\n${b}`)
        await interaction.reply({ content: message, ephemeral: true })
    }
}
