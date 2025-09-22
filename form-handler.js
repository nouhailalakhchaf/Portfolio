// ===== GESTIONNAIRE DE FORMULAIRE AVANCÉ =====

class FormHandler {
    constructor() {
        this.init();
        this.setupValidation();
        this.setupSubmission();
        this.setupAutoSave();
    }

    init() {
        this.form = document.querySelector('#contactForm');
        this.submitBtn = this.form?.querySelector('.form-submit');
        this.fields = this.form?.querySelectorAll('input, select, textarea');
        
        // Configuration
        this.config = {
            autoSaveKey: 'nouhaila_contact_form',
            validationDelay: 500,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        };
        
        // État du formulaire
        this.formData = {};
        this.validationRules = this.setupValidationRules();
        this.isSubmitting = false;
        
        console.log('Gestionnaire de formulaire initialisé');
    }

    setupValidation() {
        if (!this.form) return;
        
        // Validation en temps réel
        this.fields.forEach(field => {
            field.addEventListener('input', (e) => this.handleFieldInput(e));
            field.addEventListener('blur', (e) => this.validateField(e.target));
            field.addEventListener('focus', (e) => this.clearFieldError(e.target));
        });
        
        // Validation globale avant soumission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setupValidationRules() {
        return {
            name: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
                errorMessages: {
                    required: 'Le nom est requis',
                    minLength: 'Le nom doit contenir au moins 2 caractères',
                    maxLength: 'Le nom ne peut pas dépasser 50 caractères',
                    pattern: 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'
                }
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                errorMessages: {
                    required: 'L\'email est requis',
                    pattern: 'Veuillez entrer une adresse email valide'
                }
            },
            company: {
                required: false,
                maxLength: 100,
                errorMessages: {
                    maxLength: 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères'
                }
            },
            service: {
                required: true,
                errorMessages: {
                    required: 'Veuillez sélectionner un service'
                }
            },
            budget: {
                required: false
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000,
                errorMessages: {
                    required: 'Le message est requis',
                    minLength: 'Le message doit contenir au moins 10 caractères',
                    maxLength: 'Le message ne peut pas dépasser 1000 caractères'
                }
            }
        };
    }

    handleFieldInput(e) {
        const field = e.target;
        
        // Mise à jour des données du formulaire
        this.formData[field.name] = field.value;
        
        // Auto-validation avec délai
        clearTimeout(field.validationTimer);
        field.validationTimer = setTimeout(() => {
            this.validateField(field);
        }, this.config.validationDelay);
        
        // Sauvegarde automatique
        this.autoSave();
    }

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;
        
        // Nettoyer les erreurs précédentes
        this.clearFieldError(field);
        
        // Validation required
        if (rules.required && !value) {
            this.showFieldError(field, rules.errorMessages.required);
            return false;
        }
        
        // Si le champ est vide et non requis, pas d'autre validation
        if (!value && !rules.required) return true;
        
        // Validation minLength
        if (rules.minLength && value.length < rules.minLength) {
            this.showFieldError(field, rules.errorMessages.minLength);
            return false;
        }
        
        // Validation maxLength
        if (rules.maxLength && value.length > rules.maxLength) {
            this.showFieldError(field, rules.errorMessages.maxLength);
            return false;
        }
        
        // Validation pattern
        if (rules.pattern && !rules.pattern.test(value)) {
            this.showFieldError(field, rules.errorMessages.pattern);
            return false;
        }
        
        // Validation spécifique pour l'email avec vérification avancée
        if (fieldName === 'email' && value) {
            if (!this.validateEmailAdvanced(value)) {
                this.showFieldError(field, 'Cette adresse email semble invalide');
                return false;
            }
        }
        
        // Validation réussie
        this.showFieldSuccess(field);
        return true;
    }

    validateEmailAdvanced(email) {
        // Validation basique avec regex
        const basicPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!basicPattern.test(email)) return false;
        
        // Vérifications avancées
        const parts = email.split('@');
        const domain = parts[1];
        
        // Domaines temporaires ou suspects (liste basique)
        const suspiciousDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
        if (suspiciousDomains.includes(domain.toLowerCase())) {
            return false;
        }
        
        return true;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        // Supprimer l'erreur existante
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) existingError.remove();
        
        // Créer le message d'erreur
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #f5576c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: slideInDown 0.3s ease-out;
        `;
        
        formGroup.appendChild(errorElement);
        
        // Style du champ en erreur
        field.style.borderColor = '#f5576c';
        field.style.boxShadow = '0 0 10px rgba(245, 87, 108, 0.2)';
        
        formGroup.classList.add('has-error');
    }

    showFieldSuccess(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        // Style du champ valide
        field.style.borderColor = '#43e97b';
        field.style.boxShadow = '0 0 10px rgba(67, 233, 123, 0.2)';
        
        formGroup.classList.remove('has-error');
        formGroup.classList.add('has-success');
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        // Supprimer le message d'erreur
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) errorElement.remove();
        
        // Réinitialiser le style
        field.style.borderColor = '';
        field.style.boxShadow = '';
        
        formGroup.classList.remove('has-error', 'has-success');
    }

    validateForm() {
        let isValid = true;
        
        this.fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validation complète
        if (!this.validateForm()) {
            this.showToast('Veuillez corriger les erreurs avant d\'envoyer', 'error');
            return;
        }
        
        this.submitForm();
    }

    async submitForm() {
        this.isSubmitting = true;
        this.updateSubmitButton(true);
        
        try {
            // Préparer les données
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                service: formData.get('service'),
                budget: formData.get('budget'),
                message: formData.get('message'),
                timestamp: new Date().toISOString(),
                source: 'Portfolio Nouhaila Lakhchaf',
                userAgent: navigator.userAgent
            };
            
            // Simuler l'envoi (en production, remplacer par un vrai endpoint)
            await this.simulateSubmission(data);
            
            // Succès
            this.handleSubmissionSuccess();
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            this.handleSubmissionError(error);
        } finally {
            this.isSubmitting = false;
            this.updateSubmitButton(false);
        }
    }

    async simulateSubmission(data) {
        // Simulation d'envoi avec délai
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simuler un succès dans 90% des cas
                if (Math.random() > 0.1) {
                    console.log('Données du formulaire:', data);
                    resolve(data);
                } else {
                    reject(new Error('Erreur de simulation'));
                }
            }, 2000);
        });
    }

    handleSubmissionSuccess() {
        // Animation de succès
        this.form.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.form.style.transform = 'scale(1)';
        }, 100);
        
        // Message de succès
        this.showToast('Message envoyé avec succès! Je vous répondrai rapidement.', 'success');
        
        // Réinitialiser le formulaire
        setTimeout(() => {
            this.resetForm();
        }, 1000);
        
        // Supprimer la sauvegarde automatique
        localStorage.removeItem(this.config.autoSaveKey);
        
        // Analytics (si configuré)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'contact',
                event_label: 'success'
            });
        }
    }

    handleSubmissionError(error) {
        console.error('Erreur de soumission:', error);
        
        // Animation d'erreur
        this.form.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.form.style.animation = '';
        }, 500);
        
        // Message d'erreur
        this.showToast(
            'Erreur lors de l\'envoi. Veuillez réessayer ou me contacter directement.',
            'error'
        );
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'contact',
                event_label: 'error'
            });
        }
    }

    updateSubmitButton(isLoading) {
        if (!this.submitBtn) return;
        
        if (isLoading) {
            this.submitBtn.innerHTML = `
                <div class="loading-spinner"></div>
                Envoi en cours...
            `;
            this.submitBtn.disabled = true;
            this.submitBtn.style.cursor = 'not-allowed';
        } else {
            this.submitBtn.innerHTML = `
                <i class="fas fa-paper-plane"></i>
                Envoyer ma demande
            `;
            this.submitBtn.disabled = false;
            this.submitBtn.style.cursor = 'pointer';
        }
    }

    resetForm() {
        this.form.reset();
        this.formData = {};
        
        // Nettoyer tous les styles de validation
        this.fields.forEach(field => {
            this.clearFieldError(field);
        });
        
        // Animation de reset
        this.form.style.opacity = '0.7';
        setTimeout(() => {
            this.form.style.opacity = '1';
        }, 200);
    }

    setupAutoSave() {
        // Charger les données sauvegardées
        this.loadAutoSavedData();
        
        // Sauvegarder automatiquement toutes les 5 secondes
        setInterval(() => {
            if (Object.keys(this.formData).length > 0) {
                this.autoSave();
            }
        }, 5000);
    }

    autoSave() {
        try {
            localStorage.setItem(this.config.autoSaveKey, JSON.stringify({
                data: this.formData,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Impossible de sauvegarder automatiquement:', error);
        }
    }

    loadAutoSavedData() {
        try {
            const saved = localStorage.getItem(this.config.autoSaveKey);
            if (!saved) return;
            
            const { data, timestamp } = JSON.parse(saved);
            
            // Vérifier que la sauvegarde n'est pas trop ancienne (24h)
            if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(this.config.autoSaveKey);
                return;
            }
            
            // Proposer de restaurer les données
            if (Object.keys(data).length > 0) {
                this.showAutoSaveNotification(data);
            }
        } catch (error) {
            console.warn('Erreur lors du chargement des données sauvegardées:', error);
        }
    }

    showAutoSaveNotification(data) {
        const notification = document.createElement('div');
        notification.className = 'autosave-notification';
        notification.innerHTML = `
            <div class="autosave-content">
                <i class="fas fa-save"></i>
                <span>Données de formulaire sauvegardées trouvées. Souhaitez-vous les restaurer?</span>
                <div class="autosave-buttons">
                    <button class="btn-restore">Restaurer</button>
                    <button class="btn-ignore">Ignorer</button>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 20px;
            color: white;
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Gestion des boutons
        notification.querySelector('.btn-restore').addEventListener('click', () => {
            this.restoreFormData(data);
            this.removeNotification(notification);
        });
        
        notification.querySelector('.btn-ignore').addEventListener('click', () => {
            localStorage.removeItem(this.config.autoSaveKey);
            this.removeNotification(notification);
        });
        
        // Supprimer automatiquement après 10 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                this.removeNotification(notification);
            }
        }, 10000);
    }

    restoreFormData(data) {
        Object.keys(data).forEach(key => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field && data[key]) {
                field.value = data[key];
                this.formData[key] = data[key];
            }
        });
        
        this.showToast('Données restaurées avec succès', 'success');
    }

    removeNotification(notification) {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(67, 233, 123, 0.9)' : type === 'error' ? 'rgba(245, 87, 108, 0.9)' : 'rgba(79, 172, 254, 0.9)'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            max-width: 350px;
            animation: slideInDown 0.5s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        // Suppression automatique
        setTimeout(() => {
            toast.style.animation = 'slideOutUp 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    // Méthodes utilitaires
    setupSubmission() {
        // Configuration pour l'envoi réel (à adapter selon le backend)
        this.submitEndpoint = '/api/contact'; // Remplacer par l'endpoint réel
        this.submitHeaders = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    }
}

// ===== STYLES CSS ADDITIONNELS =====

// Ajouter les styles pour les animations et notifications
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes slideInDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideOutUp {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
    
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
        margin-right: 8px;
    }
    
    .autosave-notification .autosave-buttons {
        margin-top: 15px;
        display: flex;
        gap: 10px;
    }
    
    .autosave-notification button {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.3s ease;
    }
    
    .btn-restore {
        background: rgba(67, 233, 123, 0.8);
        color: white;
    }
    
    .btn-ignore {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .field-error {
        animation: slideInDown 0.3s ease-out;
    }
`;

document.head.appendChild(additionalStyles);

// ===== INITIALISATION =====

document.addEventListener('DOMContentLoaded', () => {
    const formHandler = new FormHandler();
    
    // Exposer globalement pour le debugging
    window.formHandler = formHandler;
    
    console.log('📝 Gestionnaire de formulaire initialisé');
});