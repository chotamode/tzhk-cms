import fs from 'node:fs'
import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

import { importContent, mimeFromName, type ImageUpload } from '../lib/importContent'

/**
 * Bulk-seed a tenant's content from a single folder, idempotently.
 *
 *   pnpm seed:content --dir ./content/tatushka
 *   SEED_DIR=./content/tatushka pnpm seed:content
 *
 * Folder layout:
 *   content/<tenant>/
 *     content.json        ← all texts (per locale) + portfolio list
 *     images/             ← image files referenced by name in content.json
 *
 * The actual upsert lives in `src/lib/importContent.ts` and is shared with the
 * admin "Import content" button, so the two can never drift. See that file for
 * the exact content.json schema.
 */

const arg = (flag: string): string | undefined => {
  const i = process.argv.indexOf(`--${flag}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

const run = async (): Promise<void> => {
  // `--dir` can be swallowed by the pnpm → payload-run arg chain, so SEED_DIR
  // env is the robust fallback.
  const dir = arg('dir') || process.env.SEED_DIR
  if (!dir) {
    throw new Error('Provide the content folder via SEED_DIR=<folder> (or --dir <folder>).')
  }

  const root = path.resolve(dir)
  const file = path.join(root, 'content.json')
  if (!fs.existsSync(file)) throw new Error(`Not found: ${file}`)
  const content = JSON.parse(fs.readFileSync(file, 'utf8'))

  const payload = await getPayload({ config })

  // Read referenced images off disk (looking in <dir> and <dir>/images).
  const resolveImage = async (name: string): Promise<ImageUpload> => {
    for (const candidate of [path.join(root, name), path.join(root, 'images', name)]) {
      if (fs.existsSync(candidate)) {
        const data = fs.readFileSync(candidate)
        return { data, name, mimetype: mimeFromName(name), size: data.byteLength }
      }
    }
    throw new Error(`Image not found: ${name} (looked in ${root} and ${root}/images)`)
  }

  await importContent({
    payload,
    content,
    resolveImage,
    log: (msg) => payload.logger.info(msg),
  })

  payload.logger.info('Done.')
  process.exit(0)
}

// Top-level await so `payload run` waits for the async work to finish.
try {
  await run()
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
}
