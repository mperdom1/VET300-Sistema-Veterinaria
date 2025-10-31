// Authentication and Authorization Middleware for VET360
// Include this in pages that require specific permissions

export class AuthMiddleware {
    constructor(auth, db) {
        this.auth = auth;
        this.db = db;
        this.currentUser = null;
        this.userProfile = null;
    }

    // Initialize auth state listener
    init() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    this.userProfile = await this.getUserProfile(user.uid);
                    resolve(this.userProfile);
                } else {
                    this.currentUser = null;
                    this.userProfile = null;
                    resolve(null);
                }
            });
        });
    }

    // Get user profile from Firestore
    async getUserProfile(uid) {
        try {
            const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
            const userDoc = await getDoc(doc(this.db, 'users', uid));
            
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check if user has specific permission
    hasPermission(permission) {
        if (!this.userProfile) return false;
        
        const permissions = this.userProfile.permissions || [];
        return permissions.includes(permission) || permissions.includes('full_access');
    }

    // Check if user has admin role
    isAdmin() {
        if (!this.userProfile) return false;
        return this.userProfile.role === 'admin';
    }

    // Check if user has IT support role
    isITSupport() {
        if (!this.userProfile) return false;
        return this.userProfile.role === 'it_support';
    }

    // Check if user can manage other users
    canManageUsers() {
        return this.hasPermission('manage_users');
    }

    // Check if user can create new users
    canCreateUsers() {
        return this.hasPermission('create_users');
    }

    // Require authentication (redirect to login if not authenticated)
    requireAuth(redirectUrl = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Require specific permission (show error if not authorized)
    requirePermission(permission, errorCallback = null) {
        if (!this.hasPermission(permission)) {
            if (errorCallback) {
                errorCallback(`No tienes permisos para: ${permission}`);
            } else {
                this.showAccessDenied();
            }
            return false;
        }
        return true;
    }

    // Require admin role
    requireAdmin(errorCallback = null) {
        if (!this.isAdmin() && !this.isITSupport()) {
            if (errorCallback) {
                errorCallback('Solo administradores pueden acceder a esta función.');
            } else {
                this.showAccessDenied();
            }
            return false;
        }
        return true;
    }

    // Show access denied message
    showAccessDenied() {
        const accessDeniedHtml = `
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="alert alert-danger text-center">
                            <h4>🚫 Acceso Denegado</h4>
                            <p>No tienes permisos para acceder a esta página.</p>
                            <a href="dashboard.html" class="btn btn-primary">Volver al Dashboard</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = accessDeniedHtml;
    }

    // Get current user info
    getCurrentUser() {
        return {
            auth: this.currentUser,
            profile: this.userProfile
        };
    }

    // Logout
    async logout() {
        try {
            await this.auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    // Check if user account is active
    isAccountActive() {
        if (!this.userProfile) return false;
        return this.userProfile.isActive !== false;
    }

    // Check if password change is required
    requiresPasswordChange() {
        if (!this.userProfile) return false;
        return this.userProfile.requirePasswordChange === true;
    }

    // Update user profile in Firestore
    async updateProfile(updates) {
        if (!this.currentUser) return false;
        
        try {
            const { updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
            await updateDoc(doc(this.db, 'users', this.currentUser.uid), {
                ...updates,
                updatedAt: new Date().toISOString()
            });
            
            // Update local profile
            this.userProfile = { ...this.userProfile, ...updates };
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    }
}

// Utility function to initialize auth middleware
export async function initAuthMiddleware() {
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');

    // Firebase configuration
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

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Create and initialize middleware
    const authMiddleware = new AuthMiddleware(auth, db);
    await authMiddleware.init();

    return authMiddleware;
}

// Page protection helper
export function protectPage(requiredPermissions = [], requireAdmin = false) {
    document.addEventListener('DOMContentLoaded', async () => {
        const authMiddleware = await initAuthMiddleware();
        
        // Check authentication
        if (!authMiddleware.requireAuth()) {
            return;
        }

        // Check if account is active
        if (!authMiddleware.isAccountActive()) {
            alert('Tu cuenta ha sido desactivada. Contacta al administrador.');
            authMiddleware.logout();
            return;
        }

        // Check admin requirement
        if (requireAdmin && !authMiddleware.requireAdmin()) {
            return;
        }

        // Check specific permissions
        for (const permission of requiredPermissions) {
            if (!authMiddleware.requirePermission(permission)) {
                return;
            }
        }

        // Check if password change is required
        if (authMiddleware.requiresPasswordChange()) {
            alert('Debes cambiar tu contraseña antes de continuar.');
            window.location.href = 'change-password.html';
            return;
        }

        // All checks passed, page can load normally
        console.log('✅ Autenticación y autorización exitosa');
    });
}

// Helper to add user info to UI
export function addUserInfoToUI(authMiddleware) {
    const user = authMiddleware.getCurrentUser();
    if (user.profile) {
        // Add user name to navbar or header
        const userElements = document.querySelectorAll('.user-name');
        userElements.forEach(el => {
            el.textContent = `${user.profile.firstName} ${user.profile.lastName}`;
        });

        // Add user role
        const roleElements = document.querySelectorAll('.user-role');
        roleElements.forEach(el => {
            el.textContent = user.profile.role;
        });

        // Show/hide admin features
        if (authMiddleware.canManageUsers()) {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'block';
            });
        }
    }
}