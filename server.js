const puppeteer = require("puppeteer-extra");
const cheerio = require("cheerio");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./puppeteerDataDir",
  });
  const page = await browser.newPage();
  await page.goto(
    "http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
  );

  const cnpjInputSelector = `input[id='cnpj']`;
  const cnpjInput = await page.waitForSelector(cnpjInputSelector);
  const myCnpj = "38294699000112";
  await page.$eval(
    cnpjInputSelector,
    (elem) => (elem.value = "38294699000112")
  );
  //await cnpjInput.type(myCnpj);

  const submitBtnSelector = `button[id='continuar']`;
  const submitBtn = await page.waitForSelector(submitBtnSelector);
  await submitBtn.click();

  const emitirGuiaPagamentoSelector = `a[href="/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao"]`;
  const emitirGuiaPagamento = await page.waitForSelector(
    emitirGuiaPagamentoSelector
  );
  await emitirGuiaPagamento.click();
  console.log("clicked guia pagamento");

  const yearSelector = await page.waitForSelector(".btn.dropdown-toggle");
  await yearSelector.click();
  console.log("clicked year selector");

  let exampleArray = await page.$$(
    `li[data-original-index]:not([class^='disabled']) > a > span.text`
  );
  exampleArray.reverse();
  exampleArray.pop();
  const amountAvailableYears = exampleArray.length;
  for (let i = 0; i < amountAvailableYears; i++) {
    await page.waitForSelector(`button.btn.dropdown-toggle`);
    exampleArray = await page.$$(
      `li[data-original-index]:not([class^='disabled']) > a > span.text`
    );
    exampleArray.reverse();
    exampleArray.pop();
    //await exampleArray[i].click();
    await page.evaluate((btn) => {
      // this executes in the page
      btn.click();
    }, exampleArray[i]);

    const submitYearBtn = await page.waitForSelector(`button[type='submit']`);
    await submitYearBtn.click();

    await page.waitForSelector(`table.table`);
    console.log("found table");
    const tableInnerHtml = await page.$eval(
      "table.table",
      (element) => element.innerHTML
    );

    const rows = await page.evaluate(() => {
      const months = Array.from(
        document.querySelectorAll("tr.pa > td:nth-child(2)"),
        (e) => e.innerHTML.trim()
      );
      const apurados = Array.from(
        document.querySelectorAll("tr.pa > td:nth-child(3)"),
        (e) => e.innerHTML.trim()
      );
      const situations = Array.from(
        document.querySelectorAll("tr.pa > td:nth-child(5)"),
        (e) => e.innerHTML.trim()
      );
      const parsedData = months.map((month, idx) => {
        return { month, apurado: apurados[idx], situation: situations[idx] };
      });
      return parsedData;
    });
    console.log("this is the rows object: " + JSON.stringify(rows, null, 2));
  }
})();
