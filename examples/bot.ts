import { BaileysClass } from '../src/baileys.ts';
// Add type for BaileysClass with getGroupMetadata method
import fetch from 'node-fetch';

const botBaileys = new BaileysClass({});

botBaileys.on('auth_failure', async (error) => console.log("ERROR BOT: ", error));
botBaileys.on('qr', (qr) => console.log("NEW QR CODE: ", qr));
botBaileys.on('ready', async () => console.log('READY BOT'))

let awaitingResponse = false;

botBaileys.on('message', async (message) => {
    // Bible verse feature: Detect queries like "John 3:16"
    if (/^[a-zA-Z]+\s*\d+:\d+$/i.test(message.body.trim())) {
        const verse = message.body.trim();
        try {
            const response = await fetch(`https://bible-api.com/${encodeURIComponent(verse)}`);
            const data = await response.json();
            await botBaileys.sendText(message.from, (data as any).text || "Verse not found.");
        } catch (err) {
            await botBaileys.sendText(message.from, "Error fetching Bible verse.");
        }
        awaitingResponse = false;
        return;
    }

    // /everyone command: Mention all group participants
    if (message.body.trim() === '/everyone' && message.from.endsWith('@g.us')) {
        try {
            // Fetch group metadata (participants)
            const groupMetadata = await botBaileys.getGroupMetadata(message.from);
            const mentions = groupMetadata.participants.map((p: any) => p.id);
            await botBaileys.sendText(message.from, {
                text: mentions.map(m => `@${m.split('@')[0]}`).join(' '),
                mentions
            });
        } catch (err) {
            await botBaileys.sendText(message.from, "Error mentioning everyone.");
        }
        awaitingResponse = false;
        return;
    }

    if (!awaitingResponse) {
        await botBaileys.sendPoll(message.from, 'Select an option', {
            options: ['text', 'media', 'file', 'sticker'],
            multiselect: false
        });
        awaitingResponse = true;
    } else {
        const command = message.body.toLowerCase().trim();
        switch (command) {
            case 'text':
                await botBaileys.sendText(message.from, 'Hello world');
                break;
            case 'media':
                await botBaileys.sendMedia(message.from, 'https://www.w3schools.com/w3css/img_lights.jpg', 'Hello world');
                break;
            case 'file':
                await botBaileys.sendFile(message.from, 'https://github.com/pedrazadixon/sample-files/raw/main/sample_pdf.pdf');
                break;
            case 'sticker':
                await botBaileys.sendSticker(message.from, 'https://gifimgs.com/animations/anime/dragon-ball-z/Goku/goku_34.gif', { pack: 'User', author: 'Me' });
                break;
            default:
                await botBaileys.sendText(message.from, 'Sorry, I did not understand that command. Please select an option from the poll.');
                break;
        }
        awaitingResponse = false;
    }
});



