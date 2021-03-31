/**
 *  Save user options for the RMS supporters highlighter.
 */

/**
 *  Load settings on page load.
 */
document.addEventListener('DOMContentLoaded', function() {
    const refreshTime = browser.storage.local.get('refresh');
    refreshTime.then(value => {
        if (value.refresh === undefined) {
            // Set default to 1 day.
            document.getElementById("refresh").value = '86400000';
            browser.storage.local.set({
                'refresh': event.target.value
            });
        } else {
            document.getElementById("refresh").value = value.refresh;
        }
    })
});

/**
 *  Save settings on selection change event.
 */
document.getElementById("refresh").addEventListener("input", function(event) {
    browser.storage.local.set({
        'refresh': event.target.value
    });
    event.preventDefault();
});
