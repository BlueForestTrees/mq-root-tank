const ENV = require("./env")
const db = require("mongo-registry")

module.exports = [
    {
        version: "0.0.1",
        log: `(trunkId, linkId) idx`,
        script: () => db.col(ENV.DB_COLLECTION).createIndex({"trunkId": 1, "linkId": 1})
    }
]