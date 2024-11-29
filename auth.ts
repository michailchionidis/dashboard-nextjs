import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { db, sql } from '@vercel/postgres';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

// Validation schema
const credentialsSchema = z.object({ 
  email: z.string().email('Invalid email address'), 
  password: z.string().min(6, 'Password must be at least 6 characters')
});

async function getUser(email: string): Promise<User | undefined> {
  let client;
  try {
    client = await db.connect();
    
    // Χρήση parameterized query για ασφάλεια
    const result = await client.sql<User>`
      SELECT * FROM users 
      WHERE email = ${email}
      LIMIT 1
    `;

    return result.rows[0];
  } 
  catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Authentication failed. Please try again later.');
  }
  finally {
    await client?.release();
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          // Validate credentials
          const parsedCredentials = credentialsSchema.safeParse(credentials);
 
          if (!parsedCredentials.success) {
            console.error('Validation error:', parsedCredentials.error.errors);
            return null;
          }

          const { email, password } = parsedCredentials.data;

          // Get user
          const user = await getUser(email);
          
          // If no user found, return null but don't specify why
          if (!user) {
            console.log('User not found');
            return null;
          }

          // Verify password using constant-time comparison
          const passwordsMatch = await bcrypt.compare(password, user.password);
   
          if (!passwordsMatch) {
            console.log('Invalid password');
            return null;
          }

          // Don't send the password hash to the client
          const { password: _, ...userWithoutPassword } = user;
          return userWithoutPassword;

        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  // Προσθήκη επιπλέον ρυθμίσεων ασφαλείας
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add user id to the token
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Add user id to the session
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});