import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  collection,
  getDocs,
} from 'firebase/firestore';

// Configuração
const firebaseConfig = {
  apiKey: "AIzaSyB02Olw46N7qlJlPfwIlDFNljSHD_HG_vo",
  authDomain: "adad-a313e.firebaseapp.com",
  projectId: "adad-a313e",
  storageBucket: "adad-a313e.firebasestorage.app",
  messagingSenderId: "326380062160",
  appId: "1:326380062160:web:7c86140dba2a5043e825d5",
  measurementId: "G-BP7DX4VF2N"
};

// Inicializa Firebase App (só se ainda não foi)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Inicializa ou pega Auth
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

const database = getFirestore(app);

// Função que busca clientes do usuário logado
async function getClientesDoUsuario() {
  const currentUser = getAuth().currentUser;

  if (!currentUser) throw new Error('Usuário não está logado');

  const ref = collection(database, 'user', currentUser.uid, 'Clientes');
  const querySnapshot = await getDocs(ref);

  const clientes = [];
  querySnapshot.forEach((doc) => {
    clientes.push({ id: doc.id, ...doc.data() });
  });

  return clientes;
  
}

export { app, auth, database, getClientesDoUsuario };
