// @ts-ignore
import { collection, doc, setDoc, deleteDoc, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { db as firestore } from './firebase';

const COLLECTION_MAP: Record<string, string> = {
  'suppliers': 'fornecedores',
  'locations': 'locais',
  'pours': 'concretagens',
  'concreteTypes': 'tipos_concreto',
  'devices': 'dispositivos',
  'inputs': 'insumos'
};

const sanitizeForFirestore = (obj: any) => {
  const clean = JSON.parse(JSON.stringify(obj));
  // Remove id from body if it exists, as it will be the document key
  if (clean.id) delete clean.id;
  return clean;
};

export const dbService = {
  // No initialization needed for direct Firestore access
  async init() {
    console.log("System initialized in Online-Only mode");
  },

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!firestore) return [];

    try {
      const firestoreCollection = COLLECTION_MAP[storeName] || storeName;
      const querySnapshot = await getDocs(collection(firestore, firestoreCollection));

      const results: T[] = [];
      querySnapshot.forEach((doc: any) => {
        // Inject the ID back into the object for the UI
        results.push({ ...doc.data(), id: doc.id } as T);
      });

      return results;
    } catch (error) {
      console.error(`Error fetching ${storeName}:`, error);
      return [];
    }
  },

  async add<T>(storeName: string, item: Omit<T, 'id'>): Promise<string> {
    if (!firestore) throw new Error("Database not connected");

    const firestoreCollection = COLLECTION_MAP[storeName] || storeName;
    const cleanData = sanitizeForFirestore(item);

    // addDoc automatically generates an ID
    const docRef = await addDoc(collection(firestore, firestoreCollection), cleanData);
    return docRef.id;
  },

  async update<T>(storeName: string, item: any): Promise<void> {
    if (!firestore) throw new Error("Database not connected");
    if (!item.id) throw new Error("Item ID is required for update");

    const firestoreCollection = COLLECTION_MAP[storeName] || storeName;
    const cleanData = sanitizeForFirestore(item);

    await setDoc(doc(firestore, firestoreCollection, item.id), cleanData, { merge: true });
  },

  async delete(storeName: string, id: string): Promise<void> {
    if (!firestore) throw new Error("Database not connected");

    const firestoreCollection = COLLECTION_MAP[storeName] || storeName;
    await deleteDoc(doc(firestore, firestoreCollection, id));
  },

  async createUser(user: any) {
    try {
      if (!firestore) return;
      const userData = {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(firestore, 'users', user.uid), sanitizeForFirestore(userData));
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  }
};