import * as SQLite from 'expo-sqlite';

export const initializeDatabase = async () => {
  // Abre o banco (ou cria se não existir)
  const db = await SQLite.openDatabaseAsync('zela_db');

  // Criação das Tabelas
  await db.execAsync(`
  PRAGMA journal_mode = WAL;
  
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    latitude TEXT,
    longitude TEXT,
    map_url TEXT
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL
  );
`);
  
  console.log("Banco de dados Zela inicializado com sucesso!");
};