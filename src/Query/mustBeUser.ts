import { FieldResolveInput } from 'stucco-js';
import { getUserFromHandlerInputOrThrow } from '../UserMiddleware';

export const handler = async (input: FieldResolveInput) => getUserFromHandlerInputOrThrow(input);
