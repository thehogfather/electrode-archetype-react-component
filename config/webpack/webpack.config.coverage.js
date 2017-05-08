"use strict";

/**
 * Webpack frontend test (w/ coverage) configuration.
 */
var testBaseProfile = require("./profile.base.test");
var generateConfig = require("./util/generate-config");
var Path = require("path");

function makeConfig() {
  const coverageProfile = {
    partials: {
      "_coverage": {
        order: 10100
      }
    }
  };

  const options = {
    profiles: {
      "_test-base": testBaseProfile,
      "_coverage": coverageProfile
    },
    profileNames: ["_test-base", "_coverage"],
    configFilename: Path.basename(__filename)
  };

  return generateConfig(options);
};

module.exports = makeConfig();
