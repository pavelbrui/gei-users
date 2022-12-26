import { FieldResolveInput } from 'stucco-js';
import { comparePasswords, passwordSha512, resolverForUser } from '../UserMiddleware';
import { DB } from '../db/mongo';
import crypto from 'crypto';
import { UserCollection } from '../db/collections';
import { isPasswordEqualToSpecialParams } from './register';

export const handler = async (input: FieldResolveInput) =>
  resolverForUser('Mutation', 'changePassword', async ({ user, passwords }) => {
    const passwordMatch = comparePasswords({
      password: passwords.oldPassword,
      hash: user.passwordHash,
      salt: user.salt,
    });
    if (passwordMatch && isPasswordEqualToSpecialParams(passwords.newPassword)) {
      const s = crypto.randomBytes(8).toString('hex');
      const { salt, passwordHash } = passwordSha512(passwords.newPassword, s);
      await DB().then(
        async (db) =>
          await db.collection(UserCollection).updateOne({ username: user.username }, { $set: { salt, passwordHash } }),
      );
      return true;
    }
    return false;
  })(input.arguments, input);
