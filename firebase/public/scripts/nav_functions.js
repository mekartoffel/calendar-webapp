/* Set the width of the side navigation to 250px */
function openNav() {
    if (currentUser) {
        document.getElementById("mySidenav").style.width = "240px";
    }
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function openSettings() {
    closeNav();
    toggleSettingsDialog();
}

function cancelSettings() {
    document.getElementById("settingsError").textContent = '';
    toggleSettingsDialog();
}

/**
 * Toggles the visibility of the dialog box.
 */
function toggleAddDialog() {
    calendarApp.addDialogContainer.classList.toggle("visible");
}
function toggleLoginDialog() {
    calendarApp.loginDialogContainer.classList.toggle("visible");
}
function toggleSettingsDialog() {
    calendarApp.settingsDialogContainer.classList.toggle("visible");
    document.getElementById("change_displayname_input").value = '';
    document.getElementById("settingsError").textContent = '';
}