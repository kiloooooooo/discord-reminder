import Reminder from './models/reminder'
import { Database } from 'sqlite3'

const DB_FILE = 'database/reminders.db'

class DBNotInitializedException extends Error {
}

export default class RemindersDBWrapper {
    private static _instance: RemindersDBWrapper
    private _db: Database
    private _initialized: boolean

    private constructor(db: Database) {
        this._db = db
        this._initialized = false
    }

    public static getInstance(withDB: Database | null = null) {
        if (!RemindersDBWrapper._instance) {
            RemindersDBWrapper._instance = new RemindersDBWrapper(withDB ? withDB : new Database(DB_FILE))
            // await RemindersDBWrapper._instance.initDatabase()
        }

        return RemindersDBWrapper._instance
    }

    public addReminder(reminder: Reminder) {
        if (!this._initialized) {
            throw new DBNotInitializedException('DB not initialized')
        }
        const query =
            'INSERT INTO reminders(timestamp, remind_at, mention, message, channel_id, repeat_cycle)' +
            ` VALUES('${reminder.id}',` +
            ` '${reminder.date.getTime()}',` +
            ` '${reminder.mention || 'NA'}',` +
            ` '${reminder.message}',` +
            ` '${reminder.channelId}',` +
            ` '${reminder.repeatCycleNotation}')`
        return new Promise((resolve, reject) => {
            this._db.run(query, err => err ? reject(err) : resolve(this))
        })
    }

    public queryReminders(after?: Date) {
        if (!this._initialized) {
            throw new DBNotInitializedException('DB not initialized')
        }
        const query =
            'SELECT * FROM reminders' + (after ? ` WHERE ${after.getTime()} < remind_at` : '')
        return new Promise<Reminder[]>((resolve, reject) => {
            this._db.all(query, (err: any, rows: any[]) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows.map(RemindersDBWrapper.parseReminder))
                }
            })
        })
    }

    public queryReminder(id: string) {
        if (!this._initialized) {
            throw new DBNotInitializedException('DB not initialized')
        }
        const query =
            `SELECT * FROM reminders WHERE timestamp = '${id}'`
        return new Promise<Reminder>((resolve, reject) => {
            this._db.get(query, (err: any, row: any) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(RemindersDBWrapper.parseReminder(row))
                }
            })
        })
    }

    public deleteReminder(id: string) {
        if (!this._initialized) {
            throw new DBNotInitializedException('DB not initialized')
        }
        const selectQuery =
            `SELECT * FROM reminders WHERE timestamp = '${id}'`
        const deleteQuery =
            `DELETE FROM reminders WHERE timestamp = '${id}'`

        return new Promise<Reminder>((resolve, reject) => {
            this._db.get(selectQuery, (err, row) => {
                if (err) {
                    reject(err)
                }
                this._db.run(deleteQuery, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(RemindersDBWrapper.parseReminder(row))
                    }
                })
            })
        })
    }

    public initDatabase() {
        return new Promise<void>((resolve, reject) => {
            this._initialized = true
            this._db.serialize(() => {
                this._db.run(
                    'CREATE TABLE IF NOT EXISTS' +
                    ' reminders(timestamp INTEGER PRIMARY KEY,' +
                    ' remind_at INTEGER,' +
                    ' mention TEXT DEFAULT "NA",' +
                    ' message TEXT,' +
                    ' channel_id TEXT,' +
                    ' repeat_cycle TEXT DEFAULT "",' +
                    ' private INTEGER DEFAULT 0)',
                    (err: any) => err ? reject(err) : resolve()
                )
            })
        })
    }

    public close() {
        return new Promise<void>(resolve => {
            this._db.close(() => {
                resolve()
            })
        })
    }

    private static parseReminder(dbReturns: any) {
        return new Reminder(
            dbReturns.timestamp.toString(),
            new Date(dbReturns.remind_at as number),
            dbReturns.mention === 'NA' ? undefined : dbReturns.mention,
            dbReturns.message,
            dbReturns.channel_id,
            dbReturns.repeat_cycle
        )
    }
}
