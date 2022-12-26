import { FieldResolveInput } from 'stucco-js';
import { DB } from '../db/mongo';
import crypto from 'crypto';
import { InviteTokenCollection } from '../db/collections';
import { resolverForUser } from '../UserMiddleware';
import { Document, WithId } from 'mongodb';

export const genRandomString = (length: number) =>
  crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);

export const handler = async (input: FieldResolveInput) =>
  resolverForUser('Mutation', 'generateInviteToken', async ({ user, tokenOptions: { expires, domain } }) => {
    const db = await DB();
    let generatedToken: string;
    let tokenInDb: WithId<Document> | null;
    do {
      generatedToken = genRandomString(16);
      tokenInDb = await db.collection(InviteTokenCollection).findOne({ token: generatedToken });
    } while (tokenInDb);
    await db
      .collection(InviteTokenCollection)
      .insertOne({ token: generatedToken, expires, domain, owner: user.username });
    return generatedToken;
  })(input.arguments, input);
