'use client'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifySession } from '@/app/lib/jwt'
export default async function Dashboard(){
  const c = cookies().get('ul_session')?.value
  let role = 'guest'
  if (c) { try { role = (await verifySession(c)).role } catch {} }
  return (<div className="card">
    <h2>Dashboard</h2>
    <p>Role: {role}</p>
    <div style={{display:'flex',gap:8,marginTop:12}}>
      {role==='student' && <Link className="btn" href="/dashboard/student">Student</Link>}
      {role==='tutor' && <Link className="btn" href="/dashboard/tutor">Tutor</Link>}
      {role==='admin' && <Link className="btn" href="/admin">Admin</Link>}
    </div>
  </div>)
}
