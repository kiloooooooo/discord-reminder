import { parseDateWithMultiFormats } from '../../src/utils/date-parser'

const validateDate = (value: Date, toBe: Date) => {
    expect(value.getTime()).not.toBeNaN()
    expect(value.getTime()).toBe(toBe.getTime())
    expect(value.getTime()).not.toBeNaN()
    expect(value.getTime()).toBe(toBe.getTime())
}

describe('日付付きの記法をパースできる', () => {
    const spy = jest
        .spyOn(Date, 'now')
        .mockImplementation(() => new Date(2024, 2, 31, 16, 47, 30).getTime())

    describe('秒あり', () => {
        const dateToBe = new Date(2024, 3, 5, 8, 7, 3)

        const yearNotations = ['2024/', '24/', '']
        const monthNotations = ['04/', '4/']
        const dayNotations = ['05 ', '5 ']
        const hourNotations = ['08:', '8:']
        const minuteNotations = ['07:', '7:']
        const secondNotations = ['03', '3']

        for (let yearNotation of yearNotations) {
            for (let monthNotation of monthNotations) {
                for (let dayNotation of dayNotations) {
                    for (let hourNotation of hourNotations) {
                        for (let minuteNotation of minuteNotations) {
                            for (let secondNotation of secondNotations) {
                                const dateString = yearNotation + monthNotation + dayNotation + hourNotation + minuteNotation + secondNotation
                                test(dateString, () => {
                                    validateDate(parseDateWithMultiFormats(dateString), dateToBe)
                                })
                            }
                        }
                    }
                }
            }
        }

        const otherPatterns = [
            '240405 080703'
        ]
        for (let pattern of otherPatterns) {
            test(pattern, () => {
                validateDate(parseDateWithMultiFormats(pattern), dateToBe)
            })
        }
    })

    describe('秒なし', () => {
        const dateToBe = new Date(2024, 3, 5, 8, 7, 0)

        const yearNotations = ['2024/', '24/', '']
        const monthNotations = ['04/', '4/']
        const dateNotations = ['05 ', '5 ']
        const hoursNotations = ['08:', '8:']
        const minutesNotations = ['07', '7']

        for (let yearNotation of yearNotations) {
            for (let monthNotation of monthNotations) {
                for (let dayNotation of dateNotations) {
                    for (let hourNotation of hoursNotations) {
                        for (let minuteNotation of minutesNotations) {
                            const dateString = yearNotation + monthNotation + dayNotation + hourNotation + minuteNotation
                            test(dateString, () => {
                                validateDate(parseDateWithMultiFormats(dateString), dateToBe)
                            })
                        }

                    }
                }
            }
        }

        const otherPatterns = [
            '240405 080700'
        ]
        for (let pattern of otherPatterns) {
            test(pattern, () => {
                validateDate(parseDateWithMultiFormats(pattern), dateToBe)
            })
        }
    })
})

describe('日付なしの記法をパースできる', () => {
    const spy = jest
        .spyOn(Date, 'now')
        .mockImplementation(() => new Date(2024, 2, 31, 18, 4, 20).getTime())

    describe('秒あり', () => {
        const dateToBe = new Date(2024, 2, 31, 7, 4, 3)
        const hoursNotations = ['07:', '7:']
        const minutesNotations = ['04:', '4:']
        const secondsNotations = ['03', '3']

        for (let hoursNotation of hoursNotations) {
            for (let minutesNotation of minutesNotations) {
                for (let secondsNotation of secondsNotations) {
                    const dateString = hoursNotation + minutesNotation + secondsNotation
                    test(dateString, () => {
                        validateDate(parseDateWithMultiFormats(dateString), dateToBe)
                    })
                }
            }
        }

        const otherPatterns = [
            '070403'
        ]
        for (let pattern of otherPatterns) {
            test(pattern, () => {
                validateDate(parseDateWithMultiFormats(pattern), dateToBe)
            })
        }
    })

    describe('秒なし', () => {
        const dateToBe = new Date(2024, 2, 31, 7, 4)
        const hoursNotations = ['07:', '7:']
        const minutesNotations = ['04', '4']

        for (let hoursNotation of hoursNotations) {
            for (let minutesNotation of minutesNotations) {
                const dateString = hoursNotation + minutesNotation
                test(dateString, () => {
                    validateDate(parseDateWithMultiFormats(dateString), dateToBe)
                })
            }
        }

        const otherPatterns = [
            '0704'
        ]
        for (let pattern of otherPatterns) {
            test(pattern, () => {
                validateDate(parseDateWithMultiFormats(pattern), dateToBe)
            })
        }
    })
})

test('誤った記法に対して例外を投げる', () => {
    const invalidDateString = '24/4/5 12:24:78'
    expect(() => parseDateWithMultiFormats(invalidDateString)).toThrow()
})
