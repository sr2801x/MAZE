function info(message, meta) {
  // eslint-disable-next-line no-console
  console.log(message, meta || "");
}

function warn(message, meta) {
  // eslint-disable-next-line no-console
  console.warn(message, meta || "");
}

function error(message, meta) {
  // eslint-disable-next-line no-console
  console.error(message, meta || "");
}

const logger = { info, warn, error };

module.exports = { logger };

