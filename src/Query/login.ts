import { FieldResolveInput, FieldResolveOutput } from 'stucco-js';
import { DB } from '../db/mongo';
import { ResolverType, ResolverInputTypes } from '../zeus';
import { sign } from 'jsonwebtoken';
import { comparePasswords } from '../UserMiddleware';

export const handler = async (input: FieldResolveInput): Promise<FieldResolveOutput> => {
  const args = input.arguments as ResolverType<ResolverInputTypes['Query']['login']>;
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret not set');
  }
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
    console.log(passwordMatch);
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
};
