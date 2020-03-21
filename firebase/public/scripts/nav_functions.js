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
    toggleEditDialog();
    const parent = evt.srcElement.parentElement;
    db.collection("appointments").doc(parent.id).get().then(doc => {
        const data = doc.data();
        const description = data.description;
        const withWhom = data.with;
        const from = data.from;
        const to = data.to;
        document.getElementById("inputDescriptionEdit").value = description;
        document.getElementById("inputTimeFromEdit").value = from.join(' ');
        document.getElementById("inputTimeToEdit").value = to.join(' ');
        document.getElementById("butDialogSaveEdit").value = doc.id;
        [...document.getElementsByClassName("withWhomEdit")].map(who => {
            console.log(who.value);
            if (withWhom.includes(who.value)) {
                who.checked = true;
            }
        });
    }).catch(error => {
        console.log(error.message);
    })
}