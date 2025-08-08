import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      firstName: string;
      email: string;
      role: string;
    };
  }
}