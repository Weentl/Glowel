const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Cambiar si usas otro servicio de correo
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint para enviar correos
app.post('/send-email', async (req, res) => {
  const { name, email, phone, company, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Puedes enviar el correo a ti mismo
    subject: 'Nuevo mensaje desde el formulario de contacto',
    html: `
      <h3>Detalles del mensaje:</h3>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo Electrónico:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
      <p><strong>Empresa:</strong> ${company || 'No proporcionada'}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado con éxito.' });
  } catch (error) {
    console.error('Error enviando correo:', error);
    res.status(500).json({ message: 'Hubo un error al enviar el correo.' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
