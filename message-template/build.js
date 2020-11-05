/**
 * import dependencies
 * @ nunjucks - templating engine
 * @ fs - file system to write nunjucks rendered html to file
 * @ dotenv - always INIT first to allow usage of process.env variables
 */
require('dotenv').config();
const Nunjucks = require('nunjucks');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const csv = require('csvtojson');

/**
 * @ nunjucks.configure - set parent directory for nunjucks engine
 * @ fs.readdir - get all copy files directory
 * @ copyDirPath - file path to the copies directory
 */
const env = Nunjucks.configure(path.resolve(__dirname, './..'), { autoescape: false, trimBlocks: true, lstripBlocks: true });
// const jsonDirPath = path.resolve(__dirname, './src/copy/json');
const yamlDirPath = path.resolve(__dirname, './src/copy/yaml');

/**
 * Custom Filters that are not shipped by default with Nunjucks
 * @ ptHandler - strips HTML and converts to plain-text format
 * @ splitHandler - clone of EPT copy |split() function
 */
const ptHandler = function (str, preserveLineBreaks) {
  let testUrl, temp1, temp2, cleanurl, pt_cleanurl, mystr = "";

  let superscripts = ['&sup1;', '&sup2;', '&sup3;', '&#8308;', '&#8309', '&#8310', '&#8311', '&#8312', '&#8313'];

  let sup_test = ``;

  superscripts.forEach(sup => {
    let r = new RegExp(`${sup}`, 'gi')
    let sup_id = superscripts.indexOf(sup) + 1;
    let rp = `(${sup_id})`;
    sup_test += `.replace(${r}, ${JSON.stringify(rp)})`;
  })

  if (sup_test !== '') {
    mystr = eval(`${JSON.stringify(str)}${sup_test}`);
  }

  if (preserveLineBreaks) {
    mystr = mystr.replace(/<br \/>/g, "\r\n").replace(/\&nbsp\;/g, " ").replace(/\&#xfeff\;/g, "");
  } else {
    mystr = mystr.replace(/<br \/>/g, "").replace(/\&nbsp\;/g, " ").replace(/\&#xfeff\;/g, "");
  }

  testUrl = mystr.match(/\bhref=.*?>/i);
  let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/gi;

  if (testUrl == null) { return mystr.replace(tags, "") }

  for (i = 0; i < 15; i++) {
    testUrl = mystr.match(/\bhref=.*?>/i);

    if (testUrl == null) { break; }

    cleanurl = testUrl.toString()
      .replace(/\'/gi, '"')
      .replace(/href=\"/i, "")
      .replace(/style=.*?>/i, "")
      .replace(/class=.*?>/i, "")
      .replace(/\">/i, "")
      .replace(/\"/i, "")
      .trim()
      ;
    // Empty links exceptions
    if (cleanurl != "#")
      pt_cleanurl = " <" + cleanurl + ">";
    else
      pt_cleanurl = "";

    temp1 = mystr.replace(/<a\b[^>]*>/i, "");
    temp2 = temp1.replace(/<\/a>/i, pt_cleanurl);

    mystr = temp2;
  }
  // Protect freemarker
  let temp3 = temp2.replace(/<\$\{/gi, "~%").replace(/\}>/gi, "%~").replace(/<#/gi, "~\!").replace(/<\/#/gi, "\!~").replace(/<\@/gi, "q!");

  // Protect <http
  temp3 = temp3.replace(/<http/gi, "~^");

  // Strip HTML Tags;
  let temp4 = temp3.replace(/<[^>]*>/gi, '');;

  // Restore protected freemarker and http
  let temp5 = temp4.replace(/~%/gi, "<${").replace(/%~/gi, "}>").replace(/\~\!/gi, "<#").replace(/\!~/gi, "</#").replace(/~\^/gi, "<http").replace(/q!/gi, "<\@");

  return temp5.replace(/track\(/gi, 'track("');

};

const orphanHandler = function (str) {
  if (!str) {
    // Skip the filter, if copy is null or not found in any .yml file
    return str;
  }

  if (str.toLowerCase().indexOf("nbsp") !== -1) {
    // Skip the filter, user switched to manual mode
    return str.replace(/’/gi, "\'");
  }

  var temp1 = str.replace(/ ([^ ]*\.)/gi, '&nbsp;$1');
  var temp3 = temp1.replace(/ ([^ ]*\:)/gi, '&nbsp;$1');

  if (temp3.toLowerCase().indexOf("nbsp") === -1) {
    var temp5 = temp3.replace(/ ([^ ]*)$/, '&nbsp;$1');
  } else {
    var temp5 = temp3;
  }

  return temp5.replace(/’/gi, "\'");
};

const slFixHandler = function (str, seperator) {
  return str.replace(/\r?\n|\r/g, "").replace(/\t/g, "");
}

const splitHandler = function (str, seperator) {
  return str.split(seperator);
}

// add multi-line
env.addFilter('sl_fix', slFixHandler)

// add splitHandler
env.addFilter('split', splitHandler)

// add ptHandler
env.addFilter('plain_text', ptHandler);

// add orphanHandler
env.addFilter('fix_orphan', orphanHandler);

// read the development template data
const _HTML = fs.readFileSync(path.resolve(__dirname, './src/index.html')).toString();
const _LP = fs.readFileSync(path.resolve(__dirname, './src/landing.html')).toString();
const _PT = fs.readFileSync(path.resolve(__dirname, './src/plain.html')).toString();
const _AMP = fs.readFileSync(path.resolve(__dirname, './src/amp.html')).toString();

// LOCALIZED DATA
const copyData = [];
const localHTML = [];
const lpHTML = [];
const AMP = [];
const pt = [];
const langs = [];

// create breadcrumb
const tree = __dirname.split('/').slice(-2);
tree.splice(1, 0, 'tree/master');
const breadcrumb = {
  message: `${process.env.PROJECT_NAME}`,
  wo: `${process.env.WO}`,
  path: `${path.join('https://github.com/Hawkeye-Google-Email-Dev', tree.join('/'))}`
};
// convert data.csv to data.json - to be used in gulpfile
const csvFilePath = `./src/gamma/${process.env.DATA_FILE || 'data.csv'}`;

// data file parser function
const parse = async file => {
  let res;
  let recipient = 1;
  let blob = [];
  try {
    res = await csv().fromFile(file);
  } catch (e) {
    console.log(e.message);
  }
  res.forEach(x => {
    blob.push(x);
    recipient++;
  })
  fs.writeFileSync('./src/gamma/data.json', JSON.stringify(blob));
};

// call the function so data.json gets created before gulp tasks runs
parse(csvFilePath);

// handle default .less file if language specific .less file does not exist
const checkLess = stylesheet => {
  if (fs.existsSync(`./src/less/${stylesheet}.less`)) {
    return stylesheet + '.css';
  }
  return 'en-us.css';
}

// handle LP .less file if language specific .less file does not exist
const checkLessLP = stylesheet => {
  // check if local LP less exists if NOT then check for global LP less
  if (fs.existsSync(`./src/less/lp/${stylesheet}-lp.less`)) {
    return stylesheet + '-lp.css';
  } else if (fs.existsSync(`./../assets/less/lp/${stylesheet}-lp.less`)) {
    return stylesheet + '-lp.css';
  }
  // if no LP less found use the message less by default
  return 'en-us.css';
}

/**
 * converts the data object passed to the Nunjucks renderer into usable template variables
 * @ accepts 3 params:
 * @ {copyObj} - data that is parsed from .yml files
 * @ {lang} - language code
 * @ {creative} - type of creative(html, plaintext, landing_page, amp)
 */
const dataDump = (copyObj, lang, creative) => {
  let temp = {
    env: {
      language: {
        short_name: lang
      },
      content_type: creative,
      render: {
        gamma: false
      }
    }
  };
  for (const n in copyObj) {
    temp[n] = copyObj[n];
  }
  return temp;
};

// Stage data to build creative files
// const jsonFiles = [...fs.readdirSync(jsonDirPath)];
const yamlFiles = [...fs.readdirSync(yamlDirPath)];

// determine file type from .env
if (process.env.COPY_FILE_TYPE.toLowerCase() == 'json') {

  // JSON
  jsonFiles.forEach(file => {

    const jsonData = fs.readFileSync(`${jsonDirPath}/${file}`, 'utf8');
    const localCopy = JSON.parse(jsonData);

    // creates a language code for each yaml file found
    const langName = file.replace('.json', '');

    // push language codes @{langName} and copy object @{localCopy} to the appropriate array
    langs.push(langName);
    copyData.push(localCopy);

    // compile the creative data types: HTML @{html} - Landing page @{lpData} - Plain text @{textData} - AMP @{ampData}
    const html = Nunjucks.compile(_HTML, env).render(dataDump(localCopy, langName, 'email')).replace('styles.css', checkLess(langName));
    const lpData = Nunjucks.compile(_LP, env).render(dataDump(localCopy, langName, 'landing_page')).replace('styles.css', checkLessLP(langName));
    const textData = Nunjucks.compile(_PT, env).render(dataDump(localCopy, langName, 'plaintext'));
    const ampData = Nunjucks.compile(_AMP, env).render(dataDump(localCopy, langName, 'amp')).replace('styles.css', checkLess(langName));

    // push creative data: @{html} @{lpData} @{textData} @{ampData} to the appropriate array
    pt.push(textData);
    localHTML.push(html);
    lpHTML.push(lpData);
    AMP.push(ampData);

  });

  // export data to be used in gulpfile.js
  module.exports = { localHTML, lpHTML, pt, langs, AMP, breadcrumb };

} else if (process.env.COPY_FILE_TYPE.toLowerCase() == 'yaml') {

  // YAML
  yamlFiles.forEach(file => {

    const yamlData = fs.readFileSync(`${yamlDirPath}/${file}`, 'utf8');
    const localCopy = yaml.safeLoad(yamlData);

    // creates a language code for each yaml file found
    const langName = file.replace('.yml', '');

    // push language codes @{langName} and copy object @{localCopy} to the appropriate array
    langs.push(langName);
    copyData.push(localCopy);

    // compile the creative data types: HTML @{html} - Landing page @{lpData} - Plain text @{textData} - AMP @{ampData}
    const html = Nunjucks.compile(_HTML, env).render(dataDump(localCopy, langName, 'email')).replace('styles.css', checkLess(langName));
    const lpData = Nunjucks.compile(_LP, env).render(dataDump(localCopy, langName, 'landing_page')).replace('styles.css', checkLessLP(langName));
    const textData = Nunjucks.compile(_PT, env).render(dataDump(localCopy, langName, 'plaintext'));
    const ampData = Nunjucks.compile(_AMP, env).render(dataDump(localCopy, langName, 'amp')).replace('styles.css', checkLess(langName));

    // push creative data: @{html} @{lpData} @{textData} @{ampData} to the appropriate array
    pt.push(textData);
    localHTML.push(html);
    lpHTML.push(lpData);
    AMP.push(ampData);

  });

  // export data to be used in gulpfile.js
  module.exports = { localHTML, lpHTML, pt, langs, AMP, copyData, breadcrumb };

} else {

  // log error message if file type not provided
  console.log("PLEASE PROVIDE COPY FILE TYPE IN .ENV FILE");

}