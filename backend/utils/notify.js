import nodemailer from 'nodemailer'
import { storeName, frontendUrl, currency } from '../config/store.js'
import { describeCustomization } from '../config/customization.js'

// Email (SMTP) and SMS (Twilio) are optional: if their env vars are missing the
// message is logged instead, so the shop keeps working in development.

let transporter = null
const getTransporter = () => {
    if (!process.env.SMTP_HOST) return null
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        })
    }
    return transporter
}

export const sendEmail = async ({ to, subject, html }) => {
    if (!to) return
    const mailer = getTransporter()
    if (!mailer) {
        console.log(`[email skipped - SMTP not configured] to=${to} subject="${subject}"`)
        return
    }
    try {
        await mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html })
    } catch (error) {
        console.log('Email failed:', error.message)
    }
}

const toE164 = (phone) => {
    let p = String(phone || '').replace(/[^\d+]/g, '')
    if (!p) return ''
    if (p.startsWith('+')) return p
    const cc = process.env.SMS_DEFAULT_COUNTRY_CODE || '+94'
    return cc + p.replace(/^0+/, '')
}

export const sendSMS = async (phone, body) => {
    const to = toE164(phone)
    if (!to) return
    const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: authToken, TWILIO_FROM_NUMBER: from } = process.env
    if (!sid || !authToken || !from) {
        console.log(`[sms skipped - Twilio not configured] to=${to} body="${body}"`)
        return
    }
    try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + Buffer.from(`${sid}:${authToken}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ To: to, From: from, Body: body })
        })
        if (!res.ok) console.log('SMS failed:', res.status, await res.text())
    } catch (error) {
        console.log('SMS failed:', error.message)
    }
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const symbol = currency === 'lkr' ? 'Rs.' : currency.toUpperCase()
const money = (amount) => `${symbol} ${Number(amount).toLocaleString('en-LK')}`
const shortId = (order) => String(order._id).slice(-8).toUpperCase()

const itemsTable = (order) => `
    <table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:14px">
        ${order.items.map(item => `
            <tr style="border-bottom:1px solid #eee">
                <td>${escapeHtml(item.name)} (${escapeHtml(item.size)})
                    ${describeCustomization(item.custom).map(line => `<br><span style="color:#6B5560;font-size:12px">${escapeHtml(line)}</span>`).join('')}
                    ${item.custom?.photo ? `<br><a href="${escapeHtml(item.custom.photo)}" style="font-size:12px">View photo</a>` : ''}</td>
                <td align="center">x ${item.quantity}</td>
                <td align="right">${money(item.price * item.quantity)}</td>
            </tr>`).join('')}
        <tr><td colspan="2" align="right"><b>Total</b></td><td align="right"><b>${money(order.amount)}</b></td></tr>
    </table>`

// event: 'placed' | 'paid' | 'status'
export const notifyOrder = async (order, event) => {
    const { email, phone, firstName } = order.address || {}
    const id = shortId(order)
    const trackUrl = `${frontendUrl}/orders`

    let subject, intro, sms
    if (event === 'status') {
        subject = `${storeName}: order #${id} is now "${order.status}"`
        intro = `Your order status has been updated to <b>${order.status}</b>.`
        sms = `${storeName}: your order #${id} is now "${order.status}". Track it at ${trackUrl}`
    } else {
        subject = `${storeName}: order #${id} confirmed`
        intro = event === 'paid'
            ? `We've received your payment via ${order.paymentMethod}. Your order is confirmed!`
            : `Your Cash on Delivery order has been placed. Please keep ${money(order.amount)} ready on delivery.`
        sms = `${storeName}: order #${id} confirmed (${money(order.amount)}, ${order.paymentMethod}). Track it at ${trackUrl}`
    }

    const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#333">
            <h2 style="color:#e11d48">${storeName}</h2>
            <p>Hi ${escapeHtml(firstName) || 'there'},</p>
            <p>${intro}</p>
            <p>Order <b>#${id}</b></p>
            ${itemsTable(order)}
            ${order.address?.giftNote ? `<p><b>Gift note:</b> <i>${escapeHtml(order.address.giftNote)}</i></p>` : ''}
            <p><a href="${trackUrl}" style="color:#e11d48">Track your order</a></p>
            <p style="color:#999;font-size:12px">Thank you for shopping with ${storeName}.</p>
        </div>`

    await Promise.all([sendEmail({ to: email, subject, html }), sendSMS(phone, sms)])

    if (event !== 'status' && process.env.ADMIN_EMAIL) {
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `New order #${id} - ${money(order.amount)} (${order.paymentMethod})`,
            html: `<p>New order from ${escapeHtml(firstName)} ${escapeHtml(order.address?.lastName)} (${escapeHtml(email)}).</p>${itemsTable(order)}${order.address?.giftNote ? `<p><b>Gift note:</b> ${escapeHtml(order.address.giftNote)}</p>` : ''}`
        })
    }
}
