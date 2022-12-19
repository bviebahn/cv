const fs = require("fs");

const PAGE_TEMPLATE = fs.readFileSync(`${__dirname}/template.html`, "utf8");

function translateTemplate(
  lang,
  template = PAGE_TEMPLATE,
  translations = JSON.parse(
    fs.readFileSync(`${__dirname}/translations/${lang}.json`, "utf8")
  )
) {
  let translatedTemplate = template;
  const regexp = /\${{(.+?)}}/gm;
  let match = regexp.exec(translatedTemplate);

  const asset = (path, args) => {
    return translateTemplate(
      lang,
      fs.readFileSync(`${__dirname}/assets/${path}`, "utf8"),
      {
        ...translations,
        args,
      }
    );
  };

  while (match !== null) {
    const [_, expression] = match;
    const { index } = match;

    const expressionValue = new Function(`return ${expression}`).bind({
      lang,
      asset,
      ...translations,
    })();

    translatedTemplate = `${translatedTemplate.substring(
      0,
      index
    )}${expressionValue}${translatedTemplate.substring(
      index + expression.length + "${{}}".length
    )}`;

    regexp.lastIndex = index;
    match = regexp.exec(translatedTemplate);
  }

  return translatedTemplate;
}

function build(lang) {
  const path = lang === "en" ? "/" : `/${lang}`;
  fs.writeFileSync(`${__dirname}${path}/index.html`, translateTemplate(lang));
}

["en", "de"].forEach(build);
