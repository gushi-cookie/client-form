const https = require("https");

const request = https.get("https://2ch.hk/b/res/225171399.json");

function replaceChar(str, char, index) {
  return str.slice(0, index) + char + str.slice(index+1, str.length);
};

function unCrap(str) {

  let char;
  let replaceDoubleQuote = false;

  for(let i = 0; i < str.length; i++) {
    char = str[i];

    if(replaceDoubleQuote && char == '"') {
      str = replaceChar(str, "'", i);
      replaceDoubleQuote = false;
    } else if(char == "=" && str[i+1] == '"') {
      replaceDoubleQuote = true;
      str = replaceChar(str, "'", i+1);
    }
  }

  return str;

};

request.on('response', (resp) => {
  let data = "";

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log(JSON.parse(unCrap(data)).threads[0].posts[0].files[0]);
  });
});