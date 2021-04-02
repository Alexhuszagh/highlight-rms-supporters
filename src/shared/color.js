/**
 * Color utilities.
 */

/**
 * Validate a color field.
 */
const validate = color => {
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
}

export default {
    validate
}
