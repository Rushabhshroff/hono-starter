import { SESClient as AWSClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import getBase64 from './base64';
import { createMimeMessage } from 'mimetext'
export type MailSendOptions = {
    from:string,
    fromName?: string
    subject: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    html?: string;
    text?: string;
    attachments?: File[];
};

export class SESClient {
    client: AWSClient;
    constructor(
        readonly region: string,
        readonly key,
        readonly secret
    ) {
        this.client = new AWSClient({
            region: region,
            credentials: {
                accessKeyId: key,
                secretAccessKey: secret,
            },
        });
    }
    async send(sendOptions: MailSendOptions) {
        const message = createMimeMessage()
        message.setSender({
            addr: sendOptions.from,
            name: sendOptions.fromName,
        })
        message.setTo(sendOptions.to)
        if (sendOptions.cc) {
            message.setCc(sendOptions.cc)
        }
        if (sendOptions.bcc) {
            message.setBcc(sendOptions.bcc)
        }
        if (sendOptions.subject) {
            message.setSubject(sendOptions.subject)
        }
        if (sendOptions.replyTo) {
            message.setHeader('Reply-To', sendOptions.replyTo)
        }
        if (sendOptions.text) {
            //@ts-ignore
            message.addMessage({
                contentType: 'text/plain',
                data: sendOptions.text
            })
        } else if (sendOptions.html) {
            //@ts-ignore
            message.addMessage({
                contentType: 'text/html',
                data: sendOptions.html
            })
        }

        if (sendOptions.attachments) {
            for (let att of (sendOptions.attachments || [])) {
                const content = await getBase64(att)
                //@ts-ignore
                message.addAttachment({ filename: att.name, contentType: att.type as MIMEType, data: content })
            }
        }
        const command = new SendRawEmailCommand({
            //@ts-ignore
            Destinations: message.getRecipients({ type: 'to' }).map(mailbox => mailbox.addr),
            RawMessage: {
                Data: Buffer.from(message.asRaw(), 'utf8') // the raw message data needs to be sent as uint8array
            },
            //@ts-ignore
            Source: message.getSender().addr
        });
        return this.client.send(command);
    }
}

