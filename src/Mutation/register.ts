import { Db } from 'mongodb';
import { FieldResolveInput } from 'stucco-js';
import { UserCollection } from '../db/collections';
import { DB } from '../db/mongo';
import { passwordSha512 } from '../UserMiddleware';
import crypto from 'crypto';
import { ResolverType, ResolverInputTypes } from '../zeus';

let indexOnce: boolean = false;
const doIndex = async (db: Db) => {
  if (indexOnce) return;
  await db.collection(UserCollection).createIndex({ username: 1 }, { unique: true });
  indexOnce = true;
};

export const handler = async (input: FieldResolveInput) =>
  DB().then(async (db) => {
    await doIndex(db);
    const {
      user: { username, password },
    } = input.arguments as ResolverType<ResolverInputTypes['Mutation']['register']>;
    if (!password) {
      throw new Error('Password cannot be empty');
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
    const res = await db.collection(UserCollection).insertOne({ username, salt, passwordHash });
    return res.insertedId.toHexString().length !== 0;
  });
