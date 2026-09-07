
//Este arquivo se refere a lógica do áudio pelo acionamento do SOS como notificação
import { Audio } from 'expo-av';

import { stopIncomingSosAlert } from '@/services/background-sos-control';

let soundInstance: Audio.Sound | null = null;

export const playSOSSound = async () => {
  try {
    // Se já estiver tocando, cancela o anterior primeiro
    if (soundInstance) {
      await soundInstance.unloadAsync();
      soundInstance = null;
    }

    // Configura o áudio para tocar MESMO no modo silencioso (Android)
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    //pega ONDE o áudio está 
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/images/sos.mp3'),
      { isLooping: true, volume: 1.0 }
    );

    soundInstance = sound;
    await sound.playAsync();
    // O alerta nativo cobre a inicialização a frio. Depois que o áudio em
    // loop estiver tocando, ele pode ser encerrado sem criar um intervalo mudo.
    await stopIncomingSosAlert();
    return true;
  } catch (error) {
    console.error('Erro ao tocar som de SOS:', error);
    return false;
  }
};

export const stopSOSSound = async () => {
  try {
    await stopIncomingSosAlert();
    if (soundInstance) {
      await soundInstance.stopAsync();
      await soundInstance.unloadAsync();
      soundInstance = null;
    }
  } catch (error) {
    console.error('Erro ao parar som de SOS:', error);
  }
};
