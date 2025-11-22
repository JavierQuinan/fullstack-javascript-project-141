// src/app.js
import Fastify from 'fastify';

export const buildApp = () => {
  const app = Fastify({
    logger: true,
  });

  // Ruta principal: página /
  app.get('/', async (request, reply) => {
    // Aquí luego cambiarás el texto para que sea EXACTO al de la demo
    return { message: 'Welcome to Hexlet Fastify App' };
  });

  return app;
};

export default buildApp;
