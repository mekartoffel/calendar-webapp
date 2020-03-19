"use strict";
var db = firebase.firestore();
var currentUser;
firebase.auth().useDeviceLanguage();
var currentDay;

const calendarApp = {
  selectedLocations: {},
  selectedAppointments: {},
  addDialogContainer: document.getElementById("addDialogContainer"),
  loginDialogContainer: document.getElementById("loginDialogContainer"),
  settingsDialogContainer: document.getElementById("settingsDialogContainer")
};

function showDisplayname(displayName) {
  document.querySelector(".username").textContent = `, ${displayName}`;
}

/**
 * Event handler for butDialogAdd, adds the selected location to the list.
 */
function addAppointment() {
  // Hide the dialog
  toggleAddDialog();
  // Get the selected city
  console.log('add....')
  const select = document.getElementById("selectAppointmentToAdd");
  const selected = select.options[select.selectedIndex];
  const inputDescription = document.getElementById("inputDescription").value;
  const inputTimeFrom = document.getElementById("inputTimeFrom").value;
  const inputTimeTo = document.getElementById("inputTimeTo").value;
  pushAppointment(inputDescription, inputTimeFrom, inputTimeTo);
  getAppointments(currentDay);

  const geo = selected.value;
  const label = selected.textContent;
  const location = { label: label, geo: geo };
  // Create a new card & get the weather data from the server
  const card = getForecastCard(location);
  getForecastFromNetwork(geo).then(forecast => {
    renderForecast(card, forecast);
  });
  // Save the updated list of selected cities.
  calendarApp.selectedLocations[geo] = location;
  saveLocationList(calendarApp.selectedLocations);
}

/**
 * Get's the HTML element for the calendar, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} id ID
 * @return {Element} The element for the calendar.
 */
function getAppointmentCard(id, name, description, from, to) {
  const card = document.getElementById(id);
  if (card) {
    return card;
  }
  const newCard = document.querySelector(".event_item_template").cloneNode(true);
  newCard.className = "event_item";
  if (from[0] === to[0]) {
    newCard.querySelector(".ei_Title").textContent = `${from[1]} Uhr bis ${to[1]} Uhr`;
  } else {
    newCard.querySelector(".ei_Title").textContent = `${from[0]} ${from[1]} Uhr bis ${to[0]} ${to[1]} Uhr`;
  }
  newCard.querySelector(".ei_name").textContent = `${name}`;
  newCard.querySelector(".ei_description").textContent = `${description}`;
  newCard.setAttribute("id", id);
  newCard
    .querySelector(".remove-appointment")
    .addEventListener("click", removeAppointment);
  document.querySelector(".calendar_events").appendChild(newCard);
  newCard.removeAttribute("hidden");
  return newCard;
}

/**
 * Event handler for .remove-city, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeAppointment(evt) {
  const parent = evt.srcElement.parentElement;
  parent.remove();
  console.log('remove...');
  if (calendarApp.selectedAppointments[parent.id]) {
    delete calendarApp.selectedAppointments[parent.id];
  }
  deleteAppointment(parent.id);
}


/**
 * Event handler for .remove-city, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeLocation(evt) {
  const parent = evt.srcElement.parentElement;
  parent.remove();
  if (calendarApp.selectedLocations[parent.id]) {
    delete calendarApp.selectedLocations[parent.id];
    saveLocationList(calendarApp.selectedLocations);
  }
}

/**
 * Renders the forecast data into the card element.
 *
 * @param {Element} card The card element to update.
 * @param {Object} data Weather forecast data to update the element with.
 */
function renderForecast(card, data) {
  if (!data) {
    // There's no data, skip the update.
    return;
  }

  // Find out when the element was last updated.
  const cardLastUpdatedElem = card.querySelector(".card-last-updated");
  const cardLastUpdated = cardLastUpdatedElem.textContent;
  const lastUpdated = parseInt(cardLastUpdated);

  // If the data on the element is newer, skip the update.
  if (lastUpdated >= data.currently.time) {
    return;
  }
  cardLastUpdatedElem.textContent = data.currently.time;

  // Render the forecast data into the card.
  card.querySelector(".description").textContent = data.currently.summary;
  const forecastFrom = luxon.DateTime.fromSeconds(data.currently.time)
    .setZone(data.timezone)
    .toFormat("DDDD t");
  card.querySelector(".date").textContent = forecastFrom;

  // Render the next 7 days.
  const futureTiles = card.querySelectorAll(".future .oneday");
  futureTiles.forEach((tile, index) => {
    const forecast = data.daily.data[index + 1];
    const forecastFor = luxon.DateTime.fromSeconds(forecast.time)
      .setZone(data.timezone)
      .toFormat("ccc");
    tile.querySelector(".date").textContent = forecastFor;
    tile.querySelector(".icon").className = `icon ${forecast.icon}`;
    tile.querySelector(".temp-high .value").textContent = Math.round(
      forecast.temperatureHigh
    );
    tile.querySelector(".temp-low .value").textContent = Math.round(
      forecast.temperatureLow
    );
  });

  // If the loading spinner is still visible, remove it.
  const spinner = card.querySelector(".card-spinner");
  if (spinner) {
    card.removeChild(spinner);
  }
}

/**
 * Get's the latest forecast data from the network.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromNetwork(coords) {
  return fetch(`/forecast/${coords}`)
    .then(response => {
      return response.json();
    })
    .catch(() => {
      return null;
    });
}

/**
 * Get's the cached forecast data from the caches object.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromCache(coords) {
  // CODELAB: Add code to get weather forecast from the caches object.
  if (!("caches" in window)) {
    return null;
  }
  const url = `${window.location.origin}/forecast/${coords}`;
  return caches
    .match(url)
    .then(response => {
      if (response) {
        return response.json();
      }
      return null;
    })
    .catch(err => {
      console.error("Error getting data from cache", err);
      return null;
    });
}

/**
 * Get's the HTML element for the weather forecast, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} location Location object
 * @return {Element} The element for the weather forecast.
 */
function getForecastCard(location) {
  const id = location.geo;
  const card = document.getElementById(id);
  if (card) {
    return card;
  }
  const newCard = document.getElementById("calendar-template").cloneNode(true);
  newCard.querySelector(".location").textContent = location.label;
  newCard.setAttribute("id", id);
  newCard
    .querySelector(".remove-appointment")
    .addEventListener("click", removeAppointment);
  document.querySelector("main").appendChild(newCard);
  newCard.removeAttribute("hidden");
  return newCard;
}

/**
 * Gets the latest weather forecast data and updates each card with the
 * new data.
 */
function updateData() {
  getAppointments(currentDay);
  Object.keys(calendarApp.selectedLocations).forEach(key => {
    const location = calendarApp.selectedLocations[key];
    const card = getForecastCard(location);
    // CODELAB: Add code to call getForecastFromCache
    getForecastFromCache(location.geo).then(forecast => {
      renderForecast(card, forecast);
    });
    // Get the forecast data from the network.
    getForecastFromNetwork(location.geo).then(forecast => {
      renderForecast(card, forecast);
    });
  });
}

/**
 * Saves the list of locations.
 *
 * @param {Object} locations The list of locations to save.
 */
function saveLocationList(locations) {
  const data = JSON.stringify(locations);
  localStorage.setItem("locationList", data);
}



function setUpTime() {
  var today = new Date();
  currentDay = today;
  var dd = String(today.getDate()).padStart(2, "0");
  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember"
  ];
  var mm = monthNames[today.getMonth()];
  var yyyy = today.getFullYear();
  const today_str = dd + ". " + mm + " " + yyyy;
  document.getElementById("today").textContent = today_str;
  setCurrentDay(0);
}

function setCurrentDay(i) {
  currentDay.setDate(currentDay.getDate() + i);
  var dd = String(currentDay.getDate()).padStart(2, "0");
  var mm = String(currentDay.getMonth() + 1).padStart(2, "0");
  var yyyy = currentDay.getFullYear();
  var day_str = dd + "." + mm + "." + yyyy;
  document.getElementById("other_day").textContent = day_str;
}

function getNextDay() {
  setCurrentDay(1);
  getAppointments(currentDay);
}

function getPrevDay() {
  setCurrentDay(-1);
  getAppointments(currentDay);
}

/**
 * Initialize the app, gets the list of locations from local storage, then
 * renders the initial data.
 */
function init() {
  setUpTime();
  updateData();

  // Set up the event handlers for all of the buttons.
  document
    .getElementById("butRefresh")
    .addEventListener("click", updateData);
  document
    .getElementById("butAdd")
    .addEventListener("click", toggleAddDialog);
  document
    .getElementById("butDialogCancel")
    .addEventListener("click", toggleAddDialog);
  document
    .getElementById("butDialogAdd")
    .addEventListener("click", addAppointment);
  document
    .getElementById("butDialogLogin")
    .addEventListener("click", logIn);
  document
    .getElementById("butDialogSignup")
    .addEventListener("click", signUp);
  document
    .getElementById("butDialogCancelSettings")
    .addEventListener("click", cancelSettings);
  document
    .getElementById("butDialogSaveSettings")
    .addEventListener("click", saveSettings);
  document
    .querySelector(".next-day")
    .addEventListener("click", getNextDay);
  document
    .querySelector(".prev-day")
    .addEventListener("click", getPrevDay);
}

init();
