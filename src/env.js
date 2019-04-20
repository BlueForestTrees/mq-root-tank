const version = require('./../package.json').version
const fs = require("fs")

const ENV = {}

Object.assign(ENV, {
    NAME: "impactTank",
    NODE_ENV: process.env.NODE_ENV || null,
    VERSION: version,

    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
    DB_NAME: process.env.DB_NAME || "BlueForestTreesDB",
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT || 27017,
    DB_USER: process.env.DB_USER || "doudou",
    DB_PWD: process.env.DB_PWD || "masta"
})
Object.assign(ENV, {
    DB_COLLECTION: process.env.DB_COLLECTION || `${ENV.NAME}`
})
Object.assign(ENV, {
    DB_COLLECTION_EXPLODED: `${ENV.DB_COLLECTION}Exploded`,

    RB_PATH: process.env.RB_PATH || "mq.json",
    QUEUE_PATH: process.env.QUEUE_PATH || "queue.json",

    BASEURL_BRANCHES: process.env.BASEURL_BRANCHES || "http://tree/api/tree/branches/"
})
Object.assign(ENV, {
    RB: JSON.parse(fs.readFileSync(ENV.RB_PATH, 'utf8')),
    QUEUE: JSON.parse(fs.readFileSync(ENV.QUEUE_PATH, 'utf8'))
})
Object.assign(ENV, {
    URL_BRANCHES: _id => ENV.BASEURL_BRANCHES + _id
})

const debug = require('debug')(`api:mq-${ENV.NAME}`)

debug({ENV})

module.exports = ENV