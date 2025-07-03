export const typography = {
  // Cook RHYTHM Typography System - Technical typography optimized for data display
  h1: {
    fontSize: 30, // 1.875rem * 16 (converted from rem)
    fontWeight: '600',
    lineHeight: 37.5, // 1.25 ratio exact
    letterSpacing: -0.4, // -0.025em converted
  },
  h2: {
    fontSize: 24, // 1.5rem * 16
    fontWeight: '600',
    lineHeight: 33, // 1.375 ratio
    letterSpacing: -0.4, // -0.025em converted
  },
  h3: {
    fontSize: 20, // 1.25rem * 16
    fontWeight: '500',
    lineHeight: 27.5, // 1.375 ratio exact
  },
  h4: {
    fontSize: 18, // 1.125rem * 16
    fontWeight: '500',
    lineHeight: 24.75, // 1.375 ratio exact
  },
  body: {
    fontSize: 16, // 1rem * 16 (base font size)
    fontWeight: '400',
    lineHeight: 24, // 1.5 ratio
  },
  label: {
    fontSize: 14, // 0.875rem * 16
    fontWeight: '500',
    lineHeight: 17.5, // 1.25 ratio exact
  },
  button: {
    fontSize: 14, // 0.875rem * 16
    fontWeight: '500',
    lineHeight: 17.5, // 1.25 ratio exact
  },
  input: {
    fontSize: 16, // 1rem * 16 - matches body for consistency
    fontWeight: '400',
    lineHeight: 24, // 1.5 ratio
  },
  caption: {
    fontSize: 12, // Small text for captions and metadata
    fontWeight: '400',
    lineHeight: 18, // 1.5 ratio
  },
  
  // Font families matching Cook RHYTHM specification
  fontFamily: {
    default: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
    mono: 'SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace'
  },
  
  // Font weights as defined in Cook RHYTHM
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
  },
  
  // Legacy styles (for gradual migration)
  legacy: {
    h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  },
};