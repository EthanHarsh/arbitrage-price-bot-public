const verb = process.env.VERB && process.env.VERB.toLowerCase() === "true";

module.exports = checkVerb;

function checkVerb(log) {
  if (verb) {
    console.log(log);
  }
}
