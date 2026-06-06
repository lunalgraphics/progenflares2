/**
 * Sets a browser cookie with a given name, value, and expiration in days.
 *
 * @param {string} cname - Cookie name.
 * @param {string} cvalue - Cookie value.
 * @param {number} exdays - Number of days until expiration.
 */
export function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Retrieves a cookie value by name.
 *
 * @param {string} cname - Cookie name to look up.
 * @returns {string} The cookie value, or empty string if not found.
 */
export function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
