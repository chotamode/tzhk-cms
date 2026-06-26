/**
 * Block palette for the per-tenant page builder (`SiteContent.layout`).
 *
 * Each tenant composes its page from the blocks it needs, in display order, so
 * one shared schema serves structurally different sites without tattoo- or
 * knitting-specific fields leaking across tenants.
 */
import { About } from './About'
import { FAQ } from './FAQ'
import { Gallery } from './Gallery'
import { Hero } from './Hero'
import { Products } from './Products'
import { Reviews } from './Reviews'
import { RichText } from './RichText'

export { About, FAQ, Gallery, Hero, Products, Reviews, RichText }

/** All blocks, in the order they appear in the admin "add block" menu. */
export const layoutBlocks = [Hero, About, Gallery, Products, FAQ, Reviews, RichText]
