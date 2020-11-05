const express = require('express');
const fs = require('fs');
const { localHTML } = require('./build.js');
const Freemarker = require('freemarker');
const { langs } = require('./build.js');

// INIT APP
const app = express();
const port = process.env.PORT || 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');

// INIT Freemarker
const fm = new Freemarker();

// Grab this data once when server starts
const freemarkerBase = fs.readFileSync('./../assets/partial/freemarker.ftl').toString();
const links = fs.readFileSync('./../assets/partial/links.ftl').toString();

const proofs = [];
const data = JSON.parse(fs.readFileSync('./src/gamma/data.json'));

// loop through langs and pair with correct html file in build folder
langs.forEach(lang => {
  if (!lang) {
    throw new Error('Lang not found');
  }
  let contents = fs.readFileSync(`./build/Default.${lang}.html`).toString();
  let res = `${freemarkerBase}\n${links}\n${contents}`;
  proofs.push({ [lang]: { html: res } });
});

// define iframe viewport sizes
const iframe_sizes = {
  laptop: {
    width: '1280',
    height: '718'
  },
  tablet: {
    width: '768',
    height: '1729'
  },
  tablet_landscape: {
    width: '1280',
    height: '1729'
  },
  phone: {
    width: '337',
    height: '3000'
  },
  phone_landscape: {
    width: '568',
    height: '3000'
  }
}

app.get('/:language/:id', (req, res) => {

  // prep proofs by passing through FM renderer
  const obj = proofs.filter(obj => { return obj.hasOwnProperty(`${req.params.language}`) });

  // set next_user back to first recipient when next button is clicked while viewing proof on last recipient
  let next_user = data.indexOf(data[parseInt(req.params.id) + 1]) !== -1 ? parseInt(req.params.id) + 1 : 0;

  // set previous_user back to first recipient when previous button is clicked while viewing proof on first recipient
  let previous_user = parseInt(req.params.id) > 1 ? parseInt(req.params.id) - 1 : 0;

  // log the current user and language being viewed on GET route to console
  console.log('Currently viewing recipient', parseInt(req.params.id) + 1, `for ${req.params.language}`);

  // pass through FM renderer and send results back to page
  fm.render(obj[0][req.params.language].html, data[req.params.id], (err, results) => {
    if (err) {
      throw new Error(err);
    }

    // define proof UI
    let UI =
      `
      <div align="center" style="padding:15px 0; background: #F2F2F2;">
        <div style="display:inline-block; margin: 0 15px;">
          <select name="views" id="views">
            <option value="HTML">HTML</option>
            <option value="Plain Text">Plain Text</option>
            <option value="Landing Page">Landing Page</option>
          </select>
        </div>
        <div style="display:inline-block; margin: 0 15px;">
          <select name="device-views" id="device-views">
            <option value="Laptop">Laptop</option>
            <option value="Tablet">Tablet</option>
            <option value="Tablet (Landscape)">Tablet (Landscape)</option>
            <option value="Phone">Phone</option>
            <option value="Phone (Landscape)">Phone (Landscape)</option>
          </select>
        </div>
        <div style="display:inline-block; margin: 0 15px;">
          <select name="langs" id="langs">
            <option value="TBD">Respect language preference</option>
          </select>
        </div>
        <div style="display:inline-block;margin: 0 15px;">
          <span style="font-size: 12px;margin-right: 15px;">Recipient: ${parseInt(req.params.id) + 1}</span>
          <button style="padding: 2px 8px;" onclick=location.href='http://localhost:${port}/${req.params.language}/${previous_user}';><strong>&lsaquo;</strong></button>
          <button style="padding: 2px 8px;" onclick=location.href='http://localhost:${port}/${req.params.language}/${next_user}';><strong>&rsaquo;</strong></button>
        </div>
      </div>
    `;

    // for ejs - need to send ${results}, viewport sizes, and button functionality to views page

    res.send(UI + results);

  });

});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}/en-us/0`));