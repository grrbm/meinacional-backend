const puppeteer = require("puppeteer-extra");
const { Page } = require("puppeteer");
var shell = require("shelljs");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { PdfReader } = require("pdfreader");
const path = require("path");

const TIMEOUT_SECONDS = 30;
export const getMeiHistory = async (
  cnpj
): Promise<{
  success: boolean;
  message?: string;
  data?: any;
  requestDurationSeconds?: any;
  error?: string;
}> => {
  console.log("executing pupp function");
  let browser;
  try {
    puppeteer.use(StealthPlugin());
    const startTime = Date.now();
    console.log("gonna lauhcn browser");
    browser = await puppeteer.launch({
      headless: true,
      userDataDir: "./puppeteerDataDir",
      defaultViewport: null, //otherwise it defaults to 800x600
      //slowMo: 250,
      ignoreHTTPSErrors: true,
      args: ["--no-sandbox"],
    });
    console.log("browser laucnh successful");
    const page = await browser.newPage();
    console.log("spawned page");

    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        console.log("just timed out");
        if (browser && page) {
          try {
            await page.screenshot({
              path: "timeoutscreenshot.png",
              fullPage: true,
            });
          } catch (e) {
            console.log(
              "Could NOT take screenshot. Most likely browser has already been closed."
            );
          }
        }

        resolve({
          success: false,
          error: "timeout",
        });
      }, TIMEOUT_SECONDS * 1000);
    });
    console.log("gonna await mei history promise");
    const meiHistoryPromise = new Promise(async (resolve, reject) => {
      console.log("going to the page");
      await page.goto(
        "http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
      );

      const cnpjInputSelector = `input[id='cnpj']`;
      console.log("waiting cnpj input");
      const cnpjInput = await page.waitForSelector(cnpjInputSelector);
      console.log("found cnpj input");
      await page.evaluate((cnpj) => {
        const cnpjField: HTMLInputElement | null =
          document.querySelector(`input[id='cnpj']`);
        if (cnpjField?.value) {
          cnpjField.value = cnpj;
        }
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
      const allData: Array<any> = [];
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
            document.querySelectorAll("tr.pa > td:not(.multa):nth-child(2)"),
            (e) => e.innerHTML.trim()
          );
          const apurados = Array.from(
            document.querySelectorAll("tr.pa > td:not(.multa):nth-child(3)"),
            (e) => e.innerHTML.trim()
          );
          const situations = Array.from(
            document.querySelectorAll(
              "tr.pa > td:not(.vencimento):nth-child(5)"
            ),
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
      //await page.waitForTimeout(10000);
      await browser.close();
      const duration = Math.round((Date.now() - startTime) / 1000);
      resolve({
        success: true,
        data: allData,
        requestDurationSeconds: duration,
      });
    });
    const result = await Promise.race([timeoutPromise, meiHistoryPromise]);
    console.log("race finished");
    return {
      success: true,
      data: result,
      message: "race finished",
    };
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

export const getPaymentCode = async (
  monthYear,
  cnpj
): Promise<{
  success: boolean;
  data?: any;
  message?: string;
  requestDurationSeconds?: any;
  error?: string;
}> => {
  console.log("this is the monthYear: " + monthYear);
  const splitDate = monthYear.split("/");
  const month = splitDate[0];
  const year = splitDate[1];
  let browser;
  try {
    puppeteer.use(StealthPlugin());
    const startTime = Date.now();
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: "./puppeteerDataDir",
      defaultViewport: null, //otherwise it defaults to 800x600
      //slowMo: 250,
      ignoreHTTPSErrors: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    let timer: any = null;
    const timeoutPromise = new Promise((resolve, reject) => {
      timer = setTimeout(async () => {
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
    const paymentCodePromise = new Promise(async (resolve, reject) => {
      await page.goto(
        "http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
      );

      const cnpjInputSelector = `input[id='cnpj']`;
      const cnpjInput = await page.waitForSelector(cnpjInputSelector);
      await page.evaluate((cnpj) => {
        const cnpjField: HTMLInputElement | null =
          document.querySelector(`input[id='cnpj']`);
        if (cnpjField?.value) {
          cnpjField.value = cnpj;
        }
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
        const elements: Array<HTMLElement> = Array.from(
          document.querySelectorAll(
            `li[data-original-index]:not([class^='disabled']) > a > span.text`
          )
        );
        const found = elements.filter((elmt) => elmt.textContent === year);
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

        await page.waitForNavigation({ waitUntil: "networkidle2" });
        /**
          After this submit, puppeteer loses "page" object because page is refreshed
          So get it again.
         */
        const [notthispage, refreshedPage] = await browser.pages();
        const foundCheckbox = await refreshedPage.evaluate((monthYear) => {
          const checkboxes: Array<HTMLElement> = Array.from(
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
            console.log(
              "this is the headers: " + JSON.stringify(response.headers())
            );

            if (disposition && disposition.indexOf("attachment") !== -1) {
              var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              var matches = filenameRegex.exec(disposition);
              let filename;
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, "");
              }
              console.log("file name: " + filename);
              const downloadPath = process.env.CHROMIUM_DOWNLOADS_FOLDER_PATH;
              const full = path.join(path.resolve(downloadPath, filename));
              console.log("full file path: " + full);
              const { success, res1, res2, res3, res4 } = await readPdfFile(
                full
              );
              if (success) {
                console.log("pdf file was read !");

                await page.waitForTimeout(2000);
                await browser.close();
                shell.exec("pkill chromium");
                console.log("passed the browser close");
                //await browser.process().kill("SIGINT");
                //await page.waitForTimeout(1000)

                const duration = Math.round((Date.now() - startTime) / 1000);
                clearTimeout(timer);
                resolve({
                  success: true,
                  data: { res1, res2, res3, res4 },
                  requestDurationSeconds: duration,
                });
              } else {
                await browser.close();
                const duration = Math.round((Date.now() - startTime) / 1000);
                clearTimeout(timer);
                resolve({
                  success: false,
                  requestDurationSeconds: duration,
                });
              }
            }
          });
          //await refreshedPage.waitForNavigation({ waitUntil: "networkidle2" });
          refreshedPage.on("console", async (msg) => {
            const msgArgs = msg.args();
            for (let i = 0; i < msgArgs.length; ++i) {
              const newMsgText = await msgArgs[i].jsonValue();
              if (typeof newMsgText === "string") {
                if (newMsgText.includes("[debug]")) {
                  console.log(await msgArgs[i].jsonValue());
                }
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
    const result = await Promise.race([timeoutPromise, paymentCodePromise]);
    console.log("race finished");
    return { success: true, data: result, message: "race finished" };
  } catch (err) {
    return {
      success: false,
      error: "Internal Server Error: " + err,
      message: "Internal Server Error: " + err,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const readPdfFile = async (
  filename = "/Users/guilhermereis/Downloads/DAS-PGMEI-38294699000112-AC2022.pdf"
): Promise<{
  success: boolean;
  res1?: any;
  res2?: any;
  res3?: any;
  res4?: any;
}> => {
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
