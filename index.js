"use strict";

const deepEqual = require("deep-equal");

/**
 * @typedef Options
 *
 * @property {string} [base="BrowserStack"] The base launcher to which the
 * custom launcher applies.
 *
 * @property {string} [prefix=""] A prefix to apply to all the keys created by
 * ``getConfig``.
 *
 * @property {boolean} [mobile=false] Whether to include mobile devices. This is
 * a gross flag. If ``false`` no mobile devices are included, if ``true`` all
 * mobile devices are included.
 */

/**
 * @typedef Spec
 *
 * @property {null|"all"|string[]} [includes] Specifies the configurations to be
 * included. ``undefined``, ``null`` or ``"all"`` means "include all
 * configurations". Otherwise, it must be an array of strings listing each
 * configuration to include. ``includes`` applies before ``excludes``.
 *
 * @property {(string|RegExp)[]} [excludes] Specifies the configurations to be
 * excluded. ``RegExp`` values are tested against a configuration
 * name. ``includes`` applies before ``excludes``.
 */

class ConfigBuilder {
  /**
   * Create a configuration builder.
   *
   * @param {Options} options The options to use for the builder.
   */
  constructor(options = {}) {
    /**
     * The options for the constructor.
     * @type {Options}
     * @private
     */
    this.options = options;
    const base = options.base || "BrowserStack";
    const prefix = options.prefix || "";
    const { mobile } = options;

    /**
     * An object from which we get the configurations for getConfig.
     *
     * @private
     */
    this.configs = {
      __proto__: null,
      [`${prefix}ChromeWin`]: {
        base,
        browser: "Chrome",
        os: "Windows",
        os_version: "10",
      },
      [`${prefix}FirefoxWin`]: {
        base,
        browser: "Firefox",
        os: "Windows",
        os_version: "10",
      },
      [`${prefix}OperaWin`]: {
        base,
        browser: "Opera",
        os: "Windows",
        os_version: "8",
      },
      [`${prefix}Edge`]: {
        base,
        browser: "Edge",
        os: "Windows",
        os_version: "10",
      },
      [`${prefix}IE11`]: {
        base,
        browser: "IE",
        browser_version: "11",
        os: "Windows",
        os_version: "10",
      },
      [`${prefix}IE10`]: {
        base,
        browser: "IE",
        browser_version: "10",
        os: "Windows",
        os_version: "8",
      },
      [`${prefix}IE9`]: {
        base,
        browser: "IE",
        browser_version: "9",
        os: "Windows",
        os_version: "7",
      },
      [`${prefix}IE8`]: {
        base,
        browser: "IE",
        browser_version: "8",
        os: "Windows",
        os_version: "7",
      },
      [`${prefix}Safari12`]: {
        base,
        browser: "Safari",
        os: "OS X",
        os_version: "Mojave",
      },
      [`${prefix}Safari11`]: {
        base,
        browser: "Safari",
        os: "OS X",
        os_version: "High Sierra",
      },
      [`${prefix}Safari10`]: {
        base,
        browser: "Safari",
        os: "OS X",
        os_version: "Sierra",
      },
      [`${prefix}Safari9`]: {
        base,
        browser: "Safari",
        os: "OS X",
        os_version: "El Capitan",
      },
      ...(mobile ? {
        [`${prefix}Android4_4`]: {
          base,
          browser: "android",
          os: "android",
          device: "Samsung Galaxy Tab 4",
          os_version: "4.4",
          real_mobile: true,
        },
      } : {}),
    };
  }

  /**
   * @param {"all"|Spec} spec The specification that determines what
   * configurations to get.
   */
  getConfigs(spec) {
    if (typeof spec === "string") {
      if (spec === "all") {
        spec = {
          includes: "all",
        };
      }
      else {
        spec = {
          includes: [spec],
        };
      }
    }

    let { includes, excludes } = spec;
    if (includes == null || includes === "all") {
      includes = Object.keys(this.configs);
    }

    if (excludes == null) {
      excludes = [];
    }

    const ret = {};
    for (const name of includes) {
      const config = this.configs[name];
      if (!config) {
        throw new Error(`${name} is not an existing key`);
      }

      if (!excludes.some(exclude => (exclude instanceof RegExp ?
                                     exclude.test(name) :
                                     exclude === name))) {
        ret[name] = { ...config };
      }
    }

    return ret;
  }
}

exports.ConfigBuilder = ConfigBuilder;

/**
 * Look for duplicate entries. Throws if there's a duplicate.
 *
 * @param {Object} config The ``customLaunchers`` part of your Karma
 * configuration to check.
 */
function noDuplicates(config) {
  const prevConfigs = [];
  // eslint-disable-next-line guard-for-in
  for (const key in config) {
    const candidate = config[key];
    for (const prev of prevConfigs) {
      if (deepEqual(candidate, prev, { strict: true })) {
        throw new Error(`duplicate configuration at key: ${key}`);
      }
    }

    prevConfigs.push(candidate);
  }
}

function notEmpty(config) {
  if (Object.keys(config).length === 0) {
    throw new Error("empty configuration");
  }
}

/**
 * Run a series of checks over the ``customLaunchers`` part of your Karma
 * configuration. This will throw an error if any of the following checks fail:
 *
 * - Not empty: the configuration cannot be empty.
 *
 * - No duplicates: two entries in ``customLaunchers`` are not allowed to be
 *   deep-equal. The consequence of two deep-equal entries is that Karma will
 *   contact BrowserStack twice to run the test suite on the same browser twice,
 *   which is probably not what you want.
 *
 * @param {Object} config The ``customLaunchers`` part of your Karma
 * configuration to check.
 */
function lintConfig(config) {
  notEmpty(config);
  noDuplicates(config);
}

exports.lintConfig = lintConfig;
