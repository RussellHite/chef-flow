/**
 * Ingredient Formatting Utilities
 * 
 * Pure functions for ingredient quantity, unit, and display formatting
 */

// Common measurement units for dropdown
export const MEASUREMENT_UNITS = [
  { value: 'n/a', label: 'n/a', plural: 'n/a' },
  { value: 'cup', label: 'cup', plural: 'cups' },
  { value: 'tbsp', label: 'tbsp', plural: 'tbsp' },
  { value: 'tsp', label: 'tsp', plural: 'tsp' },
  { value: 'oz', label: 'oz', plural: 'oz' },
  { value: 'lb', label: 'lb', plural: 'lbs' },
  { value: 'gram', label: 'gram', plural: 'grams' },
  { value: 'kg', label: 'kg', plural: 'kg' },
  { value: 'ml', label: 'ml', plural: 'ml' },
  { value: 'liter', label: 'liter', plural: 'liters' },
  { value: 'piece', label: 'piece', plural: 'pieces' },
  { value: 'clove', label: 'clove', plural: 'cloves' },
  { value: 'can', label: 'can', plural: 'cans' },
  { value: 'package', label: 'package', plural: 'packages' }
];

/**
 * Parse quantity string to number with error handling
 */
export const parseQuantity = (quantityString) => {
  if (!quantityString) return 1;
  
  try {
    const match = quantityString.match(/[\d.]+/);
    return parseFloat(match?.[0] || '1');
  } catch (e) {
    console.warn('Error parsing quantity:', e);
    return 1;
  }
};

/**
 * Format quantity for display
 */
export const formatQuantity = (quantity) => {
  if (quantity === null || quantity === undefined) return '';
  
  const num = typeof quantity === 'string' ? parseQuantity(quantity) : quantity;
  
  // Handle decimals nicely
  if (num % 1 === 0) {
    return num.toString();
  } else {
    return num.toFixed(2).replace(/\.?0+$/, '');
  }
};

/**
 * Get unit display text (singular/plural based on quantity)
 */
export const formatUnit = (unitValue, quantity = 1) => {
  if (!unitValue || unitValue === 'n/a') return '';
  
  const unitData = MEASUREMENT_UNITS.find(u => u.value === unitValue);
  if (!unitData) return unitValue;
  
  const numQuantity = typeof quantity === 'string' ? parseQuantity(quantity) : quantity;
  return numQuantity === 1 ? unitData.label : unitData.plural;
};

/**
 * Adjust quantity by delta value
 */
export const adjustQuantity = (currentQuantity, delta) => {
  const current = typeof currentQuantity === 'string' ? parseQuantity(currentQuantity) : currentQuantity;
  const newQuantity = Math.max(0, current + delta);
  return formatQuantity(newQuantity);
};

/**
 * Get ingredient display text from structured data
 */
export const getIngredientDisplayText = (structured) => {
  if (!structured || !structured.isStructured) {
    return structured?.originalText || '';
  }

  let display = '';
  
  if (structured.quantity !== null && structured.quantity !== undefined) {
    display += formatQuantity(structured.quantity) + ' ';
  }
  
  if (structured.unit && structured.unit.value !== 'n/a') {
    display += formatUnit(structured.unit.value, structured.quantity) + ' ';
  }
  
  if (structured.ingredient?.name) {
    display += structured.ingredient.name;
  }
  
  if (structured.preparation?.name) {
    display += ', ' + structured.preparation.name;
  }
  
  return display.trim();
};

/**
 * Validate ingredient form data
 */
export const validateIngredientData = (quantity, unit, ingredientName) => {
  const errors = {};
  
  if (!ingredientName || ingredientName.trim() === '') {
    errors.ingredient = 'Ingredient name is required';
  }
  
  if (quantity && isNaN(parseQuantity(quantity))) {
    errors.quantity = 'Quantity must be a valid number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Convert manual parsing parts to structured format
 */
export const convertManualPartsToStructured = (manualParts) => {
  const quantity = manualParts.filter(p => p.type === 'quantity').map(p => p.text).join(' ');
  const unit = manualParts.filter(p => p.type === 'unit').map(p => p.text).join(' ');
  const ingredientName = manualParts.filter(p => p.type === 'ingredient').map(p => p.text).join(' ');
  const description = manualParts.filter(p => p.type === 'description').map(p => p.text).join(' ');
  const action = manualParts.filter(p => p.type === 'action').map(p => p.text).join(' ');
  
  const parsedQuantity = parseQuantity(quantity);
  const unitData = unit ? MEASUREMENT_UNITS.find(u => 
    u.value.toLowerCase() === unit.toLowerCase() || 
    u.label.toLowerCase() === unit.toLowerCase() ||
    u.plural.toLowerCase() === unit.toLowerCase()
  ) : null;

  return {
    isStructured: true,
    quantity: parsedQuantity,
    unit: unitData || (unit ? { value: unit, label: unit, plural: unit } : null),
    ingredient: {
      id: 'manual',
      name: ingredientName,
      category: 'manual'
    },
    preparation: action ? { name: action } : null,
    description: description || null
  };
};