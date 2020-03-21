function signUp() {
    const email = document.getElementById("email_input").value;
    const password = document.getElementById("password_input").value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            changeDisplayname(document.getElementById("displayname_input").value);
            // Hide the dialog
            toggleLoginDialog();
            document.getElementById("butAdd").hidden = false;
            updateData();
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            document.querySelector(".error").textContent = errorMessage;
            console.log(`${errorCode}: ${errorMessage}`)
        });
}

function logIn() {
    const email = document.getElementById("email_input").value;
    const password = document.getElementById("password_input").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            // Hide the dialog
            toggleLoginDialog();
            document.getElementById("butAdd").hidden = false;
            updateData();
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            document.querySelector(".error").textContent = errorMessage;
            console.log(`${errorCode}: ${errorMessage}`)
        });
}

function logOut() {
    firebase.auth().signOut()
        .then(() => {
            // Sign-out successful.
            toggleLoginDialog();
            document.getElementById("butAdd").hidden = true;
            let eis = document.getElementsByClassName("event_item");
            eis.forEach(element => {
                element.remove();
            });
        })
        .catch((error) => {
            // An error happened
        });
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        currentUser = firebase.auth().currentUser;
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        showDisplayname(displayName);
        document.getElementById("butAdd").hidden = false;
    } else {
        // User is signed out.
        currentUser = null;
        toggleLoginDialog();
        document.getElementById("butAdd").hidden = true;
    }
});

function changeDisplayname(new_name) {
    return currentUser.updateProfile({
        displayName: new_name,
    });
}

function saveSettings() {
    changeDisplayname(document.getElementById("change_displayname_input").value).then(() => {
        toggleSettingsDialog();
        showDisplayname(currentUser.displayName);
    }).catch((err) => {
        document.getElementById("settingsError").textContent = err.message;
    })
}