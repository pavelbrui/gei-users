import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus';
import { DB } from '../db/mongo';
import { UserCollection, VerifyEmailCollection } from '../db/collections';

export const handler = async (input: FieldResolveInput) =>
  resolverFor('Mutation', 'verifyEmail', async ({ verifyData: { username, token } }) => {
    const db = await DB();
    const tokenObject = await db.collection(VerifyEmailCollection).findOne({ username, token });
    if (!tokenObject) {
      throw new Error('token cannot be found');
    }
    await db.collection(UserCollection).updateOne({ username }, { $set: { emailConfirmed: true } });
  })(input.arguments);
