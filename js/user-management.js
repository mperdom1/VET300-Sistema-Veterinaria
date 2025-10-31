// Firebase configuration and user management utilities
// This file handles user roles, permissions, and profile management using Realtime Database

// Export Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyBZoyZqhODCH90zcPdY_iT8mhh2S-X5FRE",
    authDomain: "vet360-d262a.firebaseapp.com",
    databaseURL: "https://vet360-d262a-default-rtdb.firebaseio.com",
    projectId: "vet360-d262a",
    storageBucket: "vet360-d262a.firebasestorage.app",
    messagingSenderId: "184009559961",
    appId: "1:184009559961:web:12b1311b6224a5d58ecd08",
    measurementId: "G-5K02J1Z7VZ"
};

// User roles and their hierarchies
export const USER_ROLES = {
    ADMIN: 'admin',
    IT_SUPPORT: 'it_support',
    VETERINARIO: 'veterinario',
    ASISTENTE: 'asistente',
    RECEPCIONISTA: 'recepcionista'
};

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
    [USER_ROLES.ADMIN]: 5,
    [USER_ROLES.IT_SUPPORT]: 5,
    [USER_ROLES.VETERINARIO]: 3,
    [USER_ROLES.ASISTENTE]: 2,
    [USER_ROLES.RECEPCIONISTA]: 1
};

// Permissions by role
export const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
        'full_access',
        'manage_users',
        'create_users',
        'edit_users',
        'delete_users',
        'view_reports',
        'system_settings',
        'manage_billing',
        'view_patients',
        'create_patients',
        'edit_patients',
        'delete_patients',
        'view_appointments',
        'create_appointments',
        'edit_appointments',
        'delete_appointments',
        'view_medical_records',
        'create_medical_records',
        'edit_medical_records'
    ],
    [USER_ROLES.IT_SUPPORT]: [
        'full_access',
        'manage_users',
        'create_users',
        'edit_users',
        'system_maintenance',
        'backup_restore',
        'view_reports',
        'system_settings'
    ],
    [USER_ROLES.VETERINARIO]: [
        'view_patients',
        'create_patients',
        'edit_patients',
        'view_appointments',
        'create_appointments',
        'edit_appointments',
        'view_medical_records',
        'create_medical_records',
        'edit_medical_records',
        'prescribe_medications',
        'view_lab_results'
    ],
    [USER_ROLES.ASISTENTE]: [
        'view_patients',
        'edit_patients',
        'view_appointments',
        'create_appointments',
        'edit_appointments',
        'view_medical_records',
        'assist_procedures'
    ],
    [USER_ROLES.RECEPCIONISTA]: [
        'view_patients',
        'create_patients',
        'edit_patients',
        'view_appointments',
        'create_appointments',
        'edit_appointments',
        'manage_billing',
        'check_in_patients'
    ]
};

// Department options
export const DEPARTMENTS = {
    CLINICA: 'clinica',
    CIRUGIA: 'cirugia',
    EMERGENCIAS: 'emergencias',
    ADMINISTRACION: 'administracion',
    IT: 'it'
};

// Utility functions for user management with Realtime Database
export class UserManager {
    constructor(auth, database) {
        this.auth = auth;
        this.database = database;
    }

    // Check if user has specific permission
    async hasPermission(userId, permission) {
        try {
            const { get, ref } = await import('https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js');
            
            const userRef = ref(this.database, 'users/' + userId);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const userPermissions = ROLE_PERMISSIONS[userData.role] || [];
                return userPermissions.includes(permission) || userPermissions.includes('full_access');
            }
            return false;
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    }

    // Check if user can manage other users
    async canManageUsers(userId) {
        return await this.hasPermission(userId, 'manage_users');
    }

    // Check if user can create new users
    async canCreateUsers(userId) {
        return await this.hasPermission(userId, 'create_users');
    }

    // Get user profile with role and permissions
    async getUserProfile(userId) {
        try {
            const { get, ref } = await import('https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js');
            
            const userRef = ref(this.database, 'users/' + userId);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                return {
                    ...userData,
                    permissions: ROLE_PERMISSIONS[userData.role] || []
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    // Check if user role is higher than target role
    isHigherRole(userRole, targetRole) {
        const userLevel = ROLE_HIERARCHY[userRole] || 0;
        const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
        return userLevel >= targetLevel;
    }

    // Validate role assignment
    async canAssignRole(assignerId, targetRole) {
        try {
            const { get, ref } = await import('https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js');
            
            const userRef = ref(this.database, 'users/' + assignerId);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const assignerRole = snapshot.val().role;
                return this.isHigherRole(assignerRole, targetRole);
            }
            return false;
        } catch (error) {
            console.error('Error validating role assignment:', error);
            return false;
        }
    }
}

// Auth error messages in Spanish
export function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': '❌ Usuario no encontrado. Verifica tu correo electrónico.',
        'auth/wrong-password': '❌ Contraseña incorrecta. Intenta de nuevo.',
        'auth/invalid-email': '❌ El formato del correo electrónico es incorrecto.',
        'auth/user-disabled': '❌ Esta cuenta ha sido deshabilitada.',
        'auth/too-many-requests': '⚠️ Demasiados intentos fallidos. Intenta más tarde.',
        'auth/network-request-failed': '🌐 Error de conexión. Verifica tu internet.',
        'auth/email-already-in-use': '❌ Este correo ya está registrado. Intenta iniciar sesión.',
        'auth/weak-password': '❌ La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-credential': '❌ Credenciales inválidas. Verifica tu correo y contraseña.',
        'auth/requires-recent-login': '🔒 Esta acción requiere autenticación reciente. Vuelve a iniciar sesión.',
        'auth/operation-not-allowed': '❌ Operación no permitida. Contacta al administrador.'
    };

    return errorMessages[errorCode] || `🚨 Error: ${errorCode}. Contacta al soporte técnico.`;
}

// Initialize user with default admin (run this once)
export async function createDefaultAdmin(auth, database) {
    try {
        const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js');
        const { set, ref } = await import('https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js');
        
        // This should be called manually to create the first admin user
        const adminEmail = "admin@vet360.com";
        const adminPassword = "Admin123!";
        
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        const user = userCredential.user;

        const adminProfile = {
            uid: user.uid,
            email: adminEmail,
            firstName: "Administrador",
            lastName: "Sistema",
            role: USER_ROLES.ADMIN,
            department: DEPARTMENTS.ADMINISTRACION,
            employeeId: "ADMIN001",
            createdAt: new Date().toISOString(),
            requirePasswordChange: true,
            isActive: true,
            permissions: ROLE_PERMISSIONS[USER_ROLES.ADMIN],
            isDefaultAdmin: true
        };

        await set(ref(database, 'users/' + user.uid), adminProfile);
        
        console.log("Default admin created successfully");
        return user;
    } catch (error) {
        console.error("Error creating default admin:", error);
        throw error;
    }
}