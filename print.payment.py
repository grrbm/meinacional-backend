# time
import time
import undetected_chromedriver.v2 as uc

# errors
import traceback
import logging

# Imports, of course
from selenium import webdriver
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

    # driver = webdriver.Chrome(executable_path=r'C:\Python38\ChromeDriver\chromedriver')
    driver = uc.Chrome()
    driver.get(
        "http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
    )

    # We use .find_element_by_id here because we know the id
    text_input = driver.find_element_by_id("cnpj")

    # Then we'll fake typing into it
    text_input.send_keys("38294699000112")

    # sleep
    time.sleep(3)

    # Now we can grab the search button and click it
    search_button = driver.find_element_by_css_selector(
        "button.btn.btn-success.ladda-button"
    )
    search_button.click()

    time.sleep(3)
    # emit_das_tab = WebDriverWait(driver, 10).until(
    #     lambda driver: driver.find_element(By.XPATH,'//a[@href="'+'/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao'+'"]')
    #                    or driver.find_element(By.CSS_SELECTOR,'div.toast-message'
    #     )
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

    time.sleep(1)
    unclicked_dropdown = driver.find_element_by_css_selector(
        "button.btn.dropdown-toggle.bs-placeholder.btn-default"
    )
    unclicked_dropdown.click()

    time.sleep(1.2)
    list = driver.find_elements_by_css_selector("ul.dropdown-menu.inner li")
    size = len(list)
    print("size of list = {}".format(size))

    time.sleep(0.8)
    list[-1].click()

    time.sleep(0.4)
    ok_button = driver.find_element_by_css_selector(
        "button.btn.btn-success.ladda-button"
    )
    ok_button.click()

    time.sleep(5)

    checkboxText = "Agosto/2021"
    checkbox = driver.find_element_by_xpath(
        ".//*[contains(text(), '" + checkboxText + "')]/preceding-sibling::td"
    )
    checkbox.click()

    time.sleep(5)

    button_generate_DAS = driver.find_element_by_id("btnEmitirDas")
    button_generate_DAS.click()

    time.sleep(5)

    printDASbutton = driver.find_element(
        By.XPATH,
        '//a[@href="'
        + "/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao/imprimir"
        + '"]',
    )

    printDASbutton.click()

    time.sleep(500)

    # Close the webdriver
    driver.close()

except Exception as error:
    print("An exception occurred: {}".format(traceback.format_exc()))
    logging.error(traceback.format_exc())
    driver.close()
    # Logs the error appropriately.
