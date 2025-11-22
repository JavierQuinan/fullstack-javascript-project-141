// src/server.js
import 'dotenv/config.js';
import { buildApp } from './app.js';

const app = buildApp();

const PORT = process.env.PORT || 3000;
// Importante para Render: escuchar en 0.0.0.0
const HOST = '0.0.0.0';

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
