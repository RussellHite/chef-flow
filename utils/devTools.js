// Development-only debugging utilities
export const isDev = __DEV__;

export const debugLog = (message, data = null) => {
  if (isDev) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

export const errorLog = (error, context = '') => {
  if (isDev) {
    console.error(`[ERROR] ${context}:`, error);
  }
};

// Network debugging
export const logNetworkRequest = (url, method, data) => {
  if (isDev) {
    console.log(`[NETWORK] ${method} ${url}`, data);
  }
};

// Component debugging
export const logComponentRender = (componentName, props) => {
  if (isDev) {
    console.log(`[RENDER] ${componentName}`, props);
  }
};

// Performance monitoring
export const perfStart = (label) => {
  if (isDev) {
    console.time(label);
  }
};

export const perfEnd = (label) => {
  if (isDev) {
    console.timeEnd(label);
  }
};

// State debugging
export const logStateChange = (componentName, prevState, newState) => {
  if (isDev) {
    console.log(`[STATE] ${componentName}`, {
      previous: prevState,
      new: newState,
      changes: Object.keys(newState).filter(key => prevState[key] !== newState[key])
    });
  }
};

// Navigation debugging
export const logNavigation = (from, to, params = null) => {
  if (isDev) {
    console.log(`[NAVIGATION] ${from} -> ${to}`, params);
  }
};

// Asset debugging
export const logAssetLoad = (assetName, success = true, error = null) => {
  if (isDev) {
    if (success) {
      console.log(`[ASSET] Loaded: ${assetName}`);
    } else {
      console.error(`[ASSET] Failed to load: ${assetName}`, error);
    }
  }
};

// Create a development-only wrapper for components
export const withDevLogging = (Component, componentName) => {
  if (!isDev) return Component;
  
  return (props) => {
    logComponentRender(componentName, props);
    return Component(props);
  };
};