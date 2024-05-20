const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');
const fs = require('fs');

const app = express();
const port = 3000;

const AUTHOR_NAME = "MIŁOSZ PIECHOTA";

// Zapisywanie informacji na temat uruchomienia serwera w pliku server.log
const startLog = `Server started at ${new Date().toISOString()} by ${AUTHOR_NAME} on port ${port}\n`;
fs.appendFileSync('server.log', startLog);

// Pobieranie strefy czasowej na podstawie adresu IP
const getTimezone = async (ip) => {
    try {
        const response = await axios.get(`https://ipinfo.io/${ip}/json`);
        if (response.data && response.data.timezone) {
            return response.data.timezone;
        }
    } catch (error) {
        console.error(`Error retrieving timezone for IP ${ip}: ${error}`);
    }
    return 'UTC';
};

//definiowanie trasy 
app.get('/api/client-info', async (req, res) => {
    const clientIp = req.ip === '::1' ? '127.0.0.1' : req.ip;
    const timezone = await getTimezone(clientIp);
    const clientTime = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss Z');

    res.json({
        client_ip: clientIp,
        client_time: clientTime
    });
});

// trasa dla korzenia
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
