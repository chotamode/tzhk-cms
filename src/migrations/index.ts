import * as migration_20260618_202548_init from './20260618_202548_init';
import * as migration_20260619_183003_add_media_sizes from './20260619_183003_add_media_sizes';
import * as migration_20260624_125614_add_site_content from './20260624_125614_add_site_content';
import * as migration_20260624_201409_merge_portfolio_into_site_content from './20260624_201409_merge_portfolio_into_site_content';
import * as migration_20260625_215633_blocks_layout from './20260625_215633_blocks_layout';
import * as migration_20260625_222514_tags_gallery_products from './20260625_222514_tags_gallery_products';
import * as migration_20260713_154849_add_projects_tools from './20260713_154849_add_projects_tools';

export const migrations = [
  {
    up: migration_20260618_202548_init.up,
    down: migration_20260618_202548_init.down,
    name: '20260618_202548_init',
  },
  {
    up: migration_20260619_183003_add_media_sizes.up,
    down: migration_20260619_183003_add_media_sizes.down,
    name: '20260619_183003_add_media_sizes',
  },
  {
    up: migration_20260624_125614_add_site_content.up,
    down: migration_20260624_125614_add_site_content.down,
    name: '20260624_125614_add_site_content',
  },
  {
    up: migration_20260624_201409_merge_portfolio_into_site_content.up,
    down: migration_20260624_201409_merge_portfolio_into_site_content.down,
    name: '20260624_201409_merge_portfolio_into_site_content',
  },
  {
    up: migration_20260625_215633_blocks_layout.up,
    down: migration_20260625_215633_blocks_layout.down,
    name: '20260625_215633_blocks_layout',
  },
  {
    up: migration_20260625_222514_tags_gallery_products.up,
    down: migration_20260625_222514_tags_gallery_products.down,
    name: '20260625_222514_tags_gallery_products',
  },
  {
    up: migration_20260713_154849_add_projects_tools.up,
    down: migration_20260713_154849_add_projects_tools.down,
    name: '20260713_154849_add_projects_tools'
  },
];
