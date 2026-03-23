/**
 * Formats a subject with its parents in "Board . Class . Subject" format.
 */
export const formatHierarchicalSubject = (subject: any): string => {
  if (!subject || typeof subject !== 'object') return String(subject || '');
  
  const parts: string[] = [];
  let current = subject;
  
  // Traverse up the parent chain
  while (current && (current.label || current.name)) {
    parts.unshift(current.label || current.name);
    current = current.parent;
  }
  
  return parts.join(' . ');
};

/**
 * Extracts a displayable label from a subject object or string.
 * Handles strings, OptionItems {label, value}, and other object formats.
 */
export const getSubjectLabel = (subject: any): string => {
  if (!subject) return '';
  if (typeof subject === 'string') return subject;
  
  // If it has a parent, try to format hierarchically
  if (subject.parent) {
    return formatHierarchicalSubject(subject);
  }
  
  // Handle OptionItem or Mongoose populated object
  return subject.label || subject.name || String(subject);
};

/**
 * Extracts a list of displayable labels from various subject input formats.
 * Handles arrays of strings/objects, comma-separated strings, and single objects/strings.
 */
export const getSubjectList = (subjects: any): string[] => {
  if (subjects == null) return [];
  
  // Handle Array
  if (Array.isArray(subjects)) {
    return subjects
      .map(getSubjectLabel)
      .filter((s) => s && s.trim().length > 0);
  }
  
  // Handle String (potentially comma-separated or JSON string)
  if (typeof subjects === 'string' && subjects.trim()) {
    const s = subjects.trim();
    
    // Check if it's a JSON stringified array/object (common in some legacy data)
    if (s.startsWith('[') || s.startsWith('{')) {
      try {
        const parsed = JSON.parse(s);
        return getSubjectList(parsed);
      } catch (e) {
        // Fall through to normal string processing
      }
    }
    
    // Split by comma if present
    if (s.includes(',')) {
      return s.split(',').map((x) => x.trim()).filter(Boolean);
    }
    
    return [s];
  }
  
  // Handle single Object
  if (typeof subjects === 'object') {
    const label = getSubjectLabel(subjects);
    return label ? [label] : [];
  }
  
  return [];
};
