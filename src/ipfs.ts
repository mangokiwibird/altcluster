import { create } from 'kubo-rpc-client'

export async function fetch_file_ipfs(CID: string): Promise<Buffer> {
    const client = create()
    let total = new Uint8Array()

    for await (const buf of client.get(CID)) {
        total = Buffer.concat([total, buf])
    }

    return Buffer.from(total.buffer)
}

export async function upload_file_ipfs(contents: string): Promise<string> {
    const client = create()
    const { cid } = await client.add(contents)
    return cid.toString()
}