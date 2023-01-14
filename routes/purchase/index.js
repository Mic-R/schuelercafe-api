'use strict'
require('dotenv').config()
const airtable = require('airtable');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//configure Airtable
airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });


module.exports = async function (fastify, opts) {
    fastify.post('/add', async function (request, reply) {
        let table = airtable.base(process.env.AIRTABLE_BASE_ID).table(process.env.AIRTABLE_CALC_TABLE);
        if(await jwt.verify(request.body.token, process.env.JWT_SECRET)) {
            let names = request.body.products.map(product => {return product.name;}).join(", ");
            let sum = 0.00;
            request.body.products.forEach(product => {
                sum += parseFloat(product.price);
            });
            await table.create({
                "Produkte": names,
                "Summe": sum
            });
            reply.send({success: true});
        }else {
            reply.send({error: "Unbekannter Token", success: false});
        }
    });
}
