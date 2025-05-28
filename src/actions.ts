import { MqttClient } from "mqtt"
import mqtt from "mqtt"
import { fetch_file_ipfs, upload_file_ipfs, download_file_ipfs } from "./ipfs.js";
import { get_network_table_hash, NetworkTable, set_network_table_hash } from "./network_manager.js";
import { IPFS_NODE_ID } from "./global_settings.js";


// All action is defined based on the sender
export enum AlclActions {
    BroadcastUpdatedNetwork = "broadcast_updated_network",      // distributes the updated network as an ipfs hash
    ReportIPChange = "report_ip_change",                        // reports to a member of the network that the ip has changed
    PinDataFragment = "pin_data_fragment"
}

export interface EventHandler {
    name: AlclActions
    on_event(local_client: MqttClient, source_objective: string, target_action: string, raw_message: Buffer): void;
}

type PinDataFragmentSchema = {
    CID: string
}

export class PinDataFragmentHandler implements EventHandler {
    name = AlclActions.PinDataFragment

    async on_event(local_client: MqttClient, source_objective: string, target_action: string, raw_message: Buffer) {
        if (target_action != this.name) return

        let message = JSON.parse(raw_message.toString()) as PinDataFragmentSchema

        let target_file_path = download_file_ipfs(message.CID)

        console.log(`successfully pinned file from IPFS : ${target_file_path}`)
    }
}

// --- report_ip_change ---

type ReportIPChangeSchema = {
    ip_address: string
}

export class ReportIPChangeHandler implements EventHandler {
    name = AlclActions.ReportIPChange

    async on_event(local_client: MqttClient, source_objective: string, target_action: string, raw_message: Buffer) {
        if (target_action != this.name) return
        
        let message = JSON.parse(raw_message.toString()) as ReportIPChangeSchema
    
        let network_table = JSON.parse(await fetch_file_ipfs(get_network_table_hash()).toString()) as NetworkTable
        network_table[source_objective] = message.ip_address

        const CID = await upload_file_ipfs(JSON.stringify(network_table))

        local_client.publish(`alcl/${IPFS_NODE_ID}/${source_objective}/${target_action}`, CID)  // todo: it isn't consistent to just throw a string as an output

        for (const [peer_id, peer_ip] of Object.entries(network_table)) {
            broadcast_updated_network(peer_id, peer_ip, CID)
        }
    }
}

function broadcast_updated_network(peer_id: string, peer_ip: string, CID: string) {
    try {
        const client = mqtt.connect(`mqtt://${peer_ip}`)
            
        client.on("connect", () => {
            client.subscribe(`alcl/+/${IPFS_NODE_ID}/+`, (err) => {
                if (err) console.log(err)
            })
        })

        client.publish(`alcl/${IPFS_NODE_ID}/${peer_id}/${AlclActions.BroadcastUpdatedNetwork}`, JSON.stringify({ CID }))

        client.end()
    } catch (e) {
        console.log(`failed to broadcast updated network: ${peer_id}/${peer_ip}`)
    }
}

// --- broadcast_updated_network ---

type BroadcastUpdatedNetworkScheme = {
    CID: string
}

export class BroadcastUpdatedNetworkHandler implements EventHandler {
    name = AlclActions.BroadcastUpdatedNetwork

    on_event(local_client: MqttClient, source_objective: string, target_action: string, raw_message: Buffer) {
        if (target_action != this.name) return

        let message = JSON.parse(raw_message.toString()) as BroadcastUpdatedNetworkScheme
        set_network_table_hash(message.CID)
    }
}