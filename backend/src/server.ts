import express, { Request, NextFunction, Response } from "express";
import 'express-async-errors';
import { router } from "./routes";
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(express.json());

// Configuração CORS corrigida
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Em desenvolvimento, permite todas as origens
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://192.168.43.188:3000',
      'http://172.20.10.5:3000',

      // Adicione mais se necessário
    ];

    // Permite requisições sem origin (como mobile apps ou postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Authorization"],
  credentials: true,
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// Pré-flight OPTIONS requests
app.options('*', cors(corsOptions));

app.use(router);

// Caminho estático
app.use(
  ['/files', '/tmp'],
  express.static(path.resolve(__dirname, '..', 'tmp'))
);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({
      error: err.message
    });
  }
  return res.status(500).json({
    status: 'Error',
    message: 'Internal Error.'
  });
});

import { initSocket } from "./socket_io";

const server = http.createServer(app);

const io = initSocket(server);

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Usar server.listen em vez de app.listen
server.listen(3333, () => console.log("Servidor online na porta 3333"));