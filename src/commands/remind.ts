import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { parseDateWithMultiFormats } from '../utils/date-parser'
import { afterFrom, InvalidTimeFormat, parseAfterTime } from '../utils/after-time-parser'
import Reminder from '../db/models/reminder'
import RemindersDBWrapper from '../db/wrapper'
import { scheduleJob } from 'node-schedule'
import { getReminderSender } from '../utils/send-reminder'
import { formatToTimeZone } from 'date-fns-timezone'

export default {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('リマインダーを作成')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('リマインダーの内容')
                .setRequired(true)
        )
        .addMentionableOption(option =>
            option
                .setName('mention')
                .setDescription('通知時に付加するメンション')
        )
        .addStringOption(option =>
            option
                .setName('at')
                .setDescription('リマインドする時刻')
        )
        .addStringOption(option =>
            option
                .setName('after')
                .setDescription('現在時刻からリマインドするまでの時間')
        )
        .addStringOption(option =>
            option
                .setName('repeat_cycle')
                .setDescription('繰り返す周期')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const at = interaction.options.getString('at')
        const after = interaction.options.getString('after')
        const repeatCycle = interaction.options.getString('repeat_cycle')
        const mention = interaction.options.getMentionable('mention')
        const message = interaction.options.getString('message')!

        // atとafterが同時に指定されたらエラー
        if (at && after) {
            await interaction.reply({
                content: 'エラー: 引数`at`と`after`を同時に指定することはできません',
                ephemeral: true
            })
        }
        // 両方指定されていなくてもエラー
        else if (!(at || after)) {
            await interaction.reply({
                content: 'エラー: 引数`at`か`after`のいずれかを指定してください',
                ephemeral: true
            })
        } else {
            const now = new Date()
            await interaction.deferReply()
            // const channel = await (interaction.member as GuildMember).guild.channels.fetch(interaction.channelId) as TextBasedChannel
            const channelId = interaction.channelId

            try {
                if (repeatCycle) {
                    // 繰り返し周期が正常にパースできるか確認
                    parseAfterTime(repeatCycle)
                }
                const remindAt = at ? parseDateWithMultiFormats(at) : afterFrom(parseAfterTime(after!), now)
                const reminder = new Reminder(now.getTime().toString(), remindAt, mention?.toString(), message, channelId, repeatCycle || undefined)
                await RemindersDBWrapper
                    .getInstance()
                    .addReminder(reminder)
                // scheduleJob(remindAt, function () {
                //     channel.send(reminder.messageWithMention)
                // }.bind(channel))
                scheduleJob(reminder.id, remindAt, getReminderSender(reminder))

                const remindAtDisplay = formatToTimeZone(remindAt, 'YY/MM/DD HH:mm:ss', { timeZone: 'Asia/Tokyo' })
                const repeatCycleDisplay = repeatCycle ? `(繰り返し周期 \`${repeatCycle}\`)` : ''
                await interaction.editReply({
                    content: `\`${remindAtDisplay}\`に通知します${repeatCycleDisplay}:\n> ${message}`
                })
            } catch (error) {
                if (error instanceof InvalidTimeFormat) {
                    await interaction.editReply(`エラー: ${error.message}`)
                }
            }
        }
    }
}
