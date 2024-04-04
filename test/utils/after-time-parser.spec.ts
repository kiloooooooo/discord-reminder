import { parseAfterTime } from '../../src/utils/after-time-parser'

describe('時間の長さを示す文字列をパースできる', () => {
    const testCases = [
        { notation: '4h2m3s', toBe: { days: 0, hours: 4, minutes: 2, seconds: 3 } },
        { notation: '4h2m', toBe: { days: 0, hours: 4, minutes: 2, seconds: 0 } },
        { notation: '4h3s', toBe: { days: 0, hours: 4, minutes: 0, seconds: 3 } },
        { notation: '2m3s', toBe: { days: 0, hours: 0, minutes: 2, seconds: 3 } },
        { notation: '2m', toBe: { days: 0, hours: 0, minutes: 2, seconds: 0 } },
        { notation: '20m47s', toBe: { days: 0, hours: 0, minutes: 20, seconds: 47 } },
        { notation: '90m', toBe: { days: 0, hours: 0, minutes: 90, seconds: 0 } },
        { notation: '90m120s', toBe: { days: 0, hours: 0, minutes: 90, seconds: 120 } },
        { notation: '2d90m120s', toBe: { days: 2, hours: 0, minutes: 90, seconds: 120 } }
    ]

    for (let testCase of testCases) {
        test(testCase.notation, () => {
            expect(parseAfterTime(testCase.notation)).toStrictEqual(testCase.toBe)
        })
    }
})
