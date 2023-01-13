'use strict'
require('dotenv').config()
const airtable = require('airtable');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//configure Airtable
airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });


module.exports = async function (fastify, opts) {
    fastify.post('/login', async function (request, reply) {
        let code = request.body.code;
        let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_USERS_TABLE);
        let records = await table.select().all();
        let valid = false;
        console.log(records);
        await records.forEach(record => {
            console.log(record.fields.Hash)
            if (bcrypt.compareSync(code, record.fields.Hash) && !valid) {
                valid = true;
            }
        });
        if(valid) {
            const token = jwt.sign({ code: code, auth: true }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return { success: true, token: token };
        } else {
            //code is invalid, return error
            return { error: "Unbekanntes Login", success: false };
        }
    });
}
