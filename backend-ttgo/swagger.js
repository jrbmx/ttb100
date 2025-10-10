const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endPointFiles = ['./server.js'];

const doc = {
    info: {
        title: 'API',
        description: 'Observar la API'
    },
    host: 'localhost:3000',
    schemes: ['http']
};

swaggerAutogen(outputFile, endPointFiles, doc);
