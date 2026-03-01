// const baseUrl = "https://crm-beta.oneoftheprojects.com";
const baseUrl = "https://whatsbots.net";

function normalizeDomain(input) {
  if (!input) return null;
  let urlStr = input.trim();
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = "https://" + urlStr;
  }
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.replace(/^www\./, "");
    return `https://${hostname}`;
  } catch (e) {
    return null; // invalid domain
  }
}

module.exports = { baseUrl: normalizeDomain(baseUrl) };
