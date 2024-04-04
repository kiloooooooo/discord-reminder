import { parse } from 'date-fns'

class InvalidDateString extends Error {}

export const DATE_FORMATS = [
    'yy/MM/dd HH:mm',
    'yy/MM/dd HH:mm:ss',
    'yyyy/MM/dd HH:mm',
    'yyyy/MM/dd HH:mm:ss',
    'MM/dd HH:mm',
    'MM/dd HH:mm:ss',
    'HH:mm:ss',
    'HH:mm',
    'yyMMdd HHmmss',
    'yyMMdd HHmm',
    'HHmmss',
    'HHmm'
]

export function parseDateWithMultiFormats(dateString: string): Date {
    const now = new Date(Date.now())
    for (let dateFormat of DATE_FORMATS) {
        const date = parse(dateString, dateFormat, now)
        if (!Number.isNaN(date.getTime())) {
            return date
        }
    }

    throw new InvalidDateString('Invalid format of `dateString`')
}
