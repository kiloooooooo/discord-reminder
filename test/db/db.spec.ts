import RemindersDBWrapper from '../../src/db/wrapper'
import { Database } from 'sqlite3'
import Reminder from '../../src/db/models/reminder'
import * as fs from 'fs'

describe('データベース操作', () => {
    const dbFilePath = 'database/mock_reminders.db'
    let db: Database = new Database(dbFilePath)
    let dbWrapper: RemindersDBWrapper = RemindersDBWrapper.getInstance(db)

    beforeEach(done => {
        dbWrapper.initDatabase().then(done)
    })

    afterEach(done => {
        db.run('DROP TABLE reminders', done)
    })

    afterAll(done => {
        db.close(() => {
            fs.unlinkSync(dbFilePath)
            done()
        })
    })

    test('リマインダーを追加できる', async () => {
        await dbWrapper.addReminder(new Reminder(new Date(), undefined, 'hoge', ''), new Date())
        db.all('SELECT * FROM reminders', (err, rows) => {
            expect(err).toBeNull()
            expect(rows.length).toBe(1)
        })
    })

    test('リマインダーを取得できる', async () => {
        await dbWrapper.addReminder(new Reminder(new Date(), undefined, 'hoge', ''), new Date())
        const reminders = await dbWrapper.queryReminders()
        expect(reminders.length).toBe(1)
    })

    test('複数のリマインダーを追加/取得できる', async () => {
        await dbWrapper.addReminder(
            new Reminder(new Date(), undefined, 'hoge', ''),
            new Date(2024, 3, 1, 8, 0, 0)
        )
        await dbWrapper.addReminder(
            new Reminder(new Date(), undefined, 'hoge', ''),
            new Date(2024, 3, 1, 8, 0, 4)
        )

        const reminders = await dbWrapper.queryReminders()
        expect(reminders.length).toBe(2)
    })

    test('ある時刻以降のリマインダーを取得できる', async () => {
        await dbWrapper.addReminder(
            new Reminder(new Date(2024, 3, 1, 8, 0, 1), undefined, 'hoge', ''),
            new Date(2024, 3, 1, 8, 0, 0)
        )
        await dbWrapper.addReminder(
            new Reminder(new Date(2024, 3, 1, 8, 0, 5), undefined, 'hoge', ''),
            new Date(2024, 3, 1, 8, 0, 4)
        )

        const reminders = await dbWrapper.queryReminders(
            new Date(2024, 3, 1, 8, 0, 2)
        )
        expect(reminders.length).toBe(1)
    })
})
