// @ts-ignore
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getFirestore } from 'firebase/firestore';
// @ts-ignore
import { getAuth } from 'firebase/auth';

// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyC_ZGuGG7whoYVlo5BAK9PRGnFG5-d-f50",
  authDomain: "concresys.firebaseapp.com",
  projectId: "concresys",
  storageBucket: "concresys.firebasestorage.app",
  messagingSenderId: "106246591736",
  appId: "1:106246591736:web:210decb46b79882b08170d",
  measurementId: "G-5F9M374VQ2"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados para ser usado no services/db.ts
export const db = getFirestore(app);

// Exporta a autenticação para ser usada no Login.tsx e App.tsx
export const auth = getAuth(app);