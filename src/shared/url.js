/**
 * URL utilities.
 */

/**
 * Validate a URL field.
 */
const validate = url => {
    try {
        let _ = new URL(url);
        return true;
    } catch(error) {
        return false;
    }
}

export default {
    validate
}
