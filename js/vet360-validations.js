// vet360-validations.js - Sistema de validaciones centralizado para VET360
// Validaciones robustas para prevenir errores de usuario

class VET360Validator {
    constructor() {
        this.errors = [];
        this.rules = {
            // Patrones de validación
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            phone: /^[+]?[\d\s\-\(\)]{7,15}$/,
            onlyLetters: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/,
            alphanumeric: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]{1,100}$/,
            numbers: /^\d+$/,
            decimal: /^\d+(\.\d{1,2})?$/,
            password: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/,
            petName: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,30}$/,
            species: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,20}$/
        };
        
        // Límites de caracteres
        this.limits = {
            name: { min: 2, max: 50 },
            email: { min: 5, max: 100 },
            phone: { min: 7, max: 15 },
            password: { min: 6, max: 50 },
            petName: { min: 1, max: 30 },
            species: { min: 2, max: 20 },
            breed: { min: 2, max: 30 },
            address: { min: 10, max: 200 },
            notes: { min: 0, max: 500 },
            age: { min: 0, max: 30 },
            weight: { min: 0.1, max: 200 }
        };
    }

    // Limpiar errores previos
    clearErrors() {
        this.errors = [];
    }

    // Añadir error
    addError(field, message) {
        this.errors.push({ field, message });
    }

    // Validar campo requerido
    validateRequired(value, fieldName) {
        if (!value || value.trim() === '') {
            this.addError(fieldName, `${fieldName} es obligatorio`);
            return false;
        }
        return true;
    }

    // Validar longitud de texto
    validateLength(value, fieldName, min = null, max = null) {
        if (!value) return false;
        
        const length = value.trim().length;
        const limits = this.limits[fieldName] || { min: min || 0, max: max || 255 };
        
        if (length < limits.min) {
            this.addError(fieldName, `${fieldName} debe tener al menos ${limits.min} caracteres`);
            return false;
        }
        
        if (length > limits.max) {
            this.addError(fieldName, `${fieldName} no puede exceder ${limits.max} caracteres`);
            return false;
        }
        
        return true;
    }

    // Validar email
    validateEmail(email) {
        if (!email) {
            this.addError('email', 'El email es obligatorio');
            return false;
        }
        
        if (!this.rules.email.test(email)) {
            this.addError('email', 'Formato de email inválido');
            return false;
        }
        
        if (!this.validateLength(email, 'email')) {
            return false;
        }
        
        return true;
    }

    // Validar teléfono
    validatePhone(phone) {
        if (!phone) {
            this.addError('phone', 'El teléfono es obligatorio');
            return false;
        }
        
        // Limpiar formato para validación
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        if (cleanPhone.length < 7 || cleanPhone.length > 15) {
            this.addError('phone', 'El teléfono debe tener entre 7 y 15 dígitos');
            return false;
        }
        
        if (!/^[+]?\d+$/.test(cleanPhone)) {
            this.addError('phone', 'El teléfono solo puede contener números y el símbolo +');
            return false;
        }
        
        return true;
    }

    // Validar contraseña
    validatePassword(password) {
        if (!password) {
            this.addError('password', 'La contraseña es obligatoria');
            return false;
        }
        
        if (password.length < 6) {
            this.addError('password', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        if (password.length > 50) {
            this.addError('password', 'La contraseña no puede exceder 50 caracteres');
            return false;
        }
        
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
            this.addError('password', 'La contraseña debe contener al menos una letra y un número');
            return false;
        }
        
        return true;
    }

    // Validar nombre (solo letras y espacios)
    validateName(name, fieldName = 'nombre') {
        if (!this.validateRequired(name, fieldName)) return false;
        if (!this.validateLength(name, 'name')) return false;
        
        if (!this.rules.onlyLetters.test(name)) {
            this.addError(fieldName, `${fieldName} solo puede contener letras y espacios`);
            return false;
        }
        
        // Verificar que no tenga espacios múltiples
        if (/\s{2,}/.test(name)) {
            this.addError(fieldName, `${fieldName} no puede tener espacios múltiples`);
            return false;
        }
        
        return true;
    }

    // Validar nombre de mascota
    validatePetName(name) {
        if (!this.validateRequired(name, 'nombre de mascota')) return false;
        if (!this.validateLength(name, 'petName')) return false;
        
        if (!this.rules.petName.test(name)) {
            this.addError('petName', 'El nombre de la mascota solo puede contener letras y espacios');
            return false;
        }
        
        return true;
    }

    // Validar especie
    validateSpecies(species) {
        if (!this.validateRequired(species, 'especie')) return false;
        if (!this.validateLength(species, 'species')) return false;
        
        if (!this.rules.species.test(species)) {
            this.addError('species', 'La especie solo puede contener letras y espacios');
            return false;
        }
        
        return true;
    }

    // Validar edad
    validateAge(age) {
        if (age === null || age === undefined || age === '') {
            return true; // Opcional
        }
        
        const ageNum = parseInt(age);
        
        if (isNaN(ageNum)) {
            this.addError('age', 'La edad debe ser un número válido');
            return false;
        }
        
        if (ageNum < 0 || ageNum > 30) {
            this.addError('age', 'La edad debe estar entre 0 y 30 años');
            return false;
        }
        
        return true;
    }

    // Validar peso
    validateWeight(weight) {
        if (weight === null || weight === undefined || weight === '') {
            return true; // Opcional
        }
        
        const weightNum = parseFloat(weight);
        
        if (isNaN(weightNum)) {
            this.addError('weight', 'El peso debe ser un número válido');
            return false;
        }
        
        if (weightNum <= 0 || weightNum > 200) {
            this.addError('weight', 'El peso debe estar entre 0.1 y 200 kg');
            return false;
        }
        
        return true;
    }

    // Validar raza
    validateBreed(breed) {
        if (!breed || breed.trim() === '') {
            return true; // Opcional
        }
        
        if (!this.validateLength(breed, 'breed')) return false;
        
        if (!this.rules.onlyLetters.test(breed)) {
            this.addError('breed', 'La raza solo puede contener letras y espacios');
            return false;
        }
        
        return true;
    }

    // Validar notas/comentarios
    validateNotes(notes) {
        if (!notes || notes.trim() === '') {
            return true; // Opcional
        }
        
        if (!this.validateLength(notes, 'notes')) return false;
        
        // Verificar caracteres peligrosos
        const dangerousChars = /<script|javascript:|data:|vbscript:/i;
        if (dangerousChars.test(notes)) {
            this.addError('notes', 'Las notas contienen caracteres no permitidos');
            return false;
        }
        
        return true;
    }

    // Validar monto/precio
    validateAmount(amount, fieldName = 'monto') {
        if (!amount) {
            this.addError(fieldName, `${fieldName} es obligatorio`);
            return false;
        }
        
        const amountNum = parseFloat(amount);
        
        if (isNaN(amountNum)) {
            this.addError(fieldName, `${fieldName} debe ser un número válido`);
            return false;
        }
        
        if (amountNum < 0) {
            this.addError(fieldName, `${fieldName} no puede ser negativo`);
            return false;
        }
        
        if (amountNum > 999999.99) {
            this.addError(fieldName, `${fieldName} no puede exceder $999,999.99`);
            return false;
        }
        
        // Verificar máximo 2 decimales
        const decimalPart = amount.toString().split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
            this.addError(fieldName, `${fieldName} no puede tener más de 2 decimales`);
            return false;
        }
        
        return true;
    }

    // Validar fecha
    validateDate(date, fieldName = 'fecha') {
        if (!date) {
            this.addError(fieldName, `${fieldName} es obligatoria`);
            return false;
        }
        
        const dateObj = new Date(date);
        const today = new Date();
        
        if (isNaN(dateObj.getTime())) {
            this.addError(fieldName, `${fieldName} no es válida`);
            return false;
        }
        
        // Verificar que no sea muy antigua (más de 50 años)
        const fiftyYearsAgo = new Date();
        fiftyYearsAgo.setFullYear(today.getFullYear() - 50);
        
        if (dateObj < fiftyYearsAgo) {
            this.addError(fieldName, `${fieldName} no puede ser anterior a ${fiftyYearsAgo.getFullYear()}`);
            return false;
        }
        
        // Verificar que no sea más de 5 años en el futuro
        const fiveYearsFromNow = new Date();
        fiveYearsFromNow.setFullYear(today.getFullYear() + 5);
        
        if (dateObj > fiveYearsFromNow) {
            this.addError(fieldName, `${fieldName} no puede ser posterior a ${fiveYearsFromNow.getFullYear()}`);
            return false;
        }
        
        return true;
    }

    // Obtener errores
    getErrors() {
        return this.errors;
    }

    // Verificar si hay errores
    hasErrors() {
        return this.errors.length > 0;
    }

    // Mostrar errores en el DOM
    displayErrors(containerId = 'error-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (this.errors.length === 0) {
            container.innerHTML = '';
            container.classList.add('d-none');
            return;
        }
        
        const errorHtml = `
            <div class="alert alert-danger" role="alert">
                <h6><i class="bi bi-exclamation-triangle"></i> Errores encontrados:</h6>
                <ul class="mb-0">
                    ${this.errors.map(error => `<li>${error.message}</li>`).join('')}
                </ul>
            </div>
        `;
        
        container.innerHTML = errorHtml;
        container.classList.remove('d-none');
        
        // Scroll al contenedor de errores
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Limpiar errores del DOM
    clearErrorsFromDOM(containerId = 'error-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            container.classList.add('d-none');
        }
    }

    // Aplicar limitaciones a input en tiempo real
    applyInputLimitations(inputElement, type) {
        if (!inputElement) return;
        
        switch (type) {
            case 'name':
                inputElement.maxLength = 50;
                inputElement.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                    e.target.value = e.target.value.replace(/\s{2,}/g, ' ');
                });
                break;
                
            case 'petName':
                inputElement.maxLength = 30;
                inputElement.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                });
                break;
                
            case 'phone':
                inputElement.maxLength = 15;
                inputElement.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^\d\s\-\(\)+]/g, '');
                });
                break;
                
            case 'email':
                inputElement.maxLength = 100;
                inputElement.addEventListener('input', (e) => {
                    e.target.value = e.target.value.toLowerCase().trim();
                });
                break;
                
            case 'number':
                inputElement.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^\d]/g, '');
                });
                break;
                
            case 'decimal':
                inputElement.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^\d.]/g, '');
                    // Solo permitir un punto decimal
                    const parts = e.target.value.split('.');
                    if (parts.length > 2) {
                        e.target.value = parts[0] + '.' + parts[1];
                    }
                });
                break;
                
            case 'notes':
                inputElement.maxLength = 500;
                break;
        }
    }

    // Validación completa de formulario de cliente
    validateClientForm(formData) {
        this.clearErrors();
        
        let isValid = true;
        
        // Validar datos del cliente
        if (!this.validateName(formData.name, 'nombre del cliente')) isValid = false;
        if (!this.validateEmail(formData.email)) isValid = false;
        if (!this.validatePhone(formData.phone)) isValid = false;
        
        // Validar datos de la mascota (si existen)
        if (formData.pet) {
            if (!this.validatePetName(formData.pet.name)) isValid = false;
            if (formData.pet.species && !this.validateSpecies(formData.pet.species)) isValid = false;
            if (formData.pet.breed && !this.validateBreed(formData.pet.breed)) isValid = false;
            if (!this.validateAge(formData.pet.age)) isValid = false;
            if (!this.validateWeight(formData.pet.weight)) isValid = false;
            if (!this.validateNotes(formData.pet.medicalHistory)) isValid = false;
        }
        
        return isValid;
    }

    // Validación de formulario de login
    validateLoginForm(email, password) {
        this.clearErrors();
        
        let isValid = true;
        
        if (!this.validateEmail(email)) isValid = false;
        if (!this.validatePassword(password)) isValid = false;
        
        return isValid;
    }
}

// Instancia global del validador
window.vet360Validator = new VET360Validator();

// Funciones de utilidad para mostrar mensajes
window.showVET360Toast = function(title, message, type = 'info') {
    // Crear contenedor de toast si no existe
    let toastContainer = document.getElementById('vet360-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'vet360-toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';
    
    const toastHtml = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="toast-header ${bgClass} text-white border-0">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
    
    // Remover el toast del DOM después de que se oculte
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
};