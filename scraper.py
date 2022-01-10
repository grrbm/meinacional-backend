# sys
import sys

# time
import time
import undetected_chromedriver.v2 as uc

# errors
import traceback
import logging

# Imports, of course
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver import FirefoxOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import NoSuchElementException
from bs4 import BeautifulSoup

try:

    # Initialize a Chrome webdriver
    # driver = webdriver.Chrome()

    # attempting headless
    options = uc.ChromeOptions()
    # options.headless = True
    # options.add_argument("--headless")
    driver = uc.Chrome(executable_path=ChromeDriverManager().install(), options=options)
    driver.get(
        "http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
    )

    # get cnpj from arguments
    cnpj_argument = sys.argv[1]

    # We use .find_element_by_id here because we know the id
    text_input = driver.find_element_by_id("cnpj")

    # Then we'll fake typing into it
    text_input.send_keys(cnpj_argument)

    # sleep
    time.sleep(3)

    # Now we can grab the search button and click it
    search_button = driver.find_element_by_css_selector(
        "button.btn.btn-success.ladda-button"
    )
    search_button.click()

    time.sleep(3)
    # emit_das_tab = WebDriverWait(driver, 10).until(
    #     lambda driver: driver.find_element(By.XPATH,'//a[@href="'+'/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao'+'"]') or driver.find_element(By.CSS_SELECTOR,'div.toast-message')
    # )
    # emit_das_tab = driver.find_element_by_xpath('//a[@href="'+'/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao'+'"]')

    try:
        emit_das_tab = WebDriverWait(driver, 10).until(
            lambda driver: driver.find_element(
                By.XPATH,
                '//a[@href="'
                + "/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao"
                + '"]',
            )
            or driver.find_element(By.CSS_SELECTOR, "div.toast-message")
        )
    except TimeoutException as exception:
        print("there was a TIMEOUT EXCEPTION ! gonna pass")
        pass

    # check if detected
    try:
        toast_message = driver.find_element_by_css_selector("div.toast-message")
        raise RuntimeError(
            "chrome driver was detected by the site ! " + toast_message.text
        )
    except RuntimeError as error:
        # chrome driver was detected by the site
        print(error)
        raise
    except NoSuchElementException as error:
        print("Great. No toast message found. Continuing")
        pass

    emit_das_tab.click()

    i = 1
    while i <= 8:

        time.sleep(1)
        unclicked_dropdown = driver.find_element_by_css_selector(
            "button.btn.dropdown-toggle.btn-default"
        )
        unclicked_dropdown.click()

        time.sleep(1.2)
        list = driver.find_elements_by_css_selector("ul.dropdown-menu.inner li")
        size = len(list)
        if i >= size:
            print("Fim da lista.")
            break
        # print("size of list = {}".format(size))

        time.sleep(0.8)
        small = list[-i].find_element_by_css_selector("a span small.text-muted")
        print("this is the small: ")
        print(small.get_attribute("innerHTML"))
        if small.get_attribute("innerHTML") == "Não optante":
            print("O usuário foi não optante nesse ano.")
            break

        list[-i].click()

        time.sleep(0.4)
        ok_button = driver.find_element_by_css_selector(
            "button.btn.btn-success.ladda-button"
        )
        ok_button.click()

        # Instead of using requests.get, we just look at .page_source of the driver
        driver.page_source

        # We can feed that into Beautiful Soup
        doc = BeautifulSoup(driver.page_source, "html.parser")

        rows = doc.find(
            "table", {"class": "table table-hover table-condensed emissao is-detailed"}
        ).find_all("tr", attrs={"class": "pa"})

        results = []
        for row in rows:
            cells = row.find_all("td")
            # print("this is cells amount: {}".format(len(cells)))
            result = {
                "periodo": cells[1].getText().strip(),
                "apurado": cells[2].getText().strip(),
                "beneficio_inss": cells[3].getText().strip(),
                "situacao": cells[5].getText().strip(),
                # 'principal': cells[6].text,
                # 'multa': cells[7].text,
                # 'juros': cells[8].text,
                # 'total': cells[9].text,
                # 'data_vencimento': cells[10].text,
                # 'data_acolhimento': cells[11].text
            }
            results.append(result)

        # print results
        print(results)
        i += 1

    # Close the webdriver
    driver.close()

except Exception as error:
    print("An exception occurred: {}".format(traceback.format_exc()))
    logging.error(traceback.format_exc())
    driver.close()
    # Logs the error appropriately.
