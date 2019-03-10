"use strict";

const { expect } = require("chai");

const { ConfigBuilder, lintConfig } = require("..");

describe("ConfigBuilder", () => {
  describe("#constructor()", () => {
    it("constructs without options", () => {
      // eslint-disable-next-line no-new
      new ConfigBuilder();
    });

    it("constructs with options", () => {
      // eslint-disable-next-line no-new
      new ConfigBuilder({ base: "fnord" });
    });
  });

  // This does not include mobile devices.
  const allKeys = ["ChromeWin", "FirefoxWin",
                   "OperaWin", "Edge",
                   "IE11", "IE10", "IE9",
                   "IE8", "Safari12",
                   "Safari11",
                   "Safari10", "Safari9"];

  describe("getConfigs", () => {
    describe("on a builder with default options", () => {
      let builder;

      before(() => {
        builder = new ConfigBuilder();
      });

      describe("returns all configurations when called with", () => {
        it(" 'all'", () => {
          expect(builder.getConfigs("all")).to.have.keys(allKeys);
        });

        it("{ includes: undefined }", () => {
          expect(builder.getConfigs({ includes: undefined })).to.have
            .keys(allKeys);
        });

        it("{ includes: null }", () => {
          expect(builder.getConfigs({ includes: null })).to.have.keys(allKeys);
        });

        it("{ includes: 'all' }", () => {
          expect(builder.getConfigs({ includes: "all" })).to.have.keys(allKeys);
        });

        it("{ includes: ... all keys ... }", () => {
          expect(builder.getConfigs({ includes: allKeys })).to.have
            .keys(allKeys);
        });

        it("{ excludes: [] }", () => {
          expect(builder.getConfigs({ excludes: [] })).to.have.keys(allKeys);
        });

        it("{ excludes: [/@@DOESNOTMATCH@@/] }", () => {
          expect(builder.getConfigs({ excludes: [/@@DOESNOTMATCH@@/] }))
            .to.have.keys(allKeys);
        });
      });

      describe("returns an empty object when called with", () => {
        it("{ includes: [] }", () => {
          expect(builder.getConfigs({ includes: [] })).to.deep.equal({});
        });

        it("{ excludes: ...all keys... }", () => {
          expect(builder.getConfigs({ excludes: allKeys })).to.deep.equal({});
        });

        it("{ excludes: [/.*/] }", () => {
          expect(builder.getConfigs({ excludes: [/.*/] })).to.deep.equal({});
        });
      });

      it("returns configurations with the default base", () => {
        expect(builder.getConfigs({ includes: ["ChromeWin"] })).to.have
          .nested.property("ChromeWin.base").equal("BrowserStack");
      });

      describe("returns a ChromeWin configuration when called with", () => {
        it("{ includes: ['ChromeWin'] }", () => {
          expect(builder.getConfigs({ includes: ["ChromeWin"] }))
            .to.have.keys("ChromeWin");
        });

        it("{ excludes: ... all keys except 'ChromeWin' ... }", () => {
          const spec = { excludes: allKeys.filter(x => x !== "ChromeWin") };
          expect(builder.getConfigs(spec)).to.have.keys("ChromeWin");
        });
      });
    });

    describe("on a builder with custom base", () => {
      let builder;

      before(() => {
        builder = new ConfigBuilder({ base: "fnord" });
      });

      it("returns configurations with the custom base", () => {
        expect(builder.getConfigs({ includes: ["ChromeWin"] })).to.have
          .nested.property("ChromeWin.base").equal("fnord");
      });
    });

    describe("on a builder with custom prefix", () => {
      let builder;

      before(() => {
        builder = new ConfigBuilder({ prefix: "Custom" });
      });

      it("returns configurations with the CustomPrefix", () => {
        expect(builder.getConfigs("all")).to.have
          .keys(allKeys.map(x => `Custom${x}`));
      });
    });

    describe("on a builder with mobile on", () => {
      let builder;

      before(() => {
        builder = new ConfigBuilder({ mobile: true });
      });

      it("returns configurations with mobile devices", () => {
        expect(builder.getConfigs("all")).to.include.keys("Android4_4");
      });
    });
  });
});

describe("lintConfig()", () => {
  it("fails if the configuration is empty", () => {
    expect(() => lintConfig({})).to.throw(Error, "empty configuration");
  });

  it("fails on duplicate entry", () => {
    expect(() => lintConfig({
      a: {
        os: "Windows",
      },
      b: {
        os: "Windows",
      },
    })).to.throw(Error, "duplicate configuration at key: b");
  });
});
