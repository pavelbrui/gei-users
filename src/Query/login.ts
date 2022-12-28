import { FieldResolveInput, FieldResolveOutput } from 'stucco-js';
import { DB } from '../db/mongo';
import { ResolverType, ResolverInputTypes, LoginType } from '../zeus';
import { sign } from 'jsonwebtoken';
import { comparePasswords } from '../UserMiddleware';

export const handler = async (input: FieldResolveInput): Promise<FieldResolveOutput> => {
  const args = input.arguments as ResolverType<ResolverInputTypes['Query']['login']>;
  require('dotenv').config();
  switch (args.user.loginType) {
    case LoginType.GoogleOAuth:
      if (!args.user.code) throw new Error('code is not exists in args');
      args.user.code = args.user.code.replace(/%2F/i, '/');
      const data = new FormData();
      data.append('code', args.user.code);
      data.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
      data.append('client_secret', process.env.GOOGLE_SECRET_KEY || '');
      data.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI || '');
      data.append('grant_type', 'authorization_code');
      const response = await fetch('https://accounts.google.com/o/oauth2/token', {
        method: 'POST',
        body: data,
      });
      return response.json().then((data) => data.access_token);
    case LoginType.Default:
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT secret not set');
      }
      if (!args.user.password || !args.user.password)
        throw new Error('default login must contain username and password');
      const db = await DB();
      const user = await db.collection('UserCollection').findOne({
        username: args.user.username,
      });
      if (!user) {
        throw new Error('Invalid login or password');
      }
      if (user.passwordHash && user.salt) {
        const passwordMatch = comparePasswords({
          password: args.user.password,
          hash: user.passwordHash,
          salt: user.salt,
        });
        if (!passwordMatch) {
          throw new Error('Invalid login or password');
        }
        return sign({ username: args.user.username }, process.env.JWT_SECRET);
      }
      if (user.password) {
        if (user.password !== args.user.password) {
          throw new Error('Invalid login or password');
        }
        return sign({ username: args.user.username }, process.env.JWT_SECRET);
      }
  }
};
