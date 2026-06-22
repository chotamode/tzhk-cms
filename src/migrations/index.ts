import * as migration_20260618_202548_init from './20260618_202548_init';
import * as migration_20260619_183003_add_media_sizes from './20260619_183003_add_media_sizes';

export const migrations = [
  {
    up: migration_20260618_202548_init.up,
    down: migration_20260618_202548_init.down,
    name: '20260618_202548_init',
  },
  {
    up: migration_20260619_183003_add_media_sizes.up,
    down: migration_20260619_183003_add_media_sizes.down,
    name: '20260619_183003_add_media_sizes'
  },
];
