/**
 *  Determine if we need to refresh user data.
 */

/**
 * Determine if the stylesheets require a refresh.
 */
export default (currentDate, previousDate, refreshTime) => {
    // No previous `updated` time, no previous usernames set set.
    if (typeof previousDate === 'undefined') {
        return true;
    }

    // Check if the period between dates is greater than our refresh time limit.
    let time = currentDate - previousDate;
    return time > refreshTime;
}
