import React, { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../Context/ShopContext'
import Icon from './Icons'

export const chatTopics = [
    'Photo frame art', 'Mug or T-shirt printing', 'Custom cake design',
    'Birthday or party gifts', 'Wedding or housewarming', 'Festival gifts', 'Bulk / corporate order', 'Something else',
]

const readSession = () => {
    try { return JSON.parse(localStorage.getItem('chatSession')) || null } catch { return null }
}

const timeOf = (date) => new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

// Floating "chat with us" panel: customers plan custom gifts with the team
const ChatWidget = () => {

    const { backendUrl, token, chat: chatUi, openChat, closeChat } = useContext(ShopContext)
    const [session, setSession] = useState(readSession)
    const [conversation, setConversation] = useState(null)
    const [form, setForm] = useState({ name: '', email: '', topic: '', text: '' })
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const [uploading, setUploading] = useState(false)
    const endRef = useRef(null)

    const auth = (extra = {}) => ({ conversationId: session?.conversationId, key: session?.key, ...extra })
    const headers = token ? { token } : {}

    const load = async (markRead = false) => {
        try {
            const body = session ? auth({ markRead }) : { markRead }
            if (!session && !token) return
            const { data } = await axios.post(backendUrl + '/api/chat/get', body, { headers })
            if (data.success) {
                setConversation(data.chat)
                if (!session) {
                    // Logged-in customer picking up an existing chat
                    const restored = { conversationId: data.chat._id, key: '' }
                    setSession(restored)
                }
            } else if (session) {
                localStorage.removeItem('chatSession')
                setSession(null)
                setConversation(null)
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Poll quickly while open, slowly for the unread badge
    useEffect(() => {
        load(chatUi.open)
        const id = setInterval(() => load(chatUi.open), chatUi.open ? 4000 : 30000)
        return () => clearInterval(id)
    }, [chatUi.open, session?.conversationId, token])

    // Prefill the topic and the customer's details
    useEffect(() => {
        if (chatUi.open && chatUi.topic) setForm(prev => ({ ...prev, topic: chatUi.topic }))
    }, [chatUi.open, chatUi.topic])

    useEffect(() => {
        if (!token || !chatUi.open || form.email) return
        axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } })
            .then(({ data }) => data.success && setForm(prev => ({ ...prev, name: prev.name || data.user.name, email: prev.email || data.user.email })))
            .catch(() => {})
    }, [token, chatUi.open])

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'end' })
    }, [conversation?.messages?.length, chatUi.open])

    const start = async (e) => {
        e.preventDefault()
        setSending(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/chat/start', { ...form, topic: form.topic || 'Something else' }, { headers })
            if (data.success) {
                const next = { conversationId: data.conversationId, key: data.key }
                localStorage.setItem('chatSession', JSON.stringify(next))
                setSession(next)
                setConversation(data.chat)
                setForm(prev => ({ ...prev, text: '' }))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSending(false)
        }
    }

    const send = async (payload) => {
        setSending(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/chat/send', auth(payload), { headers })
            if (data.success) setConversation(data.chat)
            else toast.error(data.message)
            return data.success
        } catch (error) {
            toast.error(error.message)
            return false
        } finally {
            setSending(false)
        }
    }

    const onSend = async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        if (await send({ text })) setText('')
    }

    const attach = async (file) => {
        if (!file) return
        if (file.size > 5 * 1024 * 1024) return toast.error('Please choose an image under 5 MB')
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('image', file)
            const { data } = await axios.post(backendUrl + '/api/chat/upload', formData, {
                headers: { ...headers, conversationid: session?.conversationId || '', chatkey: session?.key || '' }
            })
            if (data.success) await send({ image: data.url, text: text.trim() })
            else toast.error(data.message)
            setText('')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setUploading(false)
        }
    }

    const newChat = () => {
        localStorage.removeItem('chatSession')
        setSession(null)
        setConversation(null)
    }

    const unread = conversation?.unreadCustomer || 0
    const field = 'w-full h-11 px-3.5 rounded-xl border border-rose-300 bg-white text-sm'

    return (
        <>
            {!chatUi.open && (
                <button onClick={() => openChat()} aria-label={unread ? `Chat with us, ${unread} new replies` : 'Chat with us'}
                    className='fixed z-40 bottom-5 right-5 h-14 pl-4 pr-5 rounded-full bg-ink text-white shadow-xl flex items-center gap-2.5 font-bold text-sm hover:bg-black cursor-pointer'>
                    <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M21 12a8 8 0 01-11.6 7.1L4 20l1-4.4A8 8 0 1121 12z' /></svg>
                    Chat with us
                    {unread > 0 && <span className='min-w-5 h-5 px-1.5 rounded-full bg-gold text-ink text-xs flex items-center justify-center'>{unread}</span>}
                </button>
            )}

            {chatUi.open && (
                <section role='dialog' aria-label='Chat with Surprise Heaven'
                    className='fixed z-50 inset-0 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[380px] sm:h-[600px] sm:max-h-[calc(100vh-40px)] bg-white sm:rounded-[24px] shadow-2xl border border-line flex flex-col overflow-hidden'>
                    <header className='bg-ink text-white px-5 py-4 flex items-start justify-between gap-3'>
                        <div>
                            <p className='font-display text-2xl leading-tight'>Create it <span className='italic text-[#F2B8C9]'>with us</span></p>
                            <p className='text-xs text-[#D9C6CE] mt-1'>Custom frames, printing, cakes & event gifts. We usually reply within a few hours.</p>
                        </div>
                        <button onClick={closeChat} aria-label='Close chat' className='w-10 h-10 shrink-0 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer'><Icon name='close' /></button>
                    </header>

                    {!conversation ? (
                        <form onSubmit={start} className='flex-1 overflow-y-auto p-5 flex flex-col gap-3'>
                            <p className='text-sm text-mauve'>Tell us what you'd like to create. You can send reference photos once the chat starts.</p>
                            <div className='flex flex-wrap gap-2'>
                                {chatTopics.map(topic => (
                                    <button key={topic} type='button' onClick={() => setForm(prev => ({ ...prev, topic }))}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${form.topic === topic ? 'bg-berry text-white' : 'bg-rose-50 text-berry-dark hover:bg-rose-100'}`}>{topic}</button>
                                ))}
                            </div>
                            <label className='text-xs font-bold flex flex-col gap-1.5'>Your name
                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete='name' className={field} />
                            </label>
                            <label className='text-xs font-bold flex flex-col gap-1.5'>Email
                                <input required type='email' value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete='email' className={field} />
                            </label>
                            <label className='text-xs font-bold flex flex-col gap-1.5'>Your idea
                                <textarea required rows={4} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
                                    placeholder='e.g. A 2 kg cake for my mother’s 60th with a photo print, delivered on Saturday…' className='w-full px-3.5 py-2.5 rounded-xl border border-rose-300 text-sm resize-none' />
                            </label>
                            <button disabled={sending} className='btn-primary w-full mt-1'>{sending ? 'Starting…' : 'Start chat'}</button>
                        </form>
                    ) : (
                        <>
                            <div className='flex items-center justify-between px-5 py-2 bg-rose-50 text-xs text-berry-dark'>
                                <span className='font-semibold truncate'>{conversation.topic}</span>
                                <button onClick={newChat} className='underline cursor-pointer shrink-0'>New chat</button>
                            </div>
                            <div aria-live='polite' className='flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-shell'>
                                {conversation.messages.map(message => {
                                    const mine = message.from === 'customer'
                                    return (
                                        <div key={message._id || message.date} className={`max-w-[82%] flex flex-col gap-1 ${mine ? 'self-end items-end' : 'self-start items-start'}`}>
                                            {!mine && <span className='text-[11px] font-bold text-berry'>Surprise Heaven</span>}
                                            {message.image && (
                                                <a href={message.image} target='_blank' rel='noreferrer'><img src={message.image} alt='Attached' className='rounded-2xl max-h-48 object-cover border border-line' /></a>
                                            )}
                                            {message.text && (
                                                <p className={`px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line break-words ${mine ? 'bg-berry text-white rounded-br-md' : 'bg-white border border-line rounded-bl-md'}`}>{message.text}</p>
                                            )}
                                            <span className='text-[10px] text-muted'>{timeOf(message.date)}</span>
                                        </div>
                                    )
                                })}
                                {conversation.messages.every(m => m.from === 'customer') && (
                                    <p className='self-center text-xs text-muted text-center mt-2'>Thanks! A designer will reply here soon — we'll also email you.</p>
                                )}
                                <div ref={endRef}></div>
                            </div>
                            <form onSubmit={onSend} className='border-t border-line p-3 flex items-center gap-2'>
                                <label className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-rose-50 text-berry ${uploading ? 'opacity-50' : 'cursor-pointer'}`} title='Attach a photo'>
                                    <span className='sr-only'>Attach a photo</span>
                                    {uploading ? <span className='w-4 h-4 border-2 border-rose-200 border-t-berry rounded-full animate-spin'></span> : <Icon name='plus' />}
                                    <input type='file' accept='image/*' className='sr-only' disabled={uploading} onChange={e => { attach(e.target.files[0]); e.target.value = '' }} />
                                </label>
                                <label className='flex-1'>
                                    <span className='sr-only'>Message</span>
                                    <input value={text} onChange={e => setText(e.target.value)} placeholder='Type a message…' className='w-full h-11 px-4 rounded-full border border-rose-300 text-sm' />
                                </label>
                                <button disabled={sending || !text.trim()} aria-label='Send' className='w-11 h-11 shrink-0 rounded-full bg-berry text-white flex items-center justify-center disabled:opacity-40 cursor-pointer'><Icon name='arrow' size={18} /></button>
                            </form>
                        </>
                    )}
                </section>
            )}
        </>
    )
}

export default ChatWidget
