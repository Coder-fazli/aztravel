import { connectDb } from "./connect";
import { revalidatePath } from "next/cache";

const plain = (d: any) => JSON.parse(JSON.stringify(d))

export async function findMany(Model: any, filter = {}, populate = '') {
    await connectDb()
    const q = Model.find(filter).sort({ createdAt: -1 })
    if (populate) q.populate(populate)
        return plain(await q.lean())
}


export async function findOne(Model: any, filter = {}, populate = '') {
    await connectDb()
    const q = Model.findOne(filter)
    if (populate) q.populate(populate)
        return plain(await q.lean())
}

export async function createDoc(Model: any, data: any, revalidate = '') {
    await connectDb()
    const doc = await Model.create(data)
    if (revalidate) revalidatePath(revalidate)
        return plain(doc)
}

export async function updateDoc(Model: any, id: string, data: any, revalidate = ''){
    await connectDb()
   const doc = await Model.findByIdAndUpdate(id, data, { new: true })
    if (revalidate) revalidatePath(revalidate)
    return plain(doc)
}

export async function removeDoc(Model: any, id: string, revalidate = ''){
    await connectDb()
    await Model.findByIdAndDelete(id)
    if (revalidate) revalidatePath(revalidate)
}