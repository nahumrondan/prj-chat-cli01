const xlsx = require('xlsx');
const path = require('path');
const nodemailer = require('nodemailer');

// Cargar el archivo Excel desde la misma carpeta del proyecto
const workbook = xlsx.readFile(path.join(__dirname, 'RUCS SET24 _ CHAT BOT_CARTERA EMPRESAS.xlsx'));
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Configurar el transporte de Nodemailer (utilizando Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rociodurand08@gmail.com', // Tu correo Gmail
    pass: 'nahromes987' // Tu contraseña de Gmail o una contraseña de aplicaciones si tienes 2FA activado
  }
});

// Función para enviar el correo
function sendEmail(to, subject, text) {
  const mailOptions = {
    from: 'rociodurand08@gmail.com',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Correo enviado: ' + info.response);
    }
  });
}

// Función para encontrar un cliente por RUC
function findClientByRUC(ruc) {
  return data.find(client => client.RUC === ruc);
}

function handleGreeting(message) {
  const greetings = ['hola', 'buenas tardes', 'buenos días'];
  if (greetings.includes(message.toLowerCase())) {
    return {
      reply: 'Hola que tal, le saluda la empresa "Prueba", por favor elija una opción:\na) Ingresar mi RUC'
    };
  }
  return null;
}

function handleMenuSelection(message) {
  if (message.toLowerCase() === 'a') {
    return { reply: 'Por favor, ingrese su RUC.' };
  }
  return { error: 'Opción no válida. Por favor seleccione una opción válida.' };
}

function handleRUC(message) {
  if (/^\d{11}$/.test(message)) {
    const client = findClientByRUC(message);
    if (client) {
      return {
        reply: `Bienvenido, ${client.RUC}. ¿Qué desea realizar?\na) Contactar a un asesor`
      };
    } else {
      return { error: 'RUC no encontrado. Intente nuevamente.' };
    }
  }
  return { error: 'Formato de RUC inválido. Debe contener 11 dígitos.' };
}

function handleContactAdvisor(message, ruc) {
  if (message.toLowerCase() === 'a') {
    const client = findClientByRUC(ruc);
    if (client) {
      const advisorName = client['Nom. Liebre'];
      const advisorEmail = client['Correo_Asesor'];

      // Enviar correo al asesor
      sendEmail(advisorEmail, 'Un cliente requiere su atención', `El cliente con RUC ${ruc} desea contactarse con usted.`);

      return {
        reply: `En breve el asesor ${advisorName} se pondrá en contacto con usted a través de su correo.`
      };
    }
    return { error: 'Error al contactar al asesor. Intente nuevamente.' };
  }
  return { error: 'Opción no válida. Por favor seleccione una opción válida.' };
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "El mensaje está vacío." });
  }

  let response;

  // Paso 1: Verifica saludo
  response = handleGreeting(message);
  if (response) {
    return res.status(200).json(response);
  }

  // Paso 2: Verifica si eligió una opción del menú
  response = handleMenuSelection(message);
  if (response.reply) {
    return res.status(200).json(response);
  } else if (response.error) {
    return res.status(400).json(response);
  }

  // Paso 3: Verifica si es un RUC
  response = handleRUC(message);
  if (response.reply) {
    return res.status(200).json(response);
  } else if (response.error) {
    return res.status(400).json(response);
  }

  // Paso 4: Verifica si eligió contactar a un asesor
  // Aquí debes tener una lógica para almacenar el RUC ingresado previamente (puedes usar una variable de sesión)
  const ruc = "20605288791"; // Esto es un ejemplo, deberías almacenar el RUC del usuario en algún lugar
  response = handleContactAdvisor(message, ruc);
  if (response.reply) {
    return res.status(200).json(response);
  } else if (response.error) {
    return res.status(400).json(response);
  }

  return res.status(400).json({ error: 'Mensaje no reconocido. Intente nuevamente.' });
}
