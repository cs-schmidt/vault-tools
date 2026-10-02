/** @fileoverview Provides functions Templater files can use to produce entries. */

import { capitalize } from 'lodash-es';
import { Notice } from 'obsidian';
import { join } from 'path-browserify';
import typeDetect from 'type-detect';

// TODO: Refine entry creation flow with custom components. Right now, cancelling
//       certain prompts in the flow must throw errors for proper behaviour. A custom
//       error type could be introduced, but it's an inelegant workaround.

const ENTRY_DIR_PATH = 'Entries/';
const ENTRY_BASENAME_REGEX = /^[^\\/:#^[\]|?"*]+$/;
const ENTRY_TEMPLATE_TYPES = new Set(['study', 'concept', 'formal', 'thought', 'manual']);
const FORMAL_TYPE_RANK_MAP = new Map([
  ['axiom', 1],
  ['theorem', 2],
  ['lemma', 3],
  ['proposition', 4],
]);

/**
 * @param {Object} tp - Templater plugin object.
 * @returns {string|null} The entry's content or `null` if cancelled.
 */
export async function prepareEntry(tp) {
  const templateLink = await tp.system.suggester(
    [...ENTRY_TEMPLATE_TYPES.values().map(capitalize)],
    [...ENTRY_TEMPLATE_TYPES.values().map(entryTemplateTypeToLink)],
    false,
    'Entry Type:',
  );

  if (templateLink == null) {
    new Notice('Entry creation cancelled.');
    return null;
  }

  try {
    return await tp.file.include(templateLink);
  } catch (error) {
    new Notice('Entry creation failed (see console).');
    console.log(error);
    // Target file cannot be deleted until this function ends; Templater enters a
    // delete- create loop otherwise. Delayed deletion is used as the workaround.
    setTimeout(() => app.vault.delete(tp.config.target_file));
  }
}

/**
 * @param {Object} tp - Templater plugin object.
 * @returns {Object} Data to interpolate the template.
 */
export async function prepareStudy(tp) {
  const title = await requestEntryTitle(tp);
  const basename = `(*) ${title}`;
  if (!isUniqueEntryName(basename)) throw Error('Entry basename is taken');
  tp.file.rename(basename);
  return { title };
}

/**
 * @param {Object} tp - Templater plugin object.
 * @returns {Object} Data to interpolate the template.
 */
export async function prepareConcept(tp) {
  const title = await requestEntryTitle(tp);
  const basename = `(CN) ${title}`;
  if (!isUniqueEntryName(basename)) throw Error('Entry basename is taken');
  tp.file.rename(basename);
  return { title };
}

/**
 * @param {Object} tp - Templater plugin object.
 * @returns {Object} Data to interpolate the template.
 */
export async function prepareFormal(tp) {
  const type = await tp.system.suggester(
    [...FORMAL_TYPE_RANK_MAP.keys().map(capitalize)],
    [...FORMAL_TYPE_RANK_MAP.keys()],
    true,
    'Formal Type:',
  );
  const title = await requestEntryTitle(tp);
  const typeCode = `F${FORMAL_TYPE_RANK_MAP.get(type)}`;
  const basename = `(${typeCode}) ${title}`;
  if (!isUniqueEntryName(basename)) throw Error('Entry basename is taken');
  tp.file.rename(basename);
  return { type, title };
}

/**
 * @param {Object} tp - Templater plugin object.
 * @returns {Object} Data to interpolate the template.
 */
export async function prepareThought(tp) {
  const title = await requestEntryTitle(tp);
  const basename = `(ID) ${title}`;
  if (!isUniqueEntryName(basename)) throw Error('Entry basename is taken');
  tp.file.rename(basename);
  return { title };
}

/**
 * @param {Object} tp - Templater plugin object.
 * @returns {Object} Data to interpolate the template.
 */
export async function prepareManual(tp) {
  const title = await requestEntryTitle(tp);
  const basename = `(MA) ${title}`;
  if (!isUniqueEntryName(basename)) throw Error('Entry basename is taken');
  tp.file.rename(basename);
  return { title };
}

// Internal Helpers
// =============================================================================

/**
 * @param {Object} tp - Templater plugin object.
 * @returns {Promise<string|null>} User-submitted entry title or `null` if cancelled.
 */
async function requestEntryTitle(tp) {
  const title = (await tp.system.prompt('Entry Title:', '', true)).trim();
  if (!ENTRY_BASENAME_REGEX.test(title)) throw Error(`Invalid title "${title}"`);
  return title;
}

/**
 * @param {string} basename - The basename to check against the entry folder's contents.
 * @returns {boolean} `true` if no entry file uses the basename; `false` otherwise.
 */
function isUniqueEntryName(basename) {
  const filepath = join(ENTRY_DIR_PATH, `${basename}.md`);
  return !app.vault.getFileByPath(filepath);
}

/**
 * @param {string} templateType - One of the possible template types.
 * @returns {string} The Obsidian internal link to the template.
 */
function entryTemplateTypeToLink(templateType) {
  if (typeof templateType !== 'string')
    throw TypeError(
      `Expected template type must be a string, got ${typeDetect(templateType)}`,
    );
  if (!ENTRY_TEMPLATE_TYPES.has(templateType))
    throw RangeError(`Template type "${templateType}" is not in the allowable range`);
  return `[[{+} ${templateType.toUpperCase()}]]`;
}
