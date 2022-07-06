import { FieldResolveInput } from 'stucco-js';
import { getUserFromHandlerInput } from '../UserMiddleware';

export const handler = async (input: FieldResolveInput) => getUserFromHandlerInput(input);
