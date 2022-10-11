const puppeteer = require("puppeteer-extra");
const cheerio = require("cheerio");
const Xvfb = require("xvfb");
const { Page } = require("puppeteer");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { textContent } = require("domutils");
const { PdfReader } = require("pdfreader");
const path = require("path");

const TIMEOUT_SECONDS = 30;
const getMeiHistory = async (cnpj) => {
  let browser;
  try {
    puppeteer.use(StealthPlugin());
    const startTime = Date.now();
    // var xvfb = new Xvfb({
    //   silent: true,
    //   xvfb_args: ["-screen", "0", "1280x720x24", "-ac"],
    // });
    // xvfb.start((err) => {
    //   if (err) console.error(err);
    // });
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: "./puppeteerDataDir",
      defaultViewport: null, //otherwise it defaults to 800x600
      //slowMo: 250,
      ignoreHTTPSErrors: true,
      args: [
        "--no-sandbox",
        "--start-fullscreen",
        //"--display=" + xvfb._display,
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
      await page.waitForTimeout(10000);
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

const getPaymentCode = async (monthYear, cnpj) => {
  console.log("this is the monthYear: " + monthYear);
  const splitDate = monthYear.split("/");
  const month = splitDate[0];
  const year = splitDate[1];
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

      console.log("going to perform find");
      const found = await page.evaluate((year) => {
        const elements = document.querySelectorAll(
          `li[data-original-index]:not([class^='disabled']) > a > span.text`
        );
        const found = Array.from(elements).filter(
          (elmt) => elmt.textContent === year
        );
        found[0].click();
        console.log("clicked !!");
        return found;
      }, year);

      //
      if (found.length > 0) {
        console.log("Found !!");
        //wait for this selector because when it shows up the page is fully loaded
        const submitYearBtn = await page.waitForSelector(
          `button[type='submit']`
        );
        await submitYearBtn.click();

        console.log("clicking checkbox: ");

        /**
          After this submit, puppeteer loses "page" object because page is refreshed
          So get it again.
         */
        const [notthispage, refreshedPage] = await browser.pages();
        const foundCheckbox = await refreshedPage.evaluate((monthYear) => {
          const checkboxes = Array.from(
            document.querySelectorAll("tr.pa > td:nth-child(1) > input")
          );
          const months = Array.from(
            document.querySelectorAll("tr.pa > td:nth-child(2)")
          );
          const found = months.filter((month, index) => {
            if (month.textContent === monthYear) {
              checkboxes[index].click();
              return true;
            }
            return false;
          });
          return found;
        }, monthYear);
        if (foundCheckbox.length > 0) {
          console.log("found the checkbox !!");
          //
          const emitirButtonSelector = await refreshedPage.waitForSelector(
            "#btnEmitirDas"
          );
          await emitirButtonSelector.click();
          const printDASbutton = await refreshedPage.waitForXPath(
            '//a[@href="' +
              "/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao/imprimir" +
              '"]'
          );

          /** This part waits for browser download response, and filters the file name from the response headers. */
          refreshedPage.on("response", async (response) => {
            //check for "Content-Disposition"
            console.log("entered here!!!");
            const disposition = response.headers()["content-disposition"];

            if (disposition && disposition.indexOf("attachment") !== -1) {
              var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              var matches = filenameRegex.exec(disposition);
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, "");
              }
              console.log("file name: " + filename);
              const DOWNLOADFILEPATH = "/Users/guilhermereis/Downloads";
              const full = path.join(path.resolve(DOWNLOADFILEPATH, filename));
              const { success, res1, res2, res3, res4 } = await readPdfFile(
                full
              );
              if (success) {
                await browser.close();
                xvfb.stop();
                const duration = Math.round((Date.now() - startTime) / 1000);
                resolve({
                  success: true,
                  data: { res1, res2, res3, res4 },
                  requestDurationSeconds: duration,
                });
              } else {
                await browser.close();
                xvfb.stop();
                const duration = Math.round((Date.now() - startTime) / 1000);
                resolve({
                  success: false,
                  requestDurationSeconds: duration,
                });
              }
            }
          });
          await printDASbutton.click();
        } else {
          console.log("did not find checkbox ...");
        }
        console.log("finished clicking checkbox");
      } else {
        console.log("Not found !!");
      }

      //await page.waitForTimeout(100000000);
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

const readPdfFile = async (
  filename = "/Users/guilhermereis/Downloads/DAS-PGMEI-38294699000112-AC2022.pdf"
) => {
  return new Promise((resolve, reject) => {
    //
    try {
      let finished = false;
      let accum = "";
      new PdfReader().parseFileItems(filename, (err, item) => {
        if (err) console.error("error:", err);
        else if (!item) onFinish(accum);
        else if (item.text) {
          accum += item.text + " ";
        }
      });
      const onFinish = (fullstring) => {
        console.log("FInished ! Full string: " + fullstring);

        //console.log("full string before: " + fullstring);
        const [not, res1] = fullstring.match(
          new RegExp("Página:(.*)AUTENTICAÇÃO MECÂNICA")
        );
        console.log("res1: " + JSON.stringify(res1, null, 2));
        //console.log("full string after: " + fullstring);
        const [not2, res2] = fullstring.match(
          new RegExp("Valor Total do Documento(.*)CNPJ Razão Social")
        );
        console.log("res2: " + JSON.stringify(res2, null, 2));

        const [not3, res3] = fullstring.match(
          new RegExp("Razão Social(.*)Código Principal")
        );
        console.log("res3: " + JSON.stringify(res3, null, 2));

        const [not4, res4] = fullstring.match(
          new RegExp("Pagar este documento até(.*)Observações CPF")
        );
        console.log("res4: " + JSON.stringify(res4, null, 2));
        resolve({ success: true, res1, res2, res3, res4 });
      };
    } catch (err) {
      console.log("Error reading pdf file !" + err);
      resolve({ success: false });
    }
  });
};
module.exports = {
  getMeiHistory,
  getPaymentCode,
  readPdfFile,
};
