// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.17.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.17.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.17.0/firebase-database.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBZoyZqhODCH90zcPdY_iT8mhh2S-X5FRE",
    authDomain: "vet360-d262a.firebaseapp.com",
    databaseURL: "https://vet360-d262a-default-rtdb.firebaseio.com",
    projectId: "vet360-d262a",
    storageBucket: "vet360-d262a.firebasestorage.app",
    messagingSenderId: "184009559961",
    appId: "1:184009559961:web:12b1311b6224a5d58ecd08",
    measurementId: "G-5K02J1Z7VZ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const database = getDatabase(app);