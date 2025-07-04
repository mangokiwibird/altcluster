import { CID, create } from 'kubo-rpc-client'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export async function get_ipfs_id(): Promise<string> {
    const client = create()
    
    return (await client.id()).id.toString()
}

export async function fetch_file_ipfs(cidhash: string): Promise<[Buffer, number]> {
    const client = create()
    let chunks = []

    console.log('----------------------------------------------------')
    console.log(`CID: ${cidhash}`)
    console.log("File Retrieved Started!")

    const start = Date.now();

    for await (const buf of client.cat(CID.parse(cidhash))) {
        // console.log(`ipfs.ts/fetch_file_ipfs : ${cidhash}`)
        chunks.push(buf)
    }

    const end = Date.now();
    const elapsedMilliseconds = end - start;
    console.log(`Elapsed milliseconds: ${elapsedMilliseconds}`);

    await client.pin.add(CID.parse(cidhash))

    console.log("File Retrieved Success!")
    console.log('----------------------------------------------------')

    return [Buffer.concat(chunks), elapsedMilliseconds]
}

export async function upload_file_ipfs(contents: string): Promise<string> {
    const client = create()
    const { cid } = await client.add({
        content: Buffer.from(contents),
    }, { wrapWithDirectory: false })
    console.log(`ipfs.ts/upload_file_ipfs : ${cid.toString()}`)
    return cid.toString()
}

export async function download_file_ipfs(CID: string): Promise<[string, number]> {
    const [buffer, elapsed_time] = await fetch_file_ipfs(CID)
    fs.writeFileSync(`altcluster_pins/${CID}`, buffer)
    return [`altcluster_pins/${CID}`, elapsed_time]
}

export async function add_file_ipfs(PATH: string): Promise<string> {
    const contents = fs.readFileSync(PATH)
    const client = create()
    const { cid } = await client.add({
        content: Buffer.from(contents),
    }, { wrapWithDirectory: false })
    console.log(`ipfs.ts/add_file_ipfs : ${cid.toString()}`)
    return cid.toString()
}