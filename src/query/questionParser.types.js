/**
 * @typedef {Object} ParsedQuestion
 * @property {string} raw
 * @property {string | null} target
 * @property {string | null} targetLabel
 * @property {number | null} dayOfWeek
 * @property {string | null} dayLabel
 * @property {string | null} dateHint
 * @property {string | null} dateLabel
 * @property {ParsedTime} time
 * @property {number | null} planningConfidence
 * @property {ParseAmbiguity} ambiguity
 * @property {string[]} parseNotes
 * @property {string} [error]
 */

/**
 * @typedef {Object} ParsedTime
 * @property {'point' | 'range' | 'whole_day' | 'unspecified'} scope
 * @property {number} [minutes]
 * @property {number} [startMinutes]
 * @property {number} [endMinutes]
 * @property {string} [label]
 */

/**
 * @typedef {Object} ParseAmbiguity
 * @property {boolean} needsTimeScope
 * @property {string | null} message
 * @property {boolean} unsupported
 */

export {}
