"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export function Appbar() {
     const session= useSession()
    
    return (
        <>
            <div className="flex justify- justify-between ">


                <div>
                    <h1>MusiQ</h1>

                </div>
                <div>
                    {session.data?.user &&    <button className="px-4 py-2 bg-slate-600 text-white rounded-md mt-2" onClick={() => { signOut() }}>Sign Out</button>}
                    {!session.data?.user &&    <button className="px-4 py-2 bg-slate-600 text-white rounded-md mt-2" onClick={() => { signIn() }}>Sign In</button>}

                </div>
            </div>
        </>
    )
}