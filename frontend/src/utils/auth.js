/**
 * Authentication and Security Utilities
 * Handles password generation, validation, and security-related functions
 */

/**
 * Generate a secure random password
 * @param {number} length - Length of password (default: 12)
 * @returns {string} Randomly generated password
 */
export const generateSecurePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Ensure password has at least one of each type
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Add at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate a unique access code for visitor check-in
 * @param {number} length - Length of code (default: 6)
 * @returns {string} Alphanumeric access code
 */
export const generateAccessCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return code;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength and feedback
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    strength: 'weak',
    feedback: []
  };
  
  if (!password || password.length < 8) {
    result.feedback.push('Password must be at least 8 characters long');
    return result;
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
  
  if (!hasUpperCase) result.feedback.push('Include uppercase letters');
  if (!hasLowerCase) result.feedback.push('Include lowercase letters');
  if (!hasNumbers) result.feedback.push('Include numbers');
  if (!hasSymbols) result.feedback.push('Include special characters');
  
  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSymbols].filter(Boolean).length;
  
  if (criteriaCount >= 4 && password.length >= 12) {
    result.strength = 'strong';
    result.isValid = true;
  } else if (criteriaCount >= 3 && password.length >= 10) {
    result.strength = 'medium';
    result.isValid = true;
  } else if (criteriaCount >= 2 && password.length >= 8) {
    result.strength = 'weak';
    result.isValid = true;
  }
  
  return result;
};

/**
 * Hash password using Web Crypto API (browser-side hashing for display/comparison)
 * Note: Actual password hashing should be done server-side with bcrypt/argon2
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};
