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
        HTML: { start: '{{', end: '}}' }
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
        HTML: { start: '{{', end: '}}' }
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
  for (let i = 0; i < buildData.localHTML.length; i++) {
    // html
    fs.writeFile(`./src/stage/Default.${buildData.langs[i]}.html`, buildData.localHTML[i], err => {
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
gulp.task('json', async () => {
  const l10nDirPath = path.resolve(__dirname, './src/copy/l10n');
  for (let i = 0; i < buildData.localHTML.length; i++) {
    fs.writeFileSync(`${l10nDirPath}/${buildData.langs[i]}.json`, JSON.stringify(buildData.copyData[i], null, 2));
  }
});

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