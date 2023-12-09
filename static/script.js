// history.replaceState(null, document.title, location.href);

//     // Add an event listener to prevent the default behavior of the back button.
// window.addEventListener('popstate', function (event) {
//       history.pushState(null, document.title, location.href);
//     });

if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

const container = document.getElementById("C");
const containerHeight = messages.length * 12; // Adjust the multiplier as needed

container.style.minHeight = containerHeight + "vh";