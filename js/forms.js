// Form Handling and Validation
class FormHandler {
    constructor() {
        this.setupFormValidation();
        this.setupFormEnhancements();
    }

    setupFormValidation() {
        // Login form validation
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            this.setupLoginValidation(loginForm);
        }

        // Register form validation
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            this.setupRegisterValidation(registerForm);
        }

        // Item form validation
        const itemForm = document.getElementById('item-form');
        if (itemForm) {
            this.setupItemValidation(itemForm);
        }
    }

    setupLoginValidation(form) {
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');

        // Real-time validation
        usernameInput.addEventListener('blur', () => {
            this.validateField(usernameInput, this.validateUsername);
        });

        passwordInput.addEventListener('blur', () => {
            this.validateField(passwordInput, this.validatePassword);
        });

        // Form submission validation
        form.addEventListener('submit', (e) => {
            const isUsernameValid = this.validateField(usernameInput, this.validateUsername);
            const isPasswordValid = this.validateField(passwordInput, this.validatePassword);

            if (!isUsernameValid || !isPasswordValid) {
                e.preventDefault();
                this.showFormError('Please fix the errors above.');
            }
        });
    }

    setupRegisterValidation(form) {
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmInput = document.getElementById('register-confirm');

        // Real-time validation
        nameInput.addEventListener('blur', () => {
            this.validateField(nameInput, this.validateName);
        });

        emailInput.addEventListener('blur', () => {
            this.validateField(emailInput, this.validateEmail);
        });

        passwordInput.addEventListener('blur', () => {
            this.validateField(passwordInput, this.validatePassword);
        });

        confirmInput.addEventListener('blur', () => {
            this.validateField(confirmInput, (value) => this.validateConfirmPassword(value, passwordInput.value));
        });

        // Form submission validation
        form.addEventListener('submit', (e) => {
            const isNameValid = this.validateField(nameInput, this.validateName);
            const isEmailValid = this.validateField(emailInput, this.validateEmail);
            const isPasswordValid = this.validateField(passwordInput, this.validatePassword);
            const isConfirmValid = this.validateField(confirmInput, (value) => this.validateConfirmPassword(value, passwordInput.value));

            if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
                e.preventDefault();
                this.showFormError('Please fix the errors above.');
            }
        });
    }

    setupItemValidation(form) {
        const nameInput = document.getElementById('item-name');
        const descriptionInput = document.getElementById('item-description');

        // Real-time validation
        nameInput.addEventListener('blur', () => {
            this.validateField(nameInput, this.validateItemName);
        });

        descriptionInput.addEventListener('blur', () => {
            this.validateField(descriptionInput, this.validateDescription);
        });

        // Form submission validation
        form.addEventListener('submit', (e) => {
            const isNameValid = this.validateField(nameInput, this.validateItemName);
            const isDescriptionValid = this.validateField(descriptionInput, this.validateDescription);

            if (!isNameValid || !isDescriptionValid) {
                e.preventDefault();
                this.showFormError('Please fix the errors above.');
            }
        });
    }

    setupFormEnhancements() {
        // Add loading states to buttons
        document.querySelectorAll('form').forEach(form => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                form.addEventListener('submit', () => {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Processing...';
                    
                    // Re-enable after a delay (simulate processing)
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
                    }, 2000);
                });
            }
        });

        // Store original button text
        document.querySelectorAll('button[type="submit"]').forEach(btn => {
            btn.setAttribute('data-original-text', btn.textContent);
        });
    }

    // Validation functions
    validateUsername(value) {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        return null;
    }

    validatePassword(value) {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
    }

    validateName(value) {
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
    }

    validateEmail(value) {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
    }

    validateConfirmPassword(value, password) {
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return null;
    }

    validateItemName(value) {
        if (!value) return 'Product name is required';
        if (value.length < 3) return 'Product name must be at least 3 characters';
        return null;
    }

    validateDescription(value) {
        if (!value) return 'Description is required';
        if (value.length < 10) return 'Description must be at least 10 characters';
        return null;
    }

    // Field validation helper
    validateField(field, validator) {
        const value = field.value.trim();
        const error = validator(value);
        
        this.clearFieldError(field);
        
        if (error) {
            this.showFieldError(field, error);
            return false;
        }
        
        return true;
    }

    // Error display helpers
    showFieldError(field, message) {
        field.classList.add('error');
        
        // Create or update error message
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.color = '#dc2626';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    showFormError(message) {
        // Create a temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc2626';
        errorDiv.style.backgroundColor = '#fef2f2';
        errorDiv.style.border = '1px solid #fecaca';
        errorDiv.style.padding = '0.75rem';
        errorDiv.style.borderRadius = '0.375rem';
        errorDiv.style.marginBottom = '1rem';
        errorDiv.style.textAlign = 'center';

        // Insert at the top of the form
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
            
            // Remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        }
    }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
}); 