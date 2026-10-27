import { Audio } from 'expo-av';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

let sound: Audio.Sound | null = null;

export async function playSOSSound() {
  try {
    try {
      await activateKeepAwakeAsync();
    } catch (e) {
      console.log('Keep Awake não suportado ou bloqueado:', e);
    }

    if (sound) {
      await sound.unloadAsync();
      sound = null;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    const { sound: newSound } = await Audio.Sound.createAsync(
      require('../assets/audio/sos-alarm.mp3'),
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    );

    sound = newSound;
  } catch (error) {
    console.log('Erro ao reproduzir o alarme SOS:', error);
  }
}

export async function stopSOSSound() {
  try {
    try {
      await deactivateKeepAwake();
    } catch (e) {
      console.log('Erro ao desativar Keep Awake:', e);
    }

    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.log('Erro ao parar o alarme SOS:', error);
  }
}