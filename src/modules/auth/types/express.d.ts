declare namespace Express {
  export interface User {
    userId: string;
    email: string;
  }

  export interface Request {
    user?: User;
  }
}
  