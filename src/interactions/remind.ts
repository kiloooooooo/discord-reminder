import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonComponent,
    ButtonInteraction,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    Snowflake,
    TextBasedChannel,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'
import { afterFrom, InvalidTimeFormat, parseAfterTime } from '../utils/after-time-parser'
import Reminder from '../db/models/reminder'
import RemindersDBWrapper from '../db/wrapper'
import { scheduleJob } from 'node-schedule'
import { sendMessage } from '../utils/rest-send-message'
import { format } from 'date-fns'

export default {
    async done(interaction: ButtonInteraction) {

        let row = interaction.message.components[0];
        (row.components as any) = row.components.map(c =>
            ButtonBuilder.from(c as ButtonComponent).setDisabled(true)
        )
        await interaction.guild!.channels.fetch(interaction.channelId)
        await interaction.message.edit({ components: [row] })
        await interaction.reply({ content: '完了' })
    },
    async snooze(interaction: ButtonInteraction) {
        const reminderId = /^`(?<id>\d+)`/.exec(interaction.message.content)!.groups!.id
        const modal = new ModalBuilder()
            .setCustomId(`${reminderId}-${interaction.channelId}-${interaction.message.id}`)
            .setTitle('再通知設定')

        const timeInput = new TextInputBuilder()
            .setCustomId('snooze-time')
            .setLabel('再通知までの時間')
            .setStyle(TextInputStyle.Short)
            .setValue('5m00s')
            .setMaxLength(20)
            .setRequired(true)

        const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(timeInput)

        modal.addComponents(row)

        await interaction.showModal(modal)

        // let origRow = interaction.message.components[0];
        // (origRow.components as any) = origRow.components.map(c =>
        //     ButtonBuilder.from(c as ButtonComponent).setDisabled(true)
        // )
        // await interaction.editReply({ components: [origRow] })
    },
    async snoozeModalSubmit(interaction: ModalSubmitInteraction) {
        const now = new Date()

        await interaction.deferReply()

        const [reminderId, channelId, messageId] = interaction.customId.split('-')
        const thisReminder = await RemindersDBWrapper.getInstance().queryReminder(reminderId)

        const snoozeTimeString = interaction.fields.getTextInputValue('snooze-time')!
        try {
            const remindAt = afterFrom(parseAfterTime(snoozeTimeString), now)

            const reminder = new Reminder(
                now.getTime().toString(),
                remindAt,
                thisReminder.mention,
                thisReminder.message,
                thisReminder.channelId,
                thisReminder.repeatCycleNotation
            )

            await RemindersDBWrapper.getInstance().addReminder(reminder)
            scheduleJob(remindAt, () => {
                sendMessage(reminder.messageDisplayStyle, reminder.channelId)
            })

            await interaction.editReply(`${format(remindAt, 'yy/MM/dd hh:mm:ss')}に再通知します`)

            // ActionRowを無効化
            // let origRow = interaction.message.components[0];
            const channel = await interaction.guild!.channels.fetch(channelId) as TextBasedChannel
            const origMessage = await channel.messages.fetch(messageId as Snowflake);
            let origRow = origMessage.components[0];
            (origRow.components as any) = origRow.components.map(c =>
                ButtonBuilder.from(c as ButtonComponent).setDisabled(true)
            )
            await origMessage.edit({ components: [origRow] })
        } catch (error) {
            if (error instanceof InvalidTimeFormat) {
                await interaction.editReply(`エラー: 誤ったフォーマットです: ${snoozeTimeString}`)
            }
        }
    }
}
