
const DB_NAME = 'MinaEduDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("IndexedDB error");
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const addFile = async (id: string, file: File) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put({ id, file });
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event);
    tx.oncomplete = () => resolve();
    tx.onerror = (event) => reject(event);
  });
};

export const getAllFiles = async (): Promise<{id: string, file: File}[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
          resolve(request.result || []);
      };
      request.onerror = (event) => {
          console.error('Failed to get all files from IndexedDB', event);
          reject([]);
      }
    });
};
