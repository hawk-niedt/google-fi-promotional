/**
 * import dependencies
 * @ gulp - task runner
 * @ premailer - Preflight for HTML and CSS
 * @ inlinerCSS - CSS inliner
 */
const gulp = require('gulp');
const inlineCss = require('gulp-inline-css');
const fs = require('fs');
const smoosher = require('gulp-smoosher');
const zipdir = require('zip-dir');
const path = require('path');
const buildData = require('./build.js');
const Freemarker = require('freemarker');
const less = require('gulp-less');
const yaml = require('js-yaml');

// Placeholder GAMMA functions and env variables
const fm = new Freemarker();

// Freemarker handler
const renderData = (nj, data, filePath) => {
  fm.render(nj, data, (err, result) => {
    if (err) {
      console.log(Error(err));
    }
    fs.writeFile(filePath, result, err => {
      return err
        ? console.log(`Error rendering freemarker: See exception (${err})`)
        : true;
    });
  });
}

/**
 * set build tasks
 * @ less - compiles all less files based on lang names
 * @ build-html - compiles a final version of index.html from ./src/stage/ and outputs it into ./src/build
 * @ build-pt - same as build-html but for .txt files
 */
gulp.task('less', function () {
  return gulp.src('./src/less/!(*base_styles).less')
    .pipe(less())
    .pipe(gulp.dest('./src/stage/'));
});

gulp.task('less-lp', function () {
  let r = fs.readdirSync('./src/less/lp').filter(f => {
    return /\.less$/.test(f);
  });
  // first check if local LP LESS exists
  if (r.length > 0) {
    return gulp.src('./src/less/lp/!(*base_styles).less')
      .pipe(less())
      .pipe(gulp.dest('./src/stage/'));
  }
  // if no local LP LESS found use global LP LESS instead
  return gulp.src('./../assets/less/lp/!(*base_styles).less')
    .pipe(less())
    .pipe(gulp.dest('./src/stage/'));
});

gulp.task('build-html', () => {
  return gulp
    .src('./src/stage/!(*.amp).html')
    .pipe(smoosher())
    .pipe(inlineCss({
      preserveMediaQueries: true,
      applyWidthAttributes: true,
      applyTableAttributes: true,
      codeBlocks: {
        FM1: { start: '<#', end: '>' },
        FM2: { start: '</#', end: '>' },
        FM3: { start: '<#', end: '/>' },
        HTML: { start: '{{', end: '}}' },
        HTML2: { start: '<@', end: '/>' }
      }
    }))
    .pipe(gulp.dest('./build'));
});

gulp.task('build-pt', () => {
  return gulp
    .src('./src/stage/*.txt')
    .pipe(gulp.dest('./build/'));
});

gulp.task('build-html-preview', () => {
  return gulp
    .src('./src/stage/!(*.amp).html')
    .pipe(smoosher())
    .pipe(inlineCss({
      preserveMediaQueries: true,
      applyWidthAttributes: true,
      applyTableAttributes: true,
      codeBlocks: {
        FM1: { start: '<#', end: '>' },
        FM2: { start: '</#', end: '>' },
        FM3: { start: '<#', end: '/>' },
        HTML: { start: '{{', end: '}}' },
        HTML2: { start: '<@', end: '/>' }
      }
    }))
    .pipe(gulp.dest('./proof/'));
});

gulp.task('build-pt-preview', () => {
  return gulp
    .src('./src/stage/*.txt')
    .pipe(gulp.dest('./proof/'));
});


gulp.task('build-amp-preview', () => {
  return gulp
    .src('./src/stage/*.amp.html')
    .pipe(smoosher({
      cssTags: {
        begin: '<style amp-custom>',
        end: '</style>'
      }
    }))
    .pipe(gulp.dest('./proof/'));
});

gulp.task('build-amp', () => {
  return gulp
    .src('./src/stage/*.amp')
    .pipe(smoosher({
      cssTags: {
        begin: '<style amp-custom>',
        end: '</style>'
      }
    }))
    .pipe(gulp.dest('./build/'));
});


/**
 * set freemarker render task
 * @ render-fm - loops through all files in staging folder and filter out html files excluding LPs
 */
gulp.task('render-fm', async () => {

  // expose placeholder track and optout functions to template when render-fm is called
  const freemarkerBase = await fs.readFileSync('./../assets/partial/freemarker.ftl').toString();

  // import data.json contents
  const data = JSON.parse(await fs.readFileSync('./src/gamma/data.json').toString())[0];

  for (let i = 0; i < buildData.localHTML.length; i++) {
    // html
    renderData(`${freemarkerBase}\n${buildData.localHTML[i]}`, data, `./src/stage/Default.${buildData.langs[i]}.html`);
    // landing page
    renderData(`${freemarkerBase}\n${buildData.lpHTML[i]}`, data, `./src/stage/Default.${buildData.langs[i]}.lp.html`);
    // plain text
    renderData(`${freemarkerBase}\n${buildData.pt[i]}`, data, `./src/stage/Default.${buildData.langs[i]}.txt`)
  }
});

/**
 * set create dist folder task
 * @ create-dist - loops through all files in staging folder and filter out html files excluding LPs
 */
gulp.task('render-nofm', async () => {
  // grab breadcrumb
  const trail = `<#--
  message : ${buildData.breadcrumb.message}
  WO : ${buildData.breadcrumb.wo}
  github_path : ${buildData.breadcrumb.path}
-->`;

  for (let i = 0; i < buildData.localHTML.length; i++) {
    // html
    fs.writeFile(`./src/stage/Default.${buildData.langs[i]}.html`, `${trail}\n\n${buildData.localHTML[i]}`, err => {
      return err
        ? console.log(`Error saving file: See exception (${err.message})`)
        : true;
    });
    // landing page
    fs.writeFile(`./src/stage/Default.${buildData.langs[i]}.lp.html`, buildData.lpHTML[i], err => {
      return err
        ? console.log(`Error saving file: See exception (${err.message})`)
        : true;
    });
    // plain text
    fs.writeFile(`./src/stage/Default.${buildData.langs[i]}.txt`, buildData.pt[i], err => {
      return err
        ? console.log(`Error saving file: See exception (${err.message})`)
        : true;
    });
  }
})

gulp.task('render-amp', async () => {
  // expose placeholder track and optout functions to template when render-fm is called
  const freemarkerBase = await fs.readFileSync('./../assets/partial/freemarker.ftl').toString();

  // import data.json contents
  const data = JSON.parse(await fs.readFileSync('./src/gamma/data.json').toString())[0];

  for (let i = 0; i < buildData.AMP.length; i++) {
    // AMP
    renderData(`${freemarkerBase}\n${buildData.AMP[i]}`, data, `./src/stage/Default.${buildData.langs[i]}.amp.html`);
  }
});

gulp.task('render-amp-nofm', async () => {
  for (let i = 0; i < buildData.localHTML.length; i++) {
    // AMP
    fs.writeFile(`./src/stage/Default.${buildData.langs[i]}.amp`, buildData.AMP[i], err => {
      return err
        ? console.log(`Error saving file: See exception (${err.message})`)
        : true;
    });
  }
})

/**
 * Setup the export folder
 * @ usage, setup in project .env folder: 
 * @ Options are: "html,pt" or "html,pt,amp" or leave blank for [html,pt,lp]
 * @ excute; npm run export --> outputs an archive.zip file to the working directory
 */
gulp.task('export', async () => {
  var zipname = `${process.env.PROJECT_NAME || 'archive'}.zip`;

  if (`${process.env.EXPORT}` == "html,pt" || `${process.env.EXPORT}` == "html,pt,amp") {
    zipdir('./build', { saveTo: './' + zipname, filter: (path, stat) => !/\lp.html$/.test(path) }, function (err, buffer) {
      // this will export HTML and PT only
      // And the buffer was saved to `~/archive.zip`
    });
  }

  if (`${process.env.EXPORT}` == "html,pt,lp" || `${process.env.EXPORT}` == "") {
    zipdir('./build', { saveTo: './' + zipname }, function (err, buffer) {
      // this will export HTML, PT and LP
      // And the buffer was saved to `~/archive.zip`
    });
  }

});

// Creates a json version to export and submit for l10n requests
// gulp.task('json', async () => {
//   const l10nDirPath = path.resolve(__dirname, './src/copy/l10n');
//   for (let i = 0; i < buildData.localHTML.length; i++) {
//     fs.writeFileSync(`${l10nDirPath}/${buildData.langs[i]}.json`, JSON.stringify(buildData.copyData[i], null, 2));
//   }
// });

// Nader: Clear the build folder before running BUILD command
gulp.task('clear-build', async function () {
  const folders = [
    './build',
    './proof',
    './src/stage'
  ];
  await folders.forEach(d => {
    if (fs.existsSync(d)) {
      fs.readdir(d, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          fs.unlink(path.join(d, file), err => {
            if (err) throw err;
          });
        }
      });
    }
  });
});
// END Nader

/**
 * Convert yaml files to polyglot json(chrome) files
 */
gulp.task('create-json', async () => {

  // define html elements that will be used as placeholders
  const elem_placeholders = {
    html_line_break: '<br />',
    html_br: '<br/>',
    html_cr: '<br>',
    html_strong: '<strong',
    html_strong_end: '</strong>',
    html_span: '<span',
    html_span_end: '</span>',
    html_a: '<a',
    html_a_end: '</a>',
    html_img: '<img',
    html_email_address: '<goog',
    html_fm_if: '<#if',
    html_fm_el: '<#else>',
    html_fm_elif: '<#elseif',
    html_fm_end: '</#',
    html_fm_macro: '<@',
    html_fm_email: '${EmailAddress',
    html_fm_name: '${FirstName',
    html_fm_now: '${.now'
  }

  let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>|<#\/?([a-z][a-z0-9]*)\b[^>]*>|<\/#\/?([a-z][a-z0-9]*)\b[^>]*>|\${\/?([a-z][a-z0-9?_-]*)}|\${\.\/?([a-z][a-z0-9\?a-z('\(\)]*)}|<@\/?([a-z][a-z0-9-_]*)\b[^>]*\/>|\$\/?([0-9]*)\b|<!--[\s\S]*?-->/gi;
  //og /<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/gi
  //fm logic <#\/?([a-z][a-z0-9]*)\b[^>]*>|<\/#\/?([a-z][a-z0-9]*)\b[^>]*>
  //money \$\/?([0-9]*)\b 
  //fm signals \${\/?([a-z][a-z0-9]*)}
  //fm chaining signal \${\/?([a-z][a-z0-9?_-]*)}
  //nowstring \${\.\/?([a-z][a-z0-9\?a-z('\(\)]*)}
  //fm macro calls <@\/?([a-z][a-z0-9-_]*)\b[^>]*\/>

  // read yaml data
  const yamlFiles = [...fs.readdirSync(`./src/copy/yaml`)];
  console.log('*** \n***\n CONVERTING THE FOLLOWING FILES:\n', yamlFiles, '\n***\n***');

  yamlFiles.forEach(y => {
    let id = 1;

    let j = 0;

    let yml = yaml.safeLoad(fs.readFileSync(`./src/copy/yaml/${y}`, 'utf8'));

    let keys = Object.keys(yml);
    let copies = Object.values(yml);
    let parsed_copies = [];
    let temp = {};

    copies.forEach(c => {
      if (Array.isArray(c)) {
        c = c.join('[=]');
        parsed_copies.push(c);
      } else {
        parsed_copies.push(c);
      }
    })

    function newCopy(copy) {
      let newCopy = `${copy}`;
      let matches = [];
      let data = [];
      let f;
      let o = {};
      let id = 1;

      let ev = ``;
      let regex = ``;
      let replacer = '';

      if (copy.match(tags) === null) { return { message: copy.replace(/\$\{/gi, '{{').replace(/\}/gi, '}}') } };
      copy.match(tags).forEach(el => {
        matches.push(el);
      })
      // console.log(matches);
      matches.forEach(e => {
        if (copy.includes(e)) {
          if (/\$\/?([0-9]*)\b/i.test(e)) {
            let arr = [];
            arr.push(`product_price_${e.replace('$', '')}`)
            arr.push(e);
            data.push(arr);
          }
          for (let i in elem_placeholders) {
            if (e.includes(elem_placeholders[i])) {
              let arr = [];
              if (i.includes('_macro')) {
                //console.log('macro detected')
                let g = e.replace(/(?<=\s).*/i, '').replace('<@', '').replace(' ', '');
                let renamed = i.replace(i, g.toLowerCase())
                arr.push(renamed);
                arr.push(e);
                data.push(arr);
              } else {
                arr.push(i);
                arr.push(e);
                data.push(arr);
              }
            }
          }
        }
      })

      data.forEach(d => {
        //console.log(d)
        let x = ``;
        if (!o[`${d[0]}`]) {

          x = d[0].replace(/_/i, `_${id}_`);

        }
        if (d[0].replace(/_/i, `_${id}_`).includes('_end') && !o[`${d[0].replace(/_/i, `_${id}_`)}`]) {

          x = d[0].replace(/_/i, `_${id++}_`);

        }

        o[`${x}`] = { content: `${d[1]}` }

        f = o;


        //console.log('x:', x)
        regex = `(${d[1].replace(/\$/gi, '\\$').replace(/\?/gi, '\\?').replace(/\(/gi, '\\(').replace(/\)/gi, '\\)')})`;
        replacer = `$${x}$`;
        let r = new RegExp(regex, 'i');
        ev += `.replace(${r}, ${JSON.stringify(replacer)})`;
        //console.log(r)
      })

      newCopy = eval(`${JSON.stringify(newCopy)}${ev}`);

      return { message: newCopy.replace(/\$\{/gi, '{{').replace(/\}/gi, '}}'), placeholders: f };
    }

    keys.forEach(k => {
      if (parsed_copies[j] == undefined) { return; }
      temp[`${k}`] = newCopy(parsed_copies[j]);
      //temp[`${k}`].placeholders = o;
      j++;
    })

    fs.writeFile(`./src/copy/l10n/exports/${y.replace('.yml', '')}.json`, JSON.stringify(temp), () => { })
  })

  console.log('YAML to JSON ===> SUCCESS! Check EXPORTS folder')
});

/**
 * Convert polyglot json(chrome) files to yaml files
 */
gulp.task('create-yaml', async () => {
  // read json data
  const jsonFiles = [...fs.readdirSync(`./src/copy/l10n/translated-json`)].filter(jsf => jsf !== '.gitkeep' && jsf !== '.DS_Store');
  console.log('*** \n***\n CONVERTING THE FOLLOWING FILES:\n', jsonFiles, '\n***\n***');

  jsonFiles.forEach(js => {

    let incoming = JSON.parse(fs.readFileSync(`./src/copy/l10n/translated-json/${js}`, 'utf8'));

    let g = /\$/gi;

    // console.log(incoming)


    let messages = [];
    let phs = [];
    let keys = [];
    let converted = {};

    for (let i in incoming) {
      let msg = incoming[i];
      let x = ``;
      let o = {};


      // have to build the giant regex


      if (!incoming[i].placeholders) {
        o[`${i}`] = {};
        o[`${i}`].message = incoming[i].message;
        o[`${i}`].placeholders = undefined;
        msg.placeholders = undefined;
        messages.push(o);
      } else {
        //let ph = new RegExp(Object.keys(incoming[i].placeholders)[0].replace(g, '\\$'), 'gi');
        // for (let key in incoming[i].placeholders) {
        //   keys.push(key);
        // }
        o[`${i}`] = {};
        o[`${i}`].message = incoming[i].message;
        o[`${i}`].placeholders = incoming[i].placeholders;
        messages.push(o);
      }

      // regex = `(${ph})`;
      // replacer = `${x}`;
      // let r = new RegExp(regex, 'i');
      // ev += `.replace(${r}, '${replacer}')`;

    }

    messages.forEach(m => {
      // if (m.placeholders === undefined) {
      //   converted[`${m}`] = m.message;
      // }
      if (m[`${Object.keys(m)[0]}`].placeholders === undefined) {
        //console.log(m[`${Object.keys(m)[0]}`])
        let clean = m[`${Object.keys(m)[0]}`].message;
        clean = clean.replace(/\{\{/gi, '${').replace(/\}\}/gi, '}');
        if (clean.includes('[=]')) {
          clean = clean.split('[=]');
        }
        converted[`${Object.keys(m)[0]}`] = clean;
      } else {
        let c = ``;
        let ev = ``;
        let te = m[`${Object.keys(m)[0]}`].message;
        let k = Object.keys(m[`${Object.keys(m)[0]}`].placeholders)[0].replace(g, '\\$');
        let tph = {};
        Object.keys(m[`${Object.keys(m)[0]}`].placeholders).forEach(ke => {
          tph[`${ke}`] = m[`${Object.keys(m)[0]}`].placeholders[`${ke}`].content;
        })
        for (let b in tph) {
          let replacer = `${tph[b]}`;
          let regex = '\\$' + b + '\\$';
          let r = new RegExp(regex, 'gi');
          ev += `.replace(${r}, ${JSON.stringify(replacer)})`;
          //console.log(r)
        }

        c = eval(`${JSON.stringify(te)}${ev}`);

        c = c.replace(/\{\{/gi, '${').replace(/\}\}/gi, '}');

        if (c.includes('[=]')) {
          c = c.split('[=]');
        }

        converted[`${Object.keys(m)[0]}`] = c;
        // console.log('ph: ', tph)
        // converted[`${Object.keys(m)[0]}`] = m[Object.keys(m)[0]];
      }

      fs.writeFile(`./src/copy/l10n/translated-yaml/${js.replace('.json', '')}.yml`, yaml.safeDump(converted).replace(/\\_/gi, '&nbsp;'), () => { })
    })
  })

  console.log('JSON to YAML ===> SUCCESS! Check TRANSLATED-YAML folder')
});

/**
 * Convert arb (EPT) files to yaml files
 */
gulp.task('convert-arb', async () => {

  // check for arb files in arb folder
  const arbs = [...fs.readdirSync(`./src/copy/l10n/arb`)].filter(arb => arb !== '.gitkeep');

  // for each file found, parse out keys without meta data and null values and convert to yaml obj
  arbs.forEach(f => {

    const arb = JSON.parse(fs.readFileSync(`./src/copy/l10n/arb/${f}`, 'utf8'));

    let keys = [];

    let copy_vars = [];

    let data = [];

    let copy_obj = {};

    for (let k in arb) {
      if (!/@@/i.test(k)) {
        keys.push(k)
      }
    }

    keys.forEach(key => {
      if (/@\/?([a-z_][A-Z_]*)/i.test(key)) {
        copy_vars.push(key);
      }
    })

    copy_vars.forEach(v => {
      for (let copy in arb) {
        if (copy.includes(v) && arb[v].source_text !== null) {
          let pair = [];
          pair.push(v.replace('@', ''))
          pair.push(arb[v].source_text)
          data.push(pair);
        }
      }
    })

    data.forEach(p => {
      if (p[1].includes('[=]')) {
        copy_obj[`${p[0]}`] = p[1].split('[=]');
      } else {
        copy_obj[`${p[0]}`] = p[1];
      }
    })


    fs.writeFile(`./src/copy/l10n/ept-yaml/${f.replace('.arb', '')}.yml`, yaml.safeDump(copy_obj, { lineWidth: 120 }).replace(/\\_/gi, '&nbsp;'), () => { })

  })

  console.log('ARB to YAML ===> SUCCESS! Check EPT-YAML folder')
})