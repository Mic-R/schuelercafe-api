'use strict'
require('dotenv').config()
const airtable = require('airtable');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//configure Airtable
airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });


module.exports = async function (fastify, opts) {
    fastify.post('/list', async function (request, reply) {
        let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_PRODUCTS_TABLE);
        let records = await table.select().all();
        const products = [];
        if(await jwt.verify(request.body.token, process.env.JWT_SECRET)) {
            await records.forEach(record => {
                products.push(record.fields);
            });
            reply.send(products);
        }else {
            reply.send({error: "Unbekannter Token", success: false});
        }
    });
    fastify.post('/category', async function (request, reply) {
        if(await jwt.verify(request.body.token, process.env.JWT_SECRET)) {
            let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_PRODUCTS_TABLE);
            let records = await table.select().all();
            const categories = [];
            records.forEach(record => {
                if(!categories.includes(record.fields.Kategorie)) {
                    categories.push(record.fields.Kategorie);
                }
            });
            reply.send(categories);
        }else {
            reply.send({error: "Unbekannter Token", success: false});
        }
    });
    fastify.post('/itemsbycategory', async function (request, reply) {
        if(await jwt.verify(request.body.token, process.env.JWT_SECRET)) {
            let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_PRODUCTS_TABLE);
            let records = await table.select().all();
            const products = [];
            records.forEach(record => {
                if(record.fields.Kategorie === request.body.category) {
                    products.push(record.fields);
                }
            });
            reply.send(products);
        }else {
            reply.send({error: "Unbekannter Token", success: false});
        }
    });
}
