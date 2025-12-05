const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endPointFiles = ['./server.js'];

const doc = {
    info: {
        title: 'Overvak - Sistema de monitoreo remoto para personas con Alzheimer a través de un wearable.',
        description: 'Documentación oficial de la API RESTful para el ecosistema **Overvak**. \n\n' +
                     'Este backend gestiona la comunicación entre los dispositivos wearables y la aplicación web. \n\n' +
                     '**Módulos del sistema:**\n' +
                     '1. **Autenticación:** Gestión de cuidadores y tokens.\n' +
                     '2. **Pacientes:** Vinculación de dispositivos y perfiles.\n' +
                     '3. **Datos IoT:** Ingesta de sensores, tales como el MAX30102, GPS (NEO6MV2) y acelerómetro.\n' +
                     '4. **Geocercas:** Algoritmos de punto en polígono para zonas seguras.\n' +
                     '5. **Alertas:** Notificaciones de emergencia.',
        version: '1.2.1'
    },
    host: 'localhost:3000',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Introduce tu token así: Bearer <tu_token>'
        }
    },
    definitions: {
        Cuidador: {
            _id: "645d9b...",
            nombre: "Alberto",
            apellidoP: "Vega",
            apellidoM: "Monterrubio",
            email: "alberto@email.com",
            telefono: "5512345678",
            verificado: true,
            createdAt: "2025-01-10T10:00:00Z",
            updatedAt: "2025-01-10T10:00:00Z"
        },
        Paciente: {
            _id: "645d9c...",
            dispositivo_id: "ESP32-MAC-ADDRESS",
            cuidador: "645d9b...", 
            nombre: "Juan",
            apellidoP: "Pérez",
            apellidoM: "López",
            edad: 75,
            estaEnGeocerca: true,
            creadoEn: "2025-01-15T09:30:00Z"
        },
        Dato: {
            _id: "645d9d...",
            paciente: "645d9c...",
            frecuencia: 85,
            oxigeno: 98,
            latitud: 19.4326,
            longitud: -99.1332,
            contacto_cardiaco: true,
            caida_detectada: false,
            inactividad_detectada: false,
            fecha: "2025-05-26T10:00:00.000Z"
        },
        Alerta: {
            _id: "645d9e...",
            cuidador: "645d9b...",
            paciente: "645d9c...",
            tipo: "caida", // enum: salida_geocerca, caida, etc.
            mensaje: "¡URGENTE! Se ha detectado una caída.",
            vista: false,
            createdAt: "2025-05-26T10:05:00.000Z",
            updatedAt: "2025-05-26T10:05:00.000Z"
        },
        Geocerca: {
            _id: "645d9f...",
            cuidador: "645d9b...",
            paciente: "645d9c...",
            nombre: "Casa",
            coords: [
                { lat: 19.4326, lng: -99.1332 },
                { lat: 19.4328, lng: -99.1334 },
                { lat: 19.4325, lng: -99.1330 }
            ],
            createdAt: "2025-02-01T08:00:00Z",
            updatedAt: "2025-02-01T08:00:00Z"
        }
    }
};

swaggerAutogen(outputFile, endPointFiles, doc);
