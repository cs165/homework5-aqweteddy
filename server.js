const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1ewBlSA_nToFF4UTamCuDLMMt4DjyXtZUZ1Opg14BAiA';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);


app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  let ans = [];
  for (var i = 1; i < rows.length; i++) {
    let dict = {};
    for (var j = 0; j < rows[0].length; j++) {
      dict[rows[0][j]] = rows[i][j];
    }
    ans.push(dict);
  }

  // TODO(you): Finish onGet.
  res.json(ans);
}
app.get('/api', onGet);

async function onPost(req, res) {
  let messageBody = {}
  for (var key in req.body)
    messageBody[key.toLowerCase()] = req.body[key];

  const result = await sheet.getRows();
  const rows = result.rows;
  // TODO(you): Implement onPost.
  console.log(messageBody)
  ans = [];
  for (var i = 0; i < rows[0].length; i++) {
    const name = rows[0][i].toLowerCase();
    ans.push(messageBody[name]);
  }
  sheet.appendRow(ans);
  res.json({ response: 'success' });
}
app.post('/api', jsonParser, onPost);

async function onDelete(req, res) {
  const column = req.params.column;
  const value = req.params.value;
  const result = await sheet.getRows();
  const rows = result.rows;

  let col = 0;

  for (let i = 0; i < rows[0].length; ++i) {
    if (rows[0][i].toLowerCase() == column.toLowerCase()) { col = i; break; }
  }
  for (let i = 1; i < rows.length; ++i) {
    if (rows[i][col] == value) {
      sheet.deleteRow(i);
      break;
    }
  }
  res.json({ response: 'success' });
}
app.delete('/api/:column/:value', onDelete);

async function onPatch(req, res) {
  const column = req.params.column;
  const value = req.params.value;
  const result = await sheet.getRows();
  const rows = result.rows;

  let messageBody = {}
  for (var key in req.body)
    messageBody[key.toLowerCase()] = req.body[key];

  function get(object, key, default_value) {
    var result = object[key];
    return (typeof result !== "undefined") ? result : default_value;
  }

  let col = 0;

  for (let i = 0; i < rows[0].length; ++i) {
    if (rows[0][i].toLowerCase() == column.toLowerCase()) { col = i; break; }
  }
  for (let i = 1; i < rows.length; ++i) {
    if (rows[i][col] == value) {
      for (let j = 0; j < rows[i].length; ++j) {
        rows[i][j] = get(messageBody, rows[0][j].toLowerCase(), rows[i][j]);
      }
      sheet.setRow(i, rows[i]);
      console.log(rows[i]);
      break;
    }
  }

  res.json({ response: "success" });
}
app.patch('/api/:column/:value', jsonParser, onPatch);



// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});
