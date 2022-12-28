import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus';
import { google } from 'googleapis';

export const handler = (input: FieldResolveInput) =>
  resolverFor('Query', 'getGoogleOAuthLink', () => {
    require('dotenv').config();
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      clientSecret: process.env.GOOGLE_SECRET_KEY || '',
    });
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: 'https://www.googleapis.com/auth/userinfo.email',
      include_granted_scopes: true,
    });
    return authorizationUrl;
  })();
