const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const cors = require('cors')
var cron = require('node-cron');
require('dotenv').config()
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.get('/', (req, res) => {
    res.send('Whatsapp Api')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

let waClient = {}
const queue = [];
const wa = require('@open-wa/wa-automate');

wa.create({
    sessionId: "keap-http",
    multiDevice: true, //required to enable multiDevice support
    authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'IT_IT',
    logConsole: true,
    popup: true,
    qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
    licenseKey: process.env.LICENSE
}).then(client => start(client));

function start(client) {
    waClient = client
}

app.post('/message', (req,res)=>{

    if (req.body.phone && req.body.token === process.env.SECRET) {
        const phone = req.body.phone.replaceAll('(', '').replaceAll(')', '')
            .replaceAll(' ','').replaceAll('-','')
            .replaceAll('+','').concat('@c.us');

       queue.push( {phone: phone, message: req.body.message} );


      res.send('ok').status(200);
    }
    else res.send('phone missing').status(404)

     })



cron.schedule('* * * * *', () => {
    if (queue.length){
        sendQueue(queue[0].phone,queue[0].message)
    }
    else console.log('vuoto')
});

function sendQueue(phone,message){
    queue.shift()
    waClient.sendText(phone, message).then(res => console.log(res));
}