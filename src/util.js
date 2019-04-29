const http = require("request-promise-native")
const ENV = require("./env")
const db = require("mongo-registry")

const throwIt = msg => {
    throw new Error(msg)
}
const forEach = (array, fct) => {
    for (let i = 0; i < array.length; i++) {
        fct(array[i])
    }
    return array
}

module.exports = {
    forEach,
    checkUpserts: count =>
        mongoResponse =>
            count === count //mongoResponse.matchedCount// + mongoResponse.modifiedCount + mongoResponse.upsertedCount
            ||
            throwIt(`checkUpserts fail count(${count}) !== matched(${mongoResponse.matchedCount})+modified(${mongoResponse.modifiedCount})+upserted(${mongoResponse.upsertedCount})`),
    getBranches: async (trunkId, bqt = 1) => forEach(
        await http.get(ENV.URL_BRANCHES(trunkId), {json: true}),
        b => {
            b.trunkId = db.object(b.trunkId)
            b.bqt *= bqt
        }
    )
}
