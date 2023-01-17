'use strict'
require('dotenv').config()
const airtable = require('airtable');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//configure Airtable
airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });


module.exports = async function (fastify, opts) {
    fastify.post('/list', async function (request, reply) {
        let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_PREORDER_TABLE);
        let records = await table.select().all();
        const orders = [];
        if(await jwt.verify(request.body.token, process.env.JWT_SECRET)) {
            await records.forEach(record => {
                orders.push(record.fields);
            });
            reply.send(orders);
        }else {
            reply.send({error: "Unbekannter Token", success: false});
        }
    });
    fastify.post('/add', async function (request, reply) {
        let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_PREORDER_TABLE);
        if(await jwt.verify(request.body.token, process.env.JWT_SECRET)) {
            table.create({
                "Nummer": request.body.number,
                "Produkt": request.body.product,
                "Status": 0
            })
        }else {
            reply.send({error: "Unbekannter Token", success: false});
        }
    });
    fastify.post('/delete', async function (request, reply) {
        let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_PREORDER_TABLE);
        if(await jwt.verify(request.body.token, process.env.JWT_SECRET)) {
            const records = await table.select().all();
            records.forEach(record => {
                if(record.fields.Nummer === request.body.number) {
                    table.destroy(record.id);
                }
            });
        }else {
            reply.send({error: "Unbekannter Token", success: false});
        }
    });
    //update Status
    fastify.post('/update', async function (request, reply) {
        let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_PREORDER_TABLE);
        if(await jwt.verify(request.body.token, process.env.JWT_SECRET)) {
            const records = await table.select().all();
            records.forEach(record => {
                if(record.fields.Nummer === request.body.number) {
                    table.update(record.id, {
                        Status: request.body.status
                    });
                }
            });
        }else {
            reply.send({error: "Unbekannter Token", success: false});
        }
    });
}
