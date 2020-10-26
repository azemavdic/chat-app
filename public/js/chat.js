const socket = io();

//Elementi
const $messageForm = document.querySelector(".send-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocation = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMesageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMesageMargin;

  //Visible Height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    //Autoscroll
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("welcomeMessage", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("MMM D [u] HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("MMM D [u] HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // Isljuci formu dok se ne posalju podaci
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = event.target.message.value; //'message' je vrijednost od 'name' kod inputa u formi
  socket.emit("poruka", message, (error) => {
    // Ukljuci formu nakon sto su podaci poslani
    $messageFormButton.removeAttribute("disabled");
    //Očisti input nakon poslane poruke i stavi fokus na input
    $messageFormInput.value = "";
    $messageFormInput.focus();

    $sendLocation.removeAttribute("disabled");

    if (error) {
      return console.log(error);
    }
    console.log("Poruka poslana!");
  });
});

// Geolokacija sa MDN službena, funkcije ugrađene
$sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert(
      "Vaš pretraživač ne podržava geolokaciju. Molimo nadogradite ga!"
    );
  }

  $sendLocation.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocation.removeAttribute("disabled");
        console.log("Lokacija je podijeljena!");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
