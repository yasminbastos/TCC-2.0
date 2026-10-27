import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IdiomaContextType = {
  idioma: 'pt' | 'en';
  mudarIdioma: (novoIdioma: 'pt' | 'en') => Promise<void>;
};

const IdiomaContext = createContext<IdiomaContextType>({
  idioma: 'pt',
  mudarIdioma: async () => {},
});

export const IdiomaProvider = ({ children }: { children: React.ReactNode }) => {
  const [idioma, setIdioma] = useState<'pt' | 'en'>('pt');

  useEffect(() => {
    // Carrega o idioma salvo ao iniciar o app
    AsyncStorage.getItem('@zella_idioma').then((salvo) => {
      if (salvo === 'pt' || salvo === 'en') {
        setIdioma(salvo);
      }
    });
  }, []);

  const mudarIdioma = async (novoIdioma: 'pt' | 'en') => {
    setIdioma(novoIdioma);
    await AsyncStorage.setItem('@zella_idioma', novoIdioma);
  };

  return (
    <IdiomaContext.Provider value={{ idioma, mudarIdioma }}>
      {children}
    </IdiomaContext.Provider>
  );
};

export const useIdioma = () => useContext(IdiomaContext);