'use strict'
require('dotenv').config()
const airtable = require('airtable');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//configure Airtable
airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });


module.exports = async function (fastify, opts) {
    fastify.post('/login', async function (request, reply) {
        let code = request.body.code;
        let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_USERS_TABLE);
        let records = await table.select().all();
        let valid = false;
        let admin = false;
        await records.forEach(record => {
            if (bcrypt.compareSync(code, record.fields.Hash) && !valid) {
                valid = true;
                if(record.fields.Admin) {
                    admin = true;
                }
            }
        });
        if(valid) {
            const token = jwt.sign({ code: code, auth: true, admin: admin }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return { success: true, token: token };
        } else {
            //code is invalid, return error
            return { error: "Unbekanntes Login", success: false };
        }
    });
}
