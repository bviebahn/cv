const fs = require("fs");

const template = fs.readFileSync(`${__dirname}/template.html`, {
  encoding: "utf8",
});

function translateTemplate(lang) {
  const translations = JSON.parse(
    fs.readFileSync(`${__dirname}/translations/${lang}.json`, {
      encoding: "utf8",
    })
  );

  let translatedTemplate = template;
  const regexp = /\${(.+?)}/gm;
  let match = regexp.exec(translatedTemplate);
  while (match !== null) {
    const [_, expression] = match;
    const { index } = match;
    const expressionValue = new Function(`return ${expression}`).bind({
      lang,
      ...translations,
    })();
    translatedTemplate = `${translatedTemplate.substring(
      0,
      index
    )}${expressionValue}${translatedTemplate.substring(
      index + expression.length + 3
    )}`;

    regexp.lastIndex = 0;
    match = regexp.exec(translatedTemplate);
  }

  return translatedTemplate;
}

function build(lang) {
  const path = lang === "en" ? "/" : `/${lang}`;
  fs.writeFileSync(`${__dirname}${path}/index.html`, translateTemplate(lang));
}

["en", "de"].forEach(build);
