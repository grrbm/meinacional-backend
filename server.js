const puppeteer = require("puppeteer-extra");
const cheerio = require("cheerio");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const getMeiHistory = async (cnpj) => {
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
  await page.evaluate((cnpj) => {
    const cnpjField = document.querySelector(`input[id='cnpj']`);
    cnpjField.value = cnpj;
  }, cnpj);
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

  //pop the first element because it is "blank" (unselected)
  let exampleArray = await page.$$(
    `li[data-original-index]:not([class^='disabled']) > a > span.text`
  );
  exampleArray.reverse();
  exampleArray.pop();
  const amountAvailableYears = exampleArray.length;
  const allData = [];
  for (let i = 0; i < amountAvailableYears; i++) {
    //wait for this selector because when it shows up the page is fully loaded
    await page.waitForSelector(`button.btn.dropdown-toggle`);

    //Gotta get the puppeteer selector again because the page is auto-refreshed
    //and it loses context.
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
    //console.log("this is the rows object: " + JSON.stringify(rows, null, 2));
    allData.push(rows);
  }
  return {
    success: true,
    data: allData,
  };
};

module.exports = {
  getMeiHistory,
};
