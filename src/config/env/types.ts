import { ENUM_NODE_ENV } from '.';

export type TypeFrontEnvs =
  | ENUM_NODE_ENV.ENV_PROD
  | ENUM_NODE_ENV.ENV_STAGE
  | ENUM_NODE_ENV.ENV_DEV;
