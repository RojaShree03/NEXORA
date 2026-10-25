
/* Email validation */
export function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(String(email ?? '').trim());
}

/* Password strength validation */
export function isValidPassword(password) {
    if (typeof password !== 'string') {
        return false;
    }

    return (
        password.length >= 8 &&
        password.length <= 72 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}

/* Individual password requirements */
export function getPasswordRequirements(password = '') {
    const value = typeof password === 'string' ? password : '';

    return [
        {
            label: 'At least 8 characters',
            valid: value.length >= 8,
        },
        {
            label: 'No more than 72 characters',
            valid: value.length <= 72,
        },
        {
            label: 'One uppercase letter (A-Z)',
            valid: /[A-Z]/.test(value),
        },
        {
            label: 'One lowercase letter (a-z)',
            valid: /[a-z]/.test(value),
        },
        {
            label: 'One number (0-9)',
            valid: /\d/.test(value),
        },
        {
            label: 'One special symbol (@, #, !, etc.)',
            valid: /[^A-Za-z0-9]/.test(value),
        },
    ];
}

/* Confirm password validation */
export function passwordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}

/* Required field validation */
export function isRequired(value) {
    if (typeof value !== 'string') {
        return value !== null && value !== undefined;
    }

    return value.trim().length > 0;
}

/* OTP validation */
export function isValidOtp(otp) {
    return /^\d{6}$/.test(String(otp ?? ''));
}

/* Registration form validation */
export function validateRegistration({
    name,
    email,
    password,
    confirmPassword,
} = {}) {
    if (!isRequired(name)) {
        return 'Please enter your full name.';
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) {
        return 'Name must be between 2 and 80 characters.';
    }

    if (!isRequired(email)) {
        return 'Please enter your email address.';
    }

    if (!isValidEmail(email)) {
        return 'Please enter a valid email address.';
    }

    if (!isRequired(password)) {
        return 'Please enter a password.';
    }

    if (password.length < 8) {
        return 'Password must contain at least 8 characters.';
    }

    if (password.length > 72) {
        return 'Password must not exceed 72 characters.';
    }

    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter (A-Z).';
    }

    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter (a-z).';
    }

    if (!/\d/.test(password)) {
        return 'Password must contain at least one number (0-9).';
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        return 'Password must contain at least one special symbol (@, #, !, etc.).';
    }

    if (!isRequired(confirmPassword)) {
        return 'Please confirm your password.';
    }

    if (!passwordsMatch(password, confirmPassword)) {
        return 'Passwords do not match.';
    }

    return null;
}
