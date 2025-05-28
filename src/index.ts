import mqtt from "mqtt"
import { BroadcastUpdatedNetworkHandler, ReportIPChangeHandler } from "./actions.js"
import { IPFS_NODE_ID } from "./global_settings.js"


const EVENT_HANDLERS = [new ReportIPChangeHandler(), new BroadcastUpdatedNetworkHandler()]
const local_client = mqtt.connect("mqtt://localhost")

console.log(`IPFS_NODE_ID = ${IPFS_NODE_ID}`)

// topic format: alcl/<from>/<to>/<action>
local_client.on("connect", () => {
    local_client.subscribe(`alcl/+/${IPFS_NODE_ID}/+`, (err) => {
        if (err) console.log(err)
    })
})

local_client.on("message", (topic, raw_message) => {
    let topic_split = topic.split("/")
    let source_objective = topic_split[1] // the ipfs id of the sender
    let target_action = topic_split[3]

    for (const handler of EVENT_HANDLERS) {
        handler.on_event(local_client, source_objective, target_action, raw_message)
    }
})

console.log("application up and ready!")