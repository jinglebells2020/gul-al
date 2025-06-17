const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true
    }
});

client.on('qr', (qr) => {
    console.log('Сканируй QR-код:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp готов!');
});

// 👉 Добавляем отображение HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API для отправки сообщений
app.post('/send', async (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) return res.status(400).send("Нужен number и message");

    const chatId = number + "@c.us"; // формат
    try {
        await client.sendMessage(chatId, message);
        res.send("Сообщение отправлено!");
    } catch (e) {
        console.error(e);
        res.status(500).send("Ошибка при отправке");
    }
});

client.initialize();

app.listen(3000, () => {
    console.log("Сервер запущен на http://localhost:3000");
});
