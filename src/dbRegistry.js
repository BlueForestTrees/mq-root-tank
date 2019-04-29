const ENV = require("./env")
const db = require("mongo-registry")

module.exports = [
    {
        version: "0.0.1",
        log: `tankDetails collection: (trunkId, linkId) idx`,
        script: () => db.col(ENV.DB_COLLECTION_DETAILS).createIndex({"trunkId": 1, "linkId": 1}, {unique: true})
    },
    {
        version: "0.0.1",
        log: `tank collection: (trunkId, impactId) idx`,
        script: () => db.col(ENV.DB_COLLECTION).createIndex({"trunkId": 1, "impactId": 1}, {unique: true})
    }
]