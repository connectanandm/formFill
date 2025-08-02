// Global variables
let currentCreator = '';

// DOM Elements
const createFormBtn = document.getElementById('createFormBtn');
const creatorEmailInput = document.getElementById('creatorEmail');
const feedbackForm = document.getElementById('feedbackForm');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');
const closeModal = document.getElementById('closeModal');
const closeErrorModal = document.getElementById('closeErrorModal');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the form page
    if (window.location.pathname.includes('form.html')) {
        initializeFormPage();
    } else {
        // We're on the landing page
        initializeLandingPage();
    }
});

// Landing page initialization
function initializeLandingPage() {
    if (createFormBtn && creatorEmailInput) {
        createFormBtn.addEventListener('click', handleCreateForm);
        creatorEmailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleCreateForm();
            }
        });
    }
}

// Form page initialization
function initializeFormPage() {
    // Get creator email from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentCreator = urlParams.get('creator');
    
    if (!currentCreator) {
        // Redirect to landing page if no creator specified
        window.location.href = 'index.html';
        return;
    }
    
    // Update the form subtitle to show who will receive the message
    const formSubtitle = document.getElementById('formSubtitle');
    if (formSubtitle) {
        formSubtitle.textContent = `Send your message to ${currentCreator}. We'd love to hear from you!`;
    }
    
    // Set up form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Set up modal close events
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
    }
    
    if (closeErrorModal) {
        closeErrorModal.addEventListener('click', () => {
            errorModal.style.display = 'none';
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
        if (e.target === errorModal) {
            errorModal.style.display = 'none';
        }
    });
}

// Handle form creation on landing page
function handleCreateForm() {
    const email = creatorEmailInput.value.trim();
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Redirect to form page with creator parameter
    window.location.href = `form.html?creator=${encodeURIComponent(email)}`;
}

// Handle feedback form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(feedbackForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const message = formData.get('message').trim();
    
    // Validation
    if (!name || !email || !message) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    setSubmitButtonLoading(true);
    
    try {
        const response = await fetch('/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                creator: currentCreator
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Success - show success modal
            feedbackForm.reset();
            showSuccess();
        } else {
            // Error from server
            showError(result.error || 'Failed to send message. Please try again.');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        setSubmitButtonLoading(false);
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function setSubmitButtonLoading(loading) {
    if (!submitBtn) return;
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (loading) {
        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';
    } else {
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
    }
}

function showSuccess() {
    if (successModal) {
        successModal.style.display = 'flex';
        // Auto-hide after 5 seconds
        setTimeout(() => {
            successModal.style.display = 'none';
        }, 5000);
    }
}

function showError(message) {
    if (errorModal) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        errorModal.style.display = 'flex';
    } else {
        // Fallback to alert if modal doesn't exist
        alert(message);
    }
}

// Copy form link functionality (for future enhancement)
function copyFormLink() {
    const formUrl = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(formUrl).then(() => {
            alert('Form link copied to clipboard!');
        }).catch(() => {
            fallbackCopyToClipboard(formUrl);
        });
    } else {
        fallbackCopyToClipboard(formUrl);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('Form link copied to clipboard!');
    } catch (err) {
        alert('Could not copy link. Please copy manually: ' + text);
    }
    
    document.body.removeChild(textArea);
}