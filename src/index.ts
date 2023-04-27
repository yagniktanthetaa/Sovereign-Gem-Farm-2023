import { PublicKey } from '@solana/web3.js';

export * from './gem-bank';
export * from './gem-farm';
export * from './gem-common';

export const GEM_BANK_PROG_ID = new PublicKey(
  'B125ajDSeCHWeSKdLUsBD6keAuZjEaKfo19PpdjwVDz4'
);
export const GEM_FARM_PROG_ID = new PublicKey(
  'GYxFaAG23WQ96hL9KZA3XPJGhwbZWA7JnAJxDbWWRgw3'
);
