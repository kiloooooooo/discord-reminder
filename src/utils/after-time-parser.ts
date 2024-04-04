import { addDays, addHours, addMinutes, addSeconds } from 'date-fns/fp'

export class InvalidTimeFormat extends Error {
}

export type TimeDuration = {
    days: number,
    hours: number,
    minutes: number,
    seconds: number
}

export function parseAfterTime(timeStr: string): TimeDuration {
    const timeRegexes = [
        /^(?<days>\d+)d(?<hours>\d+)h(?<minutes>\d+)m(?<seconds>\d+)s$/,
        /^(?<days>\d+)d(?<hours>\d+)h(?<minutes>\d+)m$/,
        /^(?<days>\d+)d(?<hours>\d+)h(?<seconds>\d+)s$/,
        /^(?<days>\d+)d(?<minutes>\d+)m(?<seconds>\d+)s$/,
        /^(?<days>\d+)d(?<seconds>\d+)s$/,
        /^(?<days>\d+)d(?<minutes>\d+)m$/,
        /^(?<days>\d+)d(?<hours>\d+)h$/,
        /^(?<hours>\d+)h(?<minutes>\d+)m(?<seconds>\d+)s$/,
        /^(?<hours>\d+)h(?<minutes>\d+)m$/,
        /^(?<hours>\d+)h(?<seconds>\d+)s$/,
        /^(?<minutes>\d+)m(?<seconds>\d+)s$/,
        /^(?<seconds>\d+)s$/,
        /^(?<minutes>\d+)m$/,
        /^(?<hours>\d+)h$/,
    ]
    const match = timeRegexes
        .map(regex => timeStr.match(regex))
        .reduce((a, b) => {
            if (a) {
                return a
            } else if (b) {
                return b
            } else {
                return null
            }
        })

    if (!match) {
        throw new InvalidTimeFormat(`Invalid time format: ${timeStr}`)
    }

    const days = parseInt(match.groups?.days || '0')
    const hours = parseInt(match.groups?.hours || '0')
    const minutes = parseInt(match.groups?.minutes || '0')
    const seconds = parseInt(match.groups?.seconds || '0')

    return { days, hours, minutes, seconds };
}

export function afterFrom(after: TimeDuration, from: Date): Date {
    return addDays(after.days)(
        addHours(after.hours)(
            addMinutes(after.minutes)(
                addSeconds(after.seconds)(
                    from))))
}
