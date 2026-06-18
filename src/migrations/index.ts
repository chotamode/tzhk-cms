import * as migration_20260618_202548_init from './20260618_202548_init';

export const migrations = [
  {
    up: migration_20260618_202548_init.up,
    down: migration_20260618_202548_init.down,
    name: '20260618_202548_init'
  },
];
