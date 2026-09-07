import { AppRegistry } from 'react-native';

import { handleBackgroundSos } from './services/background-sos-task';

AppRegistry.registerHeadlessTask('ZellaBackgroundSosTask', () => handleBackgroundSos);

import 'expo-router/entry';
