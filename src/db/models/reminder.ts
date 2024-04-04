import { Snowflake } from 'discord.js'

export default class Reminder {
    private readonly _id: string
    private readonly _date: Date
    private readonly _mention: Snowflake | undefined
    private readonly _message: string
    private readonly _channelId: string
    private readonly _repeatCycleNotation: string | undefined

    constructor(id: string, date: Date, mention: Snowflake | undefined, message: string, channelId: string, repeatCycleNotation: string | undefined) {
        this._id = id
        this._date = date
        this._mention = mention
        this._message = message
        this._channelId = channelId
        this._repeatCycleNotation = repeatCycleNotation
    }

    public get id(): string {
        return this._id
    }

    public get date(): Date {
        return this._date
    }

    public get mention(): Snowflake | undefined {
        return this._mention
    }

    public get message(): string {
        return this._message
    }

    public get channelId(): string {
        return this._channelId
    }

    public get repeatCycleNotation(): string | undefined {
        return this._repeatCycleNotation
    }

    public get messageDisplayStyle(): string {
        return `\`${this.id}\`\n> ${this.mention ? this.mention.toString() + ' ' : ''}${this.message}`
    }
}
