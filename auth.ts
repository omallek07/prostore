import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          type: 'email',
        },
        password: {
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if user exists and password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password,
          );

          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }

          // User does not exist or password does not match
          return null;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }) {
      // Set the user ID from the token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      // If there is an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name;
      }

      return session;
    },
    async jwt({ token, user, session, trigger }) {
      // If user is available, set the token properties
      if (user) {
        token.id = user.id;
        token.role = user.role || '';

        // If user has no name then use email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];
          // Update the database to reflect token name
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              name: token.name,
            },
          });
        }

        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: {
                sessionCartId,
              },
            });

            if (sessionCart) {
              // Delete current user cart
              await prisma.cart.deleteMany({
                where: {
                  userId: user.id,
                },
              });

              // Assign new cart
              await prisma.cart.update({
                where: {
                  id: sessionCart.id,
                },
                data: {
                  userId: user.id,
                },
              });
            }
          }
        }
      }

      // Handle session updates
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
    authorized({ request, auth }) {
      // Array of regex patterns of paths we want to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];

      // Get pathname from the req URL object
      const { pathname } = request.nextUrl;

      // Check if user is not authenticated and accessing a protected path
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      if (!request.cookies.get('sessionCartId')) {
        // Check for session cart cookie
        // Generate new session cart id cookie
        const sessionCartId = crypto.randomUUID();
        // Clone the request headers
        const newRequestHeaders = new Headers(request.headers);

        // Create new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        // Set newly generated sessionCartId in the response cookies
        response.cookies.set('sessionCartId', sessionCartId);

        return response;
      } else {
        return true;
      }
    },
  },
});
