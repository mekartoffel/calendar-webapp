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

function cancelSettings() {
    toggleEditDialog();
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

function toggleEditDialog() {
    calendarApp.editDialogContainer.classList.toggle("visible");
}

function openEditDialog(evt) {
    calendarApp.editDialogContainer.classList.toggle("visible");
    const parent = evt.srcElement.parentElement;
    db.collection("appointments").doc(parent.id).get().then(doc => {
        const data = doc.data();
        const description = data.description;
        const name = data.name;
        const from = data.from;
        const to = data.to;
        console.log(`${doc.id} ${name}`)
        document.getElementById("inputDescriptionEdit").value = description;
        document.getElementById("inputTimeFromEdit").value = from.join(' ');
        document.getElementById("inputTimeToEdit").value = to.join(' ');
    }).catch(error => {
        console.log(error.message);
    })
}