import nodeMailer from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/ses-transport'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

const options: SMTPTransport.Options = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
}

export const transporter = nodeMailer.createTransport(options)

export const sendMail = async (to: string, subject: string, html: string) => {
  const mailOption: MailOptions = {
    from: 'Tạp hóa Hòa Phát',
    to,
    subject,
    html,
  }
  return transporter.sendMail(mailOption)
}
