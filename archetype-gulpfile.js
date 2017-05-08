"use strict";

const $$ = require("shelljs");
const Path = require("path");
const archetype = require("./config/archetype");
const gulpHelper = archetype.devRequire("electrode-gulp-helper");
const exec = gulpHelper.exec;

function setupPath() {
  const nmBin = "node_modules/.bin";
  gulpHelper.envPath.addToFront(Path.resolve(nmBin));
  gulpHelper.envPath.addToFront(Path.join(archetype.devPath, nmBin));
  gulpHelper.envPath.addToFront(Path.join(__dirname, nmBin));
}

function setProductionEnv() {
  process.env.NODE_ENV = "production";
}

function checkFrontendCov(minimum) {
  if (typeof minimum === "string") {
    minimum += ".";
  } else {
    minimum = "";
  }

  return exec(`istanbul check-coverage 'coverage/client/*/coverage.json' --config=${__dirname}/config/istanbul/.istanbul.${minimum}yml`);
}

const tasks = {
  // env setup common tasks
  "~production-env": () => setProductionEnv(),

  // code build/compile tasks
  "build": ["clean-dist", "build-lib", "build-dist"],
  "build-dist": ["build-dist-min", "build-lib:clean-tmp"],
  "build-dist-min": {
    dep: ["~production-env"],
    desc: "Build minified dist files for production",
    task: () => exec(`webpack --config ${__dirname}/config/webpack/webpack.config.js --colors`)
  },
  "build-lib": {
    dep: ["~production-env"],
    task: ["clean-lib", "babel-src-step", "build-lib:flatten-l10n", "build-lib:copy-flow", "build-lib:clean-tmp"]
  },
  "babel-src-step": () => exec(`babel src -d lib`),
  "build-lib:clean-tmp": () => $$.rm("-rf", "./tmp"),
  "build-lib:copy-flow": () => exec(`node ${__dirname}/scripts/copy-as-flow-declaration.js`),
  "build-lib:flatten-l10n": () => exec(`node ${__dirname}/scripts/l10n/flatten-messages.js`),

  "archetype:check": ["archetype:test-dev-pkg", "clean-test-init", "archetype:test-init", "archetype:test-init-pkg", "clean-test-init"],
  "archetype:test-dev-pkg": () => exec(`pjv -f dev/package.json`),
  "archetype:test-init": () => exec(`yo electrode-component --projectName=test-init --packageName=test-init --packageGitHubOrg=walmartlabs --developerName="Arpan Nanavati" --ghUser=ananavati --ghRepo=test-init --createDirectory=Y`),
  "archetype:test-init-pkg": "pjv -f test-init/package.json",

  "check": ["check-dep", "lint", "test-cov", "build-lib:clean-tmp"],
  "check-ci": ["check-dep", "lint", "test-ci", "build-lib:clean-tmp"],
  "check-cov": ["lint", "test-cov"],
  "check-dep": () => exec(`ecd -f package.json --cf ${__dirname}/config/dependencies/check.json -w`),
  "check-dev": ["lint", "test-dev"],

  "clean": ["clean-lib", "clean-dist"],
  "clean-dist": () => $$.rm("-rf", "dist"),
  "clean-lib": () => $$.rm("-rf", "lib"),
  "clean-test-init": () => $$.rm("-rf", "test-init"),

  "cov-frontend": () => checkFrontendCov(),
  "cov-frontend-50": () => checkFrontendCov("50"),
  "cov-frontend-70": () => checkFrontendCov("70"),
  "cov-frontend-85": () => checkFrontendCov("85"),
  "cov-frontend-95": () => checkFrontendCov("95"),

  "lint": ["lint-react-src", "lint-react-test", "lint-scripts"],
  "lint-react-src": () => exec(`eslint --ext .js,.jsx -c ${__dirname}/config/eslint/.eslintrc-react src --color`),
  "lint-react-test": () => exec(`eslint --ext .js,.jsx -c ${__dirname}/config/eslint/.eslintrc-react-test test/client --color`),
  "lint-scripts": () => exec(`eslint --ext .js -c ${__dirname}/config/eslint/.eslintrc-base scripts --color`),

  "npm:prepublish": ["build-lib", "build-dist-min"],

  "server-test": () => exec(`webpack-dev-server --port 3001 --config ${__dirname}/config/webpack/webpack.config.test.js --colors`),

  "test-ci": ["test-frontend-ci"],
  "test-cov": ["test-frontend-cov"],
  "test-dev": ["test-frontend-dev"],
  "test-watch": ["test-frontend-dev-watch"],
  "concurrent-test-watch": ["hot", "test-frontend-dev-watch"],
  "test-frontend": () => exec(`karma start ${__dirname}/config/karma/karma.conf.js --colors`),
  "test-frontend-ci": () => exec(`karma start --browsers PhantomJS,Firefox ${__dirname}/config/karma/karma.conf.coverage.js --colors`),
  "test-frontend-cov": () => exec(`karma start ${__dirname}/config/karma/karma.conf.coverage.js --colors`),
  "test-frontend-dev": () => exec(`karma start ${__dirname}/config/karma/karma.conf.dev.js --colors`),
  "test-frontend-dev-watch": () => exec(`karma start ${__dirname}/config/karma/karma.conf.watch.js --colors --browsers Chrome --no-single-run --auto-watch`)
};

module.exports = function (componentTasks, gulp) {
  setupPath();
  gulpHelper.loadTasks(Object.assign(tasks, componentTasks), gulp || require("gulp"));
};
