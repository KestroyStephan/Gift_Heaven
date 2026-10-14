import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'

const when = (date) => new Date(date).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

// Live chat inbox: customers planning custom frames, printing, cakes and event gifts
const Chats = ({ token }) => {

  const [chats, setChats] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [active, setActive] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('open')
  const endRef = useRef(null)

  const headers = { headers: { token } }

  const loadList = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/chat/admin/list', {}, headers)
      if (data.success) setChats(data.chats)
    } catch (error) { console.log(error) }
  }

  const loadActive = async (id = activeId) => {
    if (!id) return
    try {
      const { data } = await axios.post(backendUrl + '/api/chat/admin/get', { id }, headers)
      if (data.success) setActive(data.chat)
    } catch (error) { console.log(error) }
  }

  // Poll for new messages
  useEffect(() => {
    loadList()
    const id = setInterval(() => { loadList(); loadActive() }, 5000)
    return () => clearInterval(id)
  }, [activeId])

  useEffect(() => { loadActive(activeId) }, [activeId])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [active?.messages?.length])

  const send = async (payload) => {
    setSending(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/chat/admin/reply', { id: activeId, ...payload }, headers)
      if (data.success) { setActive(data.chat); setReply(''); loadList() }
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  const attach = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await axios.post(backendUrl + '/api/chat/admin/upload', formData, headers)
      if (data.success) await send({ image: data.url, text: reply.trim() })
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const setStatus = async (status) => {
    await axios.post(backendUrl + '/api/chat/admin/status', { id: activeId, status }, headers)
    loadActive(); loadList()
  }

  const visible = chats.filter(c => filter === 'all' || c.status === filter)
  const unreadTotal = chats.reduce((sum, c) => sum + (c.unreadAdmin || 0), 0)

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-xl font-semibold text-ink'>Chats <span className='text-sm font-medium text-mauve'>({unreadTotal} unread)</span></h2>
        <div className='flex gap-1 bg-white border border-line rounded-full p-1 text-sm'>
          {['open', 'closed', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full capitalize cursor-pointer ${filter === f ? 'bg-ink text-white' : ''}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className='grid lg:grid-cols-[320px_1fr] gap-4 min-h-[560px]'>
        <ul className='bg-white border border-line rounded-2xl overflow-y-auto max-h-[640px]'>
          {visible.length === 0 && <li className='p-6 text-sm text-center'>No conversations.</li>}
          {visible.map(c => (
            <li key={c._id}>
              <button onClick={() => setActiveId(c._id)} className={`w-full text-left p-4 border-b border-line flex flex-col gap-1 cursor-pointer ${activeId === c._id ? 'bg-pink-50' : 'hover:bg-gray-50'}`}>
                <span className='flex items-center justify-between gap-2'>
                  <span className={`truncate ${c.unreadAdmin ? 'font-bold text-ink' : 'text-ink'}`}>{c.name}</span>
                  {c.unreadAdmin > 0 && <span className='min-w-5 h-5 px-1.5 rounded-full bg-berry text-white text-xs flex items-center justify-center'>{c.unreadAdmin}</span>}
                </span>
                <span className='text-xs text-pink-700 font-semibold'>{c.topic}</span>
                <span className='text-xs text-mauve truncate'>{c.preview?.from === 'admin' ? 'You: ' : ''}{c.preview?.text || (c.preview?.image ? '📷 Photo' : '')}</span>
                <span className='text-[11px] text-gray-400'>{when(c.lastMessageAt)}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className='bg-white border border-line rounded-2xl flex flex-col overflow-hidden'>
          {!active ? (
            <div className='flex-1 flex items-center justify-center text-sm text-mauve p-10 text-center'>Select a conversation to reply.</div>
          ) : (
            <>
              <div className='p-4 border-b border-line flex flex-wrap items-center justify-between gap-3'>
                <div className='text-sm'>
                  <p className='font-semibold text-ink'>{active.name} <span className='font-normal text-mauve'>· {active.topic}</span></p>
                  <p className='text-mauve'><a href={`mailto:${active.email}`} className='text-berry'>{active.email}</a>{active.phone ? ` · ${active.phone}` : ''}{active.userId ? ' · registered customer' : ' · guest'}</p>
                </div>
                {active.status === 'open'
                  ? <button onClick={() => setStatus('closed')} className='px-4 py-2 rounded-full border border-line text-sm cursor-pointer'>Mark resolved</button>
                  : <button onClick={() => setStatus('open')} className='px-4 py-2 rounded-full border border-line text-sm cursor-pointer'>Reopen</button>}
              </div>

              <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#FCF9FA] max-h-[460px]'>
                {active.messages.map(m => {
                  const mine = m.from === 'admin'
                  return (
                    <div key={m._id} className={`max-w-[75%] flex flex-col gap-1 ${mine ? 'self-end items-end' : 'self-start items-start'}`}>
                      {m.image && <a href={m.image} target='_blank' rel='noreferrer'><img src={m.image} alt='Attachment' className='rounded-xl max-h-56 object-cover border border-line' /></a>}
                      {m.text && <p className={`px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line break-words ${mine ? 'bg-berry text-white rounded-br-md' : 'bg-white border border-line rounded-bl-md text-ink'}`}>{m.text}</p>}
                      <span className='text-[10px] text-gray-400'>{when(m.date)}</span>
                    </div>
                  )
                })}
                <div ref={endRef}></div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); reply.trim() && send({ text: reply }) }} className='border-t border-line p-3 flex items-end gap-2'>
                <label className='px-3 py-2.5 rounded-full border border-line text-sm cursor-pointer shrink-0'>
                  {uploading ? 'Uploading…' : 'Photo'}
                  <input type='file' accept='image/*' className='hidden' disabled={uploading} onChange={e => { attach(e.target.files[0]); e.target.value = '' }} />
                </label>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2} placeholder='Write a reply… (the customer is also emailed)'
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); reply.trim() && send({ text: reply }) } }}
                  className='flex-1 px-3 py-2 text-sm resize-none' />
                <button disabled={sending || !reply.trim()} className='btn-dark px-5 py-2.5 text-sm shrink-0'>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chats
