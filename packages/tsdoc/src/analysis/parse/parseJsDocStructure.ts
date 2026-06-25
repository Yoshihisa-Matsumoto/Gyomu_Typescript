import { Node } from 'ts-morph'
import { withOptional } from '@gyomu/schema'
import { normalizeJsDocText } from '../normalize/normalizeJsDocText.js'
import { analyzeHumanEditSignals } from '../analyzers/analyzeHumanEditSignals.js'
import { parseProtectedRegions } from './parseProtectedRegions.js'
import { parseGeneratedMarker } from './parseGeneratedMarker.js'
import { computeProtectedSections } from './computeProtectedSections.js'
import type {
  JSDoc,
  JSDocParameterTag,
  JSDocReturnTag,
  JSDocTag,
  JSDocTemplateTag,
  JSDocThrowsTag,
} from 'ts-morph'
import type {
  JsDocParam,
  JsDocReturns,
  JsDocThrows,
  ParsedJsDoc,
  RawJsDoc,
} from '@gyomu/schema/typescript'

/**
 * Parses a ts-morph JSDoc node into a normalized {@link ParsedJsDoc} structure.
 *
 * This function converts raw JSDoc AST information into a structured,
 * analysis-friendly representation used by the documentation pipeline.
 *
 * The parser performs:
 *
 * - Summary normalization
 * - Tag extraction
 * - Structured parsing for:
 *   - `@param`
 *   - `@returns`
 *   - `@throws`
 *   - `@template`
 *   - `@example`
 *   - `@remarks`
 * - Protected region detection
 * - Generated marker detection
 * - Human edit signal analysis
 *
 * All parsed tags are also preserved in raw form through `parsed.tags`
 * to support reconstruction, linting, formatting, and future analysis steps.
 *
 * @param raw Raw extracted JSDoc source information.
 * @param doc ts-morph JSDoc AST node.
 *
 * @returns Normalized structured JSDoc representation.
 */
export const parseJsDocStructure = (raw: RawJsDoc, doc: JSDoc): ParsedJsDoc => {
  const parsed: ParsedJsDoc = {
    examples: [],

    params: [],

    throws: [],

    templates: [],

    tags: [],
    protectedSection: [],
    protectedRegions: [],
    humanEditSignals: [],

    raw,
    startOffset: doc.getFullStart(),

    endOffset: doc.getEnd(),
  }

  const description = normalizeJsDocText(doc.getDescription().trim())

  if (description.length > 0) {
    parsed.summary = description
  }

  // console.log(doc.getDescription())
  // console.log(doc.getTags().map((t) => t.getTagName()))
  const rawText = raw.rawText

  const tags = doc.getTags()
  for (const [index, tag] of tags.entries()) {
    const tagName = tag.getTagName()
    const text = getNormalizedCommentText(tag) ?? ''
    const rawTag = tag.getText()

    const isRealTag = new RegExp(String.raw`(?:^|\n)\s*@${tagName}\b`).test(rawText)
    if (!isRealTag) {
      const key =
        tagName == 'template' ? extractTagKey(tag, rawTag, tagName, text, index) : undefined
      parsed.summary += ` @${tagName} ${key ?? ''}${text}`
      continue
    }

    parsed.tags.push({
      tagName,
      text,
      ...withOptional({ key: extractTagKey(tag, rawTag, tagName, text, index) }),
      raw: rawTag,
      sortOrder: index,
    })

    if (tagName == 'remarks') parsed.remarks = text

    if (tagName == 'example' && text) parsed.examples.push(text)

    if (Node.isJSDocParameterTag(tag)) {
      parsed.params.push(parseParamTag(tag, index))
    }
    if (Node.isJSDocReturnTag(tag)) {
      parsed.returns = parseReturnTag(tag)
    }
    if (Node.isJSDocThrowsTag(tag)) {
      const throwItem = parseThrowTag(tag, index)
      if (throwItem) parsed.throws.push(throwItem)
    }

    if (Node.isJSDocTemplateTag(tag)) {
      parsed.templates.push(parseTemplateTag(tag))
    }
  }

  parsed.protectedRegions = parseProtectedRegions(parsed.raw.rawText)
  parsed.humanEditSignals = analyzeHumanEditSignals(parsed)

  const generator = parseGeneratedMarker(parsed.raw.rawText)
  if (generator) parsed.generator = generator

  parsed.protectedSection = computeProtectedSections(parsed.humanEditSignals)

  return parsed
}

const extractTagKey = (
  tag: JSDocTag,
  rawTag: string,
  tagName: string,
  text: string,
  index: number,
): string | undefined => {
  const firstWord = text.trim().split(/\s+/)[0]

  if (Node.isJSDocParameterTag(tag)) return tag.getName()
  if (Node.isJSDocTemplateTag(tag)) {
    return extractTemplateKey(rawTag)
  }
  switch (tagName) {
    case 'throws':
      return firstWord || undefined

    case 'example':
      return String(index)

    default:
      return undefined
  }
}

const extractTemplateKey = (rawTag: string): string | undefined => {
  const match = rawTag.match(/^@template\s+([A-Za-z_$][A-Za-z0-9_$]*)/)
  return match?.[1]
}

const getNormalizedCommentText = (tag: JSDocTag): string | undefined => {
  const text = tag.getCommentText()

  if (!text) {
    return undefined
  }

  return normalizeJsDocText(text)
}

const parseTemplateTag = (tag: JSDocTemplateTag): string => {
  return getNormalizedCommentText(tag) ?? ''
}

const parseParamTag = (tag: JSDocParameterTag, order: number): JsDocParam => {
  const paramTag = tag
  const parameterName = paramTag.getName()
  const parameterDescription = getNormalizedCommentText(paramTag)
  const optional = paramTag.getName().startsWith('[')
  const parameterType = paramTag.getTypeExpression()?.getTypeNode().getText()
  return {
    name: parameterName,
    ...withOptional({
      description: parameterDescription,
      optional,
      raw: paramTag.getText(),
      type: parameterType,
    }),

    sortOrder: order,
  }
}

const parseReturnTag = (tag: JSDocReturnTag): JsDocReturns => {
  return withOptional({
    description: getNormalizedCommentText(tag),
    raw: tag.getText(),
  })
}

const parseThrowTag = (tag: JSDocThrowsTag, order: number): JsDocThrows | undefined => {
  const text = getNormalizedCommentText(tag) ?? ''
  const match = text.match(/^(\w+)\s+(.*)$/)
  if (match && match.length > 2) {
    return {
      ...withOptional({
        type: match[1],
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        description: match[2] ?? text,
        raw: tag.getText(),
      }),

      order,
    }
  }
  return undefined
}
