// api/message.js

let userDatabase = {
    "12345678": "Nahum Rondan",
    "87654321": "John",
    // Agrega más usuarios según sea necesario
  };
  
  function handleGreeting(message) {
    if (message.toLowerCase() === 'hola') {
      return { reply: 'Por favor, envíe su DNI.' };
    }
    return null;
  }
  
  function handleDNI(message) {
    if (/^\d{8}$/.test(message)) {
      const userName = userDatabase[message];
      if (userName) {
        return { reply: `Bienvenido, ${userName}.` };
      } else {
        return { reply: 'DNI no encontrado.' };
      }
    }
    return null;
  }
  
  export default function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Método no permitido" });
    }
  
    const { app, sender, message, phone, group_name } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: "El mensaje está vacío." });
    }
  
    let response;
  
    // Procesa diferentes tipos de mensajes
    response = handleGreeting(message) || handleDNI(message);
  
    if (response) {
      return res.status(200).json(response);
    }
  
    return res.status(400).json({ error: 'Mensaje no reconocido. Envíe "Hola" o un DNI válido.' });
  }
  