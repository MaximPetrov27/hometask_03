import type { NextFunction, Request, Response } from "express";

const EXPECTED_USER = "admin";
const EXPECTED_PASS = "qwerty";

export function requireBasicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Basic ")) {
    res.sendStatus(401);
    return;
  }

  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    res.sendStatus(401);
    return;
  }

  const sep = decoded.indexOf(":");
  const user = sep >= 0 ? decoded.slice(0, sep) : "";
  const pass = sep >= 0 ? decoded.slice(sep + 1) : "";

  if (user === EXPECTED_USER && pass === EXPECTED_PASS) {
    next();
    return;
  }

  res.sendStatus(401);
}
