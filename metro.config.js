const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// This project is commonly run on a low-memory Windows machine. Metro's
// CPU-based default starts 10 workers here, which exhausts RAM during the
// Android bundle and makes jest-worker fail while serializing IPC messages.
config.maxWorkers = 1;

module.exports = config;
