const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// If you use css-interop/nativewind, DO NOT set a custom transformer unless you know it's required.
// Keep this default unless we explicitly add css-interop integration back.
module.exports = config;
