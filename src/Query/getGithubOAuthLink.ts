import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus';

export const handler = (input: FieldResolveInput) =>
  resolverFor('Query', 'getGithubOAuthLink', ({ scopes }) => {
    require('dotenv').config();
    let authorizationUrl = 'https://github.com/login/oauth/authorize?scope=repo%20read:user';
    if (Array.isArray(scopes) && scopes.length > 0) {
      scopes.forEach((scope) => {
        authorizationUrl += '%20' + scope;
      });
    }
    return (
      authorizationUrl +
      `&client_id=${process.env.GITHUB_APPLICATION_CLIENT_ID}&state=SETTINGSGITHUB&redirect_uri=${process.env.GITHUB_REDIRECT_URI}`
    );
  })(input.arguments, input.source);
