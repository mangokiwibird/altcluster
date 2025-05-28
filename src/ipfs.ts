import { CID, create } from 'kubo-rpc-client'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export async function get_ipfs_id(): Promise<string> {
    const client = create()
    
    return (await client.id()).id.toString()
}

export async function fetch_file_ipfs(cidhash: string): Promise<Buffer> {
    const client = create()
    let total = new Uint8Array()

    for await (const buf of client.get(CID.parse(cidhash))) {
        total = Buffer.concat([total, buf])
    }

    client.pin.add(CID.parse(cidhash))

    return Buffer.from(total.buffer)
}

export async function upload_file_ipfs(contents: string): Promise<string> {
    const client = create()
    const { cid } = await client.add(contents)
    return cid.toString()
}

export async function download_file_ipfs(CID: string): Promise<string> {
    const buffer = await fetch_file_ipfs(CID)
    fs.writeFileSync(`altcluster_pins/${CID}`, buffer)
    return `altcluster_pins/${CID}`
}