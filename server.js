const puppeteer = require("puppeteer-extra");
const cheerio = require("cheerio");
const Xvfb = require("xvfb");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const TIMEOUT_SECONDS = 30;
const getMeiHistory = async (cnpj) => {
  let browser;
  try {
    puppeteer.use(StealthPlugin());
    const startTime = Date.now();
    var xvfb = new Xvfb({
      silent: true,
      xvfb_args: ["-screen", "0", "1280x720x24", "-ac"],
    });
    xvfb.start((err) => {
      if (err) console.error(err);
    });
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: "./puppeteerDataDir",
      defaultViewport: null, //otherwise it defaults to 800x600
      slowMo: 250,
      ignoreHTTPSErrors: true,
      args: [
        "--no-sandbox",
        "--start-fullscreen",
        "--display=" + xvfb._display,
      ],
    });
    const page = await browser.newPage();
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        console.log("just timed out");
        await page.screenshot({
          path: "timeoutscreenshot.png",
          fullPage: true,
        });
        resolve({
          success: false,
          error: "timeout",
        });
      }, TIMEOUT_SECONDS * 1000);
    });
    const meiHistoryPromise = new Promise(async (resolve, reject) => {
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

        const submitYearBtn = await page.waitForSelector(
          `button[type='submit']`
        );
        await submitYearBtn.click();

        const tableOrError = await page.waitForSelector(
          [`table.table`, `div.toast-message`].join(",")
        );

        const foundError = await page.evaluate(
          (tableOrError, toastClass) =>
            tableOrError.classList.contains(toastClass),
          tableOrError,
          "toast-message"
        );

        if (foundError) {
          //Gotta get the puppeteer selector again because the page is auto-refreshed
          //and it loses context.
          exampleArray = await page.$$(
            `li[data-original-index]:not([class^='disabled']) > a > span.text`
          );
          exampleArray.reverse();
          exampleArray.pop();
          const toastMessage = await page.evaluate(
            (el) => el?.innerText,
            tableOrError
          );
          const year = await page.evaluate(
            (el) => el?.innerText,
            exampleArray[i]
          );
          const error = "Error fetching year " + year + ". " + toastMessage;
          const yearAndError = {
            year,
            error,
          };
          allData.push(yearAndError);
          continue;
        }

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
            return {
              month,
              apurado: apurados[idx],
              situation: situations[idx],
            };
          });
          return parsedData;
        });
        //console.log("this is the rows object: " + JSON.stringify(rows, null, 2));

        //Gotta get the puppeteer selector again because the page is auto-refreshed
        //and it loses context.
        exampleArray = await page.$$(
          `li[data-original-index]:not([class^='disabled']) > a > span.text`
        );
        exampleArray.reverse();
        exampleArray.pop();
        const year = await page.evaluate(
          (el) => el?.innerText,
          exampleArray[i]
        );
        //---------------

        const yearAndRows = {
          year,
          rows,
        };
        allData.push(yearAndRows);
      }
      await browser.close();
      xvfb.stop();
      const duration = Math.round((Date.now() - startTime) / 1000);
      resolve({
        success: true,
        data: allData,
        requestDurationSeconds: duration,
      });
    });
    const result = await Promise.race([timeoutPromise, meiHistoryPromise]);
    console.log("race finished");
    return result;
  } catch (err) {
    const result = {
      success: false,
      error: "Internal Server Error: " + err,
    };
    return result;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  getMeiHistory,
};
