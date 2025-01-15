const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');



const app = express();
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Allow cross-origin requests

// Configurar el transporte de correo con Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // O el proveedor de correo que prefieras
  auth: {
    user: 'glowel.dev@gmail.com', // Tu dirección de correo
    pass: 'jymu nofg pyyh fwko', // Tu contraseña o token de acceso
  },
});



// Ruta para recibir los datos del formulario
app.post('/send-email', async (req, res) => {
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
});

// Configurar el puerto y arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

