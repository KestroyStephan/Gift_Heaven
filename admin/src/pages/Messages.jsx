import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'
import { PageHeader } from '../components/ui'

const Messages = ({ token }) => {

  const [messages, setMessages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(null)
  const [showUnread, setShowUnread] = useState(false)

  const fetchMessages = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/contact/list', {}, { headers: { token } })
      if (data.success) setMessages(data.messages)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => { fetchMessages() }, [token])

  const mark = async (id, read) => {
    setMessages(prev => prev.map(m => m._id === id ? { ...m, read } : m))
    await axios.post(backendUrl + '/api/contact/mark', { id, read }, { headers: { token } }).catch(() => {})
  }

  const toggle = (msg) => {
    setOpen(open === msg._id ? null : msg._id)
    if (!msg.read) mark(msg._id, true)
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this message?')) return
    const { data } = await axios.post(backendUrl + '/api/contact/delete', { id }, { headers: { token } })
    if (data.success) {
      toast.success(data.message)
      setMessages(prev => prev.filter(m => m._id !== id))
    } else {
      toast.error(data.message)
    }
  }

  const unread = messages.filter(m => !m.read).length
  const visible = showUnread ? messages.filter(m => !m.read) : messages

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader title='Messages' subtitle={`Contact-form messages from customers · ${unread} unread`}>
        <label className='flex items-center gap-2 text-sm cursor-pointer'>
          <input type='checkbox' checked={showUnread} onChange={() => setShowUnread(!showUnread)} /> Unread only
        </label>
      </PageHeader>

      {loaded && visible.length === 0 && <p className='card p-8 text-center'>No messages yet.</p>}

      {visible.map(msg => (
        <div key={msg._id} className={`bg-white border rounded-2xl ${msg.read ? 'border-line' : 'border-berry'}`}>
          <button onClick={() => toggle(msg)} aria-expanded={open === msg._id} className='w-full text-left p-4 flex flex-wrap items-center gap-x-4 gap-y-1 cursor-pointer'>
            {!msg.read && <span className='w-2 h-2 rounded-full bg-berry' aria-label='Unread'></span>}
            <span className={`text-ink ${msg.read ? '' : 'font-bold'}`}>{msg.name}</span>
            <span className='text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full'>{msg.topic}</span>
            <span className='flex-1 min-w-0 truncate text-sm text-mauve'>{msg.message}</span>
            <span className='text-xs text-mauve'>{new Date(msg.date).toLocaleString()}</span>
          </button>
          {open === msg._id && (
            <div className='border-t border-line p-5 flex flex-col gap-3 text-sm'>
              <div className='flex flex-wrap gap-x-6 gap-y-1 text-mauve'>
                <a href={`mailto:${msg.email}`} className='text-berry font-semibold'>{msg.email}</a>
                {msg.phone && <a href={`tel:${msg.phone}`}>{msg.phone}</a>}
                {msg.orderNumber && <span>Order: <b className='text-ink'>{msg.orderNumber}</b></span>}
              </div>
              <p className='whitespace-pre-line text-ink leading-relaxed'>{msg.message}</p>
              <div className='flex gap-3 mt-1'>
                <a href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: ' + msg.topic)}`} className='btn-dark px-5 py-2 text-sm'>Reply by email</a>
                <button onClick={() => mark(msg._id, false)} className='px-4 py-2 rounded-full border border-line text-sm cursor-pointer'>Mark unread</button>
                <button onClick={() => remove(msg._id)} className='px-4 py-2 rounded-full text-sm text-red-700 cursor-pointer'>Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Messages
