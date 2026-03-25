/**
 * Formats a subject with its parents in "Board . Class . Subject" format.
 */
export const formatHierarchicalSubject = (subject: any): string => {
  if (!subject || typeof subject !== 'object') return String(subject || '');
  
  const parts: string[] = [];
  let current = subject;
  
  // Traverse up the parent chain
  while (current && (current.label || current.name || current.value)) {
    parts.unshift(getOptionLabel(current));
    current = current.parent;
  }
  
  return parts.join(' . ');
};

/**
 * Generic helper to extract a displayable label from an Option object, string, or mixed format.
 * Handles {_id, type, value, label}, {id, name}, and other common patterns.
 * Robustly handles cases where the label itself might be an object (corrupted data).
 */
export const getOptionLabel = (option: any): string => {
  if (option == null) return '';
  if (typeof option === 'string') return option;
  
  // If it's an object, try to find a string label
  if (typeof option === 'object') {
    const labelCandidate = option.label || option.name || option.display || option.fullName || option.value;
    
    if (labelCandidate != null) {
      if (typeof labelCandidate === 'string') return labelCandidate;
      // If the candidate is another object, recurse (max depth handled by simple check)
      if (typeof labelCandidate === 'object' && labelCandidate !== option) {
        return getOptionLabel(labelCandidate);
      }
      return String(labelCandidate);
    }
  }
  
  // Final fallback
  return String(option);
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
  
  // Handle OptionItem or Mongoose populated object using the generic helper
  return getOptionLabel(subject);
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

/**
 * Extracts only the leaf subject label (without parents).
 */
/**
 * Extracts only the leaf subject label (without parents).
 */
export const getLeafSubjectLabel = (subject: any): string => {
  if (subject == null) return '-';
  
  // If it's an array, delegate to getLeafSubjectList and join
  if (Array.isArray(subject)) {
    return getLeafSubjectList(subject).join(', ');
  }

  const label = getOptionLabel(subject);
  if (!label || label === '-') return '-';

  const extractLeaf = (s: string) => {
    const p = s.trim().split(' . ');
    return p[p.length - 1];
  };

  // Handle case where label is comma-separated string (potentially hierarchical)
  if (label.includes(',')) {
    return label.split(',').map(extractLeaf).join(', ');
  }

  return extractLeaf(label);
};

/**
 * Extracts a list of only leaf subject labels.
 */
export const getLeafSubjectList = (subjects: any): string[] => {
  const fullLabels = getSubjectList(subjects);
  return fullLabels.map(label => {
    const p = label.split(' . ');
    return p[p.length - 1];
  }).filter(Boolean);
};
