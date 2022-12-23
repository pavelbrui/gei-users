import { Db } from 'mongodb';
import { FieldResolveInput } from 'stucco-js';
import { InviteTokenCollection, UserCollection } from '../db/collections';
import { DB } from '../db/mongo';
import { passwordSha512 } from '../UserMiddleware';
import crypto from 'crypto';
import { resolverFor } from '../zeus';

let indexOnce = false;
const doIndex = async (db: Db) => {
  if (indexOnce) return;
  await db.collection(UserCollection).createIndex({ username: 1 }, { unique: true });
  indexOnce = true;
};

export const isPasswordEqualToSpecialParams = (password: string): boolean =>
  password.length >= 6 && /[^a-zA-Z0-9]/.test(password) && /[a-z]/.test(password) && /[A-Z]/.test(password);

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Mutation', 'register', async ({ userData: { username, password, invitationToken } }) => {
    const db = await DB();
    await doIndex(db);
    if (!isPasswordEqualToSpecialParams(password)) {
      throw new Error('Password doesnt not fit to params');
    }
    const user = await db
      .collection(UserCollection)
      .findOne({ username })
      .catch(() => undefined);
    if (user) {
      throw new Error('User already exists');
    }
    const s = crypto.randomBytes(8).toString('hex');
    const { salt, passwordHash } = passwordSha512(password, s);
    const tokenInformaton = await db.collection(InviteTokenCollection).findOne({ token: invitationToken });
    if (tokenInformaton) {
      if (new Date(tokenInformaton.expires) < new Date()) throw new Error('Token expired');
      if (!username.includes(tokenInformaton.domain))
        throw new Error(
          `username is not equal to required domain from token, your pattern is ${tokenInformaton.domain}`,
        );
    }
    const res = await db.collection(UserCollection).insertOne({ username, salt, passwordHash, emailConfirmed: false });
    return res.insertedId.toHexString().length !== 0;
  })(input.arguments);
