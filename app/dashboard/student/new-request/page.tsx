'use client'
import { useState } from 'react'
export default function NewReq(){
  const [form,setForm]=useState<any>({ type:'PROJECT_HELP', title:'', description:'', mode:'online' })
  async function submit(e:any){ e.preventDefault(); const r=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,budgetMin:form.budgetMin?Number(form.budgetMin):undefined,budgetMax:form.budgetMax?Number(form.budgetMax):undefined})}); const j=await r.json(); alert(j.error||'Created'); if(r.ok) location.href='/dashboard/student' }
  return (<div className="card" style={{maxWidth:720}}>
    <h3>Post a Request</h3>
    <form onSubmit={submit} className="grid">
      <label className="label">Type</label>
      <select className="select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
        <option value="HIRE_TUTOR">Hire Tutor (Academics)</option>
        <option value="HIRE_QURAN">Hire Quran Tutor</option>
        <option value="PROJECT_HELP">Assignment/Project Help</option>
      </select>
      <label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <label className="label">Description</label><textarea className="input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      <label className="label">Subject</label><input className="input" value={form.subject||''} onChange={e=>setForm({...form,subject:e.target.value})}/>
      <label className="label">Class Level</label><input className="input" value={form.classLevel||''} onChange={e=>setForm({...form,classLevel:e.target.value})}/>
      <label className="label">Mode</label>
      <select className="select" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}>
        <option value="online">Online</option>
        <option value="onsite">On-site</option>
      </select>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div><label className="label">Budget Min</label><input className="input" value={form.budgetMin||''} onChange={e=>setForm({...form,budgetMin:e.target.value})}/></div>
        <div><label className="label">Budget Max</label><input className="input" value={form.budgetMax||''} onChange={e=>setForm({...form,budgetMax:e.target.value})}/></div>
      </div>
      <label className="label">Preferred Time</label><input className="input" value={form.preferredTime||''} onChange={e=>setForm({...form,preferredTime:e.target.value})}/>
      <label className="label">Location</label><input className="input" value={form.locationText||''} onChange={e=>setForm({...form,locationText:e.target.value})}/>
      <button className="btn" style={{marginTop:12}}>Submit</button>
    </form>
  </div>)
}
