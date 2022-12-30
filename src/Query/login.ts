import { FieldResolveInput, FieldResolveOutput } from 'stucco-js';
import { DB } from '../db/mongo';
import { ResolverType, ResolverInputTypes, LoginType } from '../zeus';
import { JwtPayload, sign } from 'jsonwebtoken';
import { comparePasswords } from '../UserMiddleware';
import jwtDecode from 'jwt-decode';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { AzureFunction } from '@azure/functions';

export const handler = async (input: FieldResolveInput): Promise<FieldResolveOutput> => {
  const args = input.arguments as ResolverType<ResolverInputTypes['Query']['login']>;
  const db = await DB();
  require('dotenv').config();
  switch (args.user.loginType) {
    case LoginType.GoogleOAuth:
      if (!args.user.code) throw new Error('code is not exists in args');
      args.user.code = args.user.code.replace(/%2F/i, '/');
      const googleData = new FormData();
      googleData.append('code', args.user.code);
      googleData.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
      googleData.append('client_secret', process.env.GOOGLE_SECRET_KEY || '');
      googleData.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI || '');
      googleData.append('grant_type', 'authorization_code');
      const response = await fetch('https://accounts.google.com/o/oauth2/token', {
        method: 'POST',
        body: googleData,
      });
      const tokenid = (await response.json()).id_token;
      if (!tokenid) throw new Error('token not generated');
      const token = jwtDecode<JwtPayload>(tokenid);
      if (!token) throw new Error('token cannot be decoded');
      if ((await db.collection('UserCollection').findOne({ username: token.sub })) === undefined) {
        await db.collection('UserCollection').insertOne({ username: token.sub, token: tokenid });
      }
      return tokenid;
    case LoginType.Github:
      if (!args.user.code) throw new Error('code is not exists in args');
      const githubData = new FormData();
      githubData.append('code', args.user.code);
      githubData.append('client_id', process.env.GITHUB_APPLICATION_CLIENT_ID || '');
      githubData.append('client_secret', process.env.GITHUB_APPLICATION_CLIENT_SECRET || '');
      githubData.append('redirect_uri', process.env.GITHUB_REDIRECT_URI || '');
      const githubResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        body: githubData,
      });
      console.log(githubResponse);
      return githubResponse.text();
    case LoginType.Default:
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT secret not set');
      }
      if (!args.user.password || !args.user.password)
        throw new Error('default login must contain username and password');
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
