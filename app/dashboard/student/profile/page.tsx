//app/dashboard/student/profile/page.tsx
'use client'
import { useEffect, useState } from 'react'
export default function EditStudent(){
  const [form,setForm]=useState<any>({name:'',phone:'',location:''})
  useEffect(()=>{ fetch('/api/students/me').then(r=>r.json()).then(j=>setForm(j.data||{})) },[])
  async function save(e:any){ e.preventDefault(); const r=await fetch('/api/students/me',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); alert((await r.json()).data?'Saved':'Error') }
  return (<div className="card" style={{maxWidth:560}}>
    <h3>Edit Profile</h3>
    <form onSubmit={save} className="grid">
      <label className="label">Name</label><input className="input" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/>
      <label className="label">Phone</label><input className="input" value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/>
      <label className="label">Location</label><input className="input" value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})}/>
      <button className="btn" style={{marginTop:12}}>Save</button>
    </form>
  </div>)
}
