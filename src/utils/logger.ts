import pino from 'pino'

export const logger = pino({
    level: 'trace',
    transport: {
        // target: 'pino/file',
        targets: [
            {
                target: 'pino/file',
                options: {
                    destination: 'logs/out.log',
                    mkdir: true
                }
            },
            { target: 'pino-pretty' }
        ],
    }
})
