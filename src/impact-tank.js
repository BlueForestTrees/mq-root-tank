const ENV = require("./env")
const db = require("mongo-registry")
const rbmq = require("simple-rbmq")
const http = require("request-promise-native")
const dbRegistry = require('./dbRegistry')

db.dbInit(ENV, dbRegistry)
    .then(() => rbmq.initRabbit(ENV.RB))
    .then(() => Promise.all([
        db.col(ENV.DB_COLLECTION_EXPLODED),
        db.col(ENV.DB_COLLECTION)
    ]))
    .then(([explodedTanks, tanks]) => Promise.all([
        rbmq.createReceiver(ENV.RB.exchange, `impact-upsert`, {...ENV.QUEUE, name: `impact-tank-upsert`}, msg => upsertImpactTankExploded(msg, explodedTanks).then(updateImpactTank(msg, explodedTanks, tanks))),
        rbmq.createReceiver(ENV.RB.exchange, `impact-delete`, {...ENV.QUEUE, name: `impact-tank-delete`}, msg => deleteImpactTankExploded(msg, explodedTanks).then(updateImpactTank(msg, explodedTanks, tanks)))
    ]))
    .catch(console.error)

const upsertImpactTankExploded = async (impact, explodedTanks) => {
    const branches = await getBranches(impact.trunkId)
    branches
        .then(branches => branches.map(trunkId => ({trunkId, rootId: impact.trunkId, linkId: impact._id, impactId: impact.impactId, bqt: impact.bqt})))
        .then(impactTanks => impactTanks.map(it => ({updateOne: {filter: {trunkId: it.trunkId, linkId: it.linkId}, update: {$set: it}, upsert: true}})))
        .then(updates =>
            explodedTanks.bulkWrite(updates, {ordered: false})
                .then(checkUpserts(updates.length))
        ).then(branches)
}

const deleteImpactTankExploded = (impact, explodedTanks) => explodedTanks.deleteMany({linkId: impact._id})

const getBranches = trunkId =>
    http.get(ENV.URL_BRANCHES(trunkId), {json: true})
        .then(branches => branches.map(branchId => db.object(branchId)))
        .then(branches => branches.unshift(trunkId) && branches)

const checkUpserts = count =>
    mongoResponse =>
        count === (mongoResponse.matchedCount + mongoResponse.modifiedCount + mongoResponse.upsertedCount) || throwIt("checkUpserts fail")

const throwIt = msg => {
    throw new Error(msg)
}

//TODO quelle clé
const updateImpactTank = (impact, explodedTanks, tanks) => branches =>
    explodedTanks.aggregate([
        {$match: {trunkId: {$in: branches}, impactId: impact.impactId}},
        {$group: {_id: "$trunkId", bqt: {$sum: "$bqt"}}}
    ]).then(dds => dds.map(dd => ({_id: "???", trunkId: dd._id, bqt: dd.bqt, impactId: impact.impactId})))