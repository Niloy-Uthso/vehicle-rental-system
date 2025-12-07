import { NextFunction, Request, Response } from "express";

const logger = (req: Request, res: Response, next: NextFunction) => {

    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
}

export default logger;