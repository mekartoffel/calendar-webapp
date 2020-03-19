function pushAppointment(description, from, to) {
    console.log(`${from}-${to}`);
    console.log(`${currentUser.email}`)
    db.collection("appointments").add({
        email: currentUser.email,
        name: currentUser.displayName,
        description: description,
        from: from.split(' '),
        to: to.split(' ')
    }).then(function (docRef) {
        console.log("Document written with ID: ", docRef.id);
        calendarApp.selectedAppointments[docRef.id] = location;
    }).catch(function (error) {
        console.error("Error adding document: ", error);
    });
}

function isTodays(currentDay, data) {
    var dd = String(currentDay.getDate()).padStart(2, "0");
    var mm = String(currentDay.getMonth() + 1).padStart(2, "0");
    var yyyy = currentDay.getFullYear();
    const fromD = data.from[0].split('.')[0];
    const fromM = data.from[0].split('.')[1];
    const fromY = data.from[0].split('.')[2];
    const fromDate = new Date(`${fromY}-${fromM}-${fromD}`);
    const toD = data.to[0].split('.')[0];
    const toM = data.to[0].split('.')[1];
    const toY = data.to[0].split('.')[2];
    const toDate = new Date(`${toY}-${toM}-${toD}`);
    if (`${yyyy}-${mm}-${dd}` === `${fromY}-${fromM}-${fromD}` || `${yyyy}-${mm}-${dd}` === `${toY}-${toM}-${toD}`) {
        //it's the first or last day
        return true;
    } else if ((toDate.getTime() - fromDate.getTime()) > (currentDay.getTime() - fromDate.getTime()) && (currentDay.getTime() - fromDate.getTime() > 0)) {
        // It's a day in between
        return true;
    }

    return false;
}

function getAppointments(d) {
    db.collection("appointments").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            const description = data.description;
            const name = data.name;
            const from = data.from;
            const to = data.to;
            console.log(`${id}: ${description}`);
            if (isTodays(d, data)) {
                getAppointmentCard(id, name, description, from, to);
            } else {
                const card = document.getElementById(id);
                if (card) {
                    card.remove();
                }
            }
        })
    }).catch(error => {
        console.log(error.message);
    })
}

function deleteAppointment(id) {
    db.collection("appointments").doc(id).delete().then(() => {
        //getAppointments();
    }).catch(err => {
        console.log(err.message);
    })
}

