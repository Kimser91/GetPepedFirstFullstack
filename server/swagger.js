// swagger.js
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();
const nodemailer = require ('nodemailer')
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SQL Express X Node.js',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/`,
      }
    ],
  },
  apis: ['./swagger.js'],
};

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUI, swaggerSpec };
