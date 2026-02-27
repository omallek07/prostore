import { DefaultSession } from 'next-auth';

type Role = 'admin' | 'user';

declare module 'next-auth' {
  export interface Session {
    user: {
      role: Role;
    } & DefaultSession['user'];
  }
}
