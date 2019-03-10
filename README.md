This is a package that helps managing the configuration of BrowserStack browsers
in Karma.

In most of my ``karma.conf.js`` files, I end up with a section going:

```
customLaunchers: {
      ChromeWin: {
        base: "BrowserStack",
        browser: "Chrome",
        os: "Windows",
        os_version: "10",
      },
      FirefoxWin: {
        base: "BrowserStack",
        browser: "Firefox",
        os: "Windows",
        os_version: "10",
      },
      // ... lots of other browsers.
}
```

That's a lot of boilerplate. For one thing, most of the information there is not
stuff I need to revise often. It is also error-prone. I recently discovered I
had a setup for running opera in Windows twice in the same configuration. I had
``OperaWin`` and ``Opera``. They were far enough apart that the duplication was
not evident.

So I figured I could help reduce mistakes with a library I'd use from project to
project, and here we are. It is probably somewhat idiosyncratic. Note that this
library is meant to help with common usage scenarios. If you need to pass
unusual flags into a configuration sent to BrowserStack, you'll need add the
flags to the configuration produced by this library.

### ``ConfigBuilder``

The documentation here gives an overview of what can be done with this
library. For the gory details, read the jsdoc comments in the source code. They
are more likely to be up to date and give you all the details and gotchas than
the documentation here.

You get configurations from ``ConfigBuilder``. Here's an example of a fragment
of ``karma.conf.js`` that uses ``ConfigBuilder`` to get configurations for all
browsers known to this package, with the exception of IE browsers and Safari9:

```
const { ConfigBuilder } = require("karma-browserstack-config");

module.exports = function configure(config) {
  const customLaunchers = new ConfigBuilder().getConfigs({
    excludes: [/^IE/, "Safari9"],
  });

  config.set({
    customLaunchers
    ...
  });
};
```

You create a new builder with ``new ConfigBuilder()``. You can pass an object
with these options:

* ``base`` specifies a the value of the ``base`` field for all configurations
  produced.

* ``prefix`` adds a prefix in front of all the keys in the returned object.

* ``mobile`` when true requires that mobile devices be included in the list of
  configurations.

The ``getConfigs`` call returns an object ready to be used as
``customLaunchers``. This call takes an object with two fields:

* ``includes`` specifies configurations to include in the returned object. It
  can be the string "all" to include all or an array of strings.

* ``excludes`` specifies configurations to exclude. It is an array of strings or
  regular expressions.

It is also possible to just pass a the "all" string to include everything.

Examples:

* ``getConfigs("all")`` returns an object with all configurations.

* ``getConfigs({ excludes: [/^IE/] })`` excludes all IE configurations.

Here is the list of keys that are defined. If a key does not have a version
number then it runs the latest version of the browser.

* ``ChromeWin``
* ``FirefoxWin``
* ``OperaWin``
* ``Edge``
* ``IE11``, ``IE10``, ``IE9``, ``IE8``.
* ``Safari12``, ``Safari11``, ``Safari10``, ``Safari9`.

### ``lintConfig``

This package also provides a ``lintConfig`` function. You pass to it what you
want to put in your ``customLaunchers``. It will run checks on the configuration
and immediately throw if an error is encountered. It currently checks that:

* The configuration object is not empty.

* The configuration object does not contain duplicates. Duplication happens when
  you have two different keys with the same configuration parameters. "Same"
  here is determined by a deep-equal comparison. This check is motivated by a
  real mistake I had in one of my configurations, I had the keys ``OperaWin``
  and ``Opera`` which started the same browser. There was nothing in the
  pipeline that detected the duplication and the tests were run against the same
  browser twice. Big waste of resources.
