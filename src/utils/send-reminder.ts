import Reminder from '../db/models/reminder'
import { sendMessage } from './rest-send-message'
import RemindersDBWrapper from '../db/wrapper'
import { afterFrom, parseAfterTime } from './after-time-parser'
import { scheduleJob } from 'node-schedule'

export function getReminderSender(reminder: Reminder) {
    return async () => {
        await sendMessage(reminder.messageDisplayStyle, reminder.channelId)

        // repeatCycleが設定されていれば再作成
        if (reminder.repeatCycleNotation) {
            const nextRemindAt = afterFrom(parseAfterTime(reminder.repeatCycleNotation), reminder.date)
            const nextReminder = new Reminder(
                (new Date()).getTime().toString(),
                nextRemindAt,
                reminder.mention,
                reminder.message,
                reminder.channelId,
                reminder.repeatCycleNotation
            )
            await RemindersDBWrapper
                .getInstance()
                .addReminder(nextReminder)

            scheduleJob(nextReminder.id, nextRemindAt, getReminderSender(nextReminder))
        }
    }
}
