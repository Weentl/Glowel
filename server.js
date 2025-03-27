const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(express.json());
app.use(cors());

// Configurar el rate limiter: 100 peticiones cada 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta nuevamente más tarde.',
});
app.use(limiter);

// Configurar el transporte de correo con Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // O el proveedor de correo que prefieras
  auth: {
    user: 'glowel.dev@gmail.com', // Tu dirección de correo
    pass: 'jymu nofg pyyh fwko', // Tu contraseña o token de acceso
  },
});

// Ruta para recibir los datos del formulario con validación y sanitización
app.post(
  '/send-email',
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido.'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Debe ser un correo electrónico válido.'),
    body('phone').optional().trim().escape(),
    body('company').optional().trim().escape(),
    body('message').trim().notEmpty().withMessage('El mensaje es requerido.'),
  ],
  async (req, res) => {
    // Validar los datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array(), message: 'Datos de entrada inválidos.' });
    }

    const { name, email, phone, company, message } = req.body;

    // Configuración del correo electrónico
    const mailOptions = {
      from: 'glowel.dev@gmail.com', // Dirección del remitente
      to: 'glowel.dev@gmail.com', // Tu dirección de correo
      subject: 'Nuevo mensaje de contacto',
      text: `
        Has recibido un nuevo mensaje de contacto:

        Nombre: ${name}
        Correo Electrónico: ${email}
        Teléfono: ${phone || 'No proporcionado'}
        Empresa: ${company || 'No proporcionada'}
        
        Mensaje:
        ${message}
      `,
    };

    try {
      // Enviar el correo
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Correo enviado con éxito' });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      res.status(500).json({ message: 'Hubo un error al enviar el correo' });
    }
  }
);

// Configurar el puerto y arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Self-ping para mantener el servidor activo (si PUBLIC_URL está configurado)
if (process.env.PUBLIC_URL) {
  const protocol = process.env.PUBLIC_URL.startsWith('https') ? require('https') : require('http');
  setInterval(() => {
    protocol.get(process.env.PUBLIC_URL, (res) => {
      console.log(`Self ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Error en el self ping:', err.message);
    });
  }, 300000); // 300000 ms = 5 minutos
}
