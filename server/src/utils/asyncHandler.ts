import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * O Express 4 não captura erros de handlers `async`: uma falha do banco (ex.: o Neon fechando uma
 * conexão ociosa) virava "unhandled rejection" e derrubava o processo. Aqui o erro vai para o
 * handler de erro do server.ts, que responde 500 e mantém a API de pé.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
