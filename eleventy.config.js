import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Префикс пути для GitHub Pages (/aisen-studio/). На своём домене будет "/".
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // /en/work/ -> /ru/work/
  eleventyConfig.addFilter("swapLang", (url, to) =>
    (url || "/").replace(/^\/(en|ru|es)\//, `/${to}/`)
  );

  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
  };
}
