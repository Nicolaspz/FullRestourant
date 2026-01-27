// src/middlewares/isAuthenticated.ts
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface Payload {
  sub: string;
  id?: string;
  userId?: string;
  organizationId?: string;
  name?: string;
  email?: string;
  role?: string;
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Receber o Token
  const authToken = req.headers.authorization;
  
  if (!authToken) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  // Separar "Bearer" do token
  const [, token] = authToken.split(" ");
  
  if (!token) {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  try {
    // Validar o token
    const decoded = verify(
      token,
      process.env.JWT_SECRET!
    ) as Payload;

    console.log("Token decodificado:", decoded);
    
    // Recuperar o id e enviar no Request
    req.user_id = decoded.sub || decoded.id || decoded.userId;
    
    // Adicionar outras informações se disponíveis
    if (decoded.organizationId) {
      req.organizationId = decoded.organizationId;
    }
    
    // Se tiver informações do usuário, adicionar
    if (decoded.name || decoded.email) {
      req.user = {
        id: decoded.sub || decoded.id || decoded.userId,
        name: decoded.name || '',
        email: decoded.email || '',
        role: decoded.role || 'user'
      };
    }

    console.log("Middleware - Dados adicionados ao request:", {
      user_id: req.user_id,
      organizationId: req.organizationId,
      user: req.user
    });

    return next();
  } catch (error: any) {
    console.error("Erro na autenticação:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expirado" });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token inválido" });
    }
    
    return res.status(401).json({ error: "Falha na autenticação" });
  }
}