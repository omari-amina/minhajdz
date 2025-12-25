
import { CurriculumStandard } from '../types';

export interface ImportResult {
  added: number;
  updated: number;
  errors: string[];
  totalProcessed: number;
  preview: {
    newItems: CurriculumStandard[];
    updatedItems: CurriculumStandard[];
  }
}

/**
 * Validates a single raw import item against the CurriculumStandard schema.
 */
const validateItem = (item: any, index: number): string | null => {
  if (!item.subject) return `Item at index ${index}: Missing 'subject'`;
  if (!item.level) return `Item at index ${index}: Missing 'level'`;
  if (!item.domain) return `Item at index ${index}: Missing 'domain'`;
  if (!item.unit) return `Item at index ${index}: Missing 'unit'`;
  if (!item.lessonTitle) return `Item at index ${index}: Missing 'lessonTitle'`;
  return null;
};

/**
 * Generates a deterministic code if one is missing.
 * Pattern: SUBJECT_LEVEL_STREAM_LESSON (Sanitized)
 */
const generateCode = (item: CurriculumStandard): string => {
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase();
  const streamCode = item.stream ? sanitize(item.stream) : 'COM'; // Common
  return `${sanitize(item.subject)}_${sanitize(item.level)}_${streamCode}_${sanitize(item.lessonTitle)}_${item.suggestedDuration}`;
};

/**
 * The Import Pipeline Logic
 * 1. Validates input
 * 2. Matches against existing data (by Code or by Content Signature)
 * 3. Prepares Merge (Upsert)
 */
export const processCurriculumImport = (
  rawJson: any[], 
  existingItems: CurriculumStandard[]
): ImportResult => {
  const result: ImportResult = {
    added: 0,
    updated: 0,
    errors: [],
    totalProcessed: 0,
    preview: { newItems: [], updatedItems: [] }
  };

  if (!Array.isArray(rawJson)) {
    result.errors.push("Invalid Format: Input must be an array of objects.");
    return result;
  }

  // Map existing items by Code (primary key) and Signature (fallback key)
  const codeMap = new Map<string, CurriculumStandard>();
  const signatureMap = new Map<string, CurriculumStandard>();

  existingItems.forEach(item => {
    if (item.code) codeMap.set(item.code, item);
    // Create a signature based on content to find duplicates that don't have codes yet
    const signature = `${item.subject}|${item.level}|${item.stream || ''}|${item.lessonTitle}`;
    signatureMap.set(signature, item);
  });

  rawJson.forEach((rawItem, index) => {
    const error = validateItem(rawItem, index);
    if (error) {
      result.errors.push(error);
      return;
    }

    // Normalize
    const newItem: CurriculumStandard = {
      id: `curr_imp_${Date.now()}_${index}`, // Temporary ID, might be overwritten if updating
      cycle: rawItem.cycle || 'secondary', // Default to secondary if missing
      subject: rawItem.subject,
      level: rawItem.level,
      stream: rawItem.stream,
      domain: rawItem.domain,
      unit: rawItem.unit,
      lessonTitle: rawItem.lessonTitle,
      targetCompetencies: Array.isArray(rawItem.targetCompetencies) ? rawItem.targetCompetencies : [],
      performanceIndicators: Array.isArray(rawItem.performanceIndicators) ? rawItem.performanceIndicators : [],
      suggestedDuration: Number(rawItem.suggestedDuration) || 1,
      code: rawItem.code
    };

    // If code is missing in import, try to generate one or find by signature
    if (!newItem.code) {
       // Check signature
       const signature = `${newItem.subject}|${newItem.level}|${newItem.stream || ''}|${newItem.lessonTitle}`;
       const existingBySig = signatureMap.get(signature);
       if (existingBySig && existingBySig.code) {
         newItem.code = existingBySig.code; // Inherit code to ensure update
       } else {
         newItem.code = generateCode(newItem); // Generate new code
       }
    }

    // Determine Action: Update or Insert
    const existingMatch = codeMap.get(newItem.code!) || signatureMap.get(`${newItem.subject}|${newItem.level}|${newItem.stream || ''}|${newItem.lessonTitle}`);

    if (existingMatch) {
      // Logic for Update: Keep existing ID, overwrite content
      const updatedItem = { ...newItem, id: existingMatch.id };
      result.preview.updatedItems.push(updatedItem);
      result.updated++;
    } else {
      // Logic for Insert
      result.preview.newItems.push(newItem);
      result.added++;
    }
    result.totalProcessed++;
  });

  return result;
};
