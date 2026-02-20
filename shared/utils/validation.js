// Email validation against university domain
function validateEmail(email, universityDomain) {
    if (!email || !email.includes('@')) {
        return { valid: false, error: 'Please enter a valid email address' };
    }

    const emailDomain = email.substring(email.lastIndexOf('@'));

    if (emailDomain !== universityDomain) {
        return { valid: false, error: `Email must end with ${universityDomain}` };
    }

    return { valid: true, error: null };
}

// Listing price validation
function validateListingPrice(price) {
    if (!price || isNaN(price)) {
        return { valid: false, error: 'Please enter a valid price' };
    }
    if (Number(price) < 1) {
        return { valid: false, error: 'Price must be at least $1' };
    }
    if (Number(price) > 5000) {
        return { valid: false, error: 'Price cannot exceed $5,000' };
    }
    return { valid: true, error: null };
}

// Check if item is eligible for Secure-Pay escrow
function isEscrowEligible(price) {
    return Number(price) >= 80;
}

// Calculate 7% service fee
function calculateServiceFee(price) {
    return (Number(price) * 0.07).toFixed(2);
}

// Validate listing title
function validateTitle(title) {
    if (!title || title.trim().length === 0) {
        return { valid: false, error: 'Please enter a title' };
    }
    if (title.trim().length < 3) {
        return { valid: false, error: 'Title must be at least 3 characters' };
    }
    if (title.trim().length > 100) {
        return { valid: false, error: 'Title cannot exceed 100 characters' };
    }
    return { valid: true, error: null };
}

module.exports = { validateEmail, validateListingPrice, isEscrowEligible, calculateServiceFee, validateTitle };