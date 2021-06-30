# errors
import traceback
import logging
# Imports, of course
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver import FirefoxOptions
from bs4 import BeautifulSoup

try:
        
    options = FirefoxOptions()
    options.binary_location = r"/app/vendor/firefox/firefox"
    options.add_argument("--headless")
    # Initialize a Firefox webdriver
    driver = webdriver.Firefox(options=options, executable_path='/app/vendor/geckodriver/geckodriver')

    # Grab the web page
    driver.get("http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao")

    # We use .find_element_by_id here because we know the id
    text_input = driver.find_element_by_id("cnpj")

    # Then we'll fake typing into it
    text_input.send_keys("38294699000112")

    # Now we can grab the search button and click it
    search_button = driver.find_element_by_class_name("btn btn-success ladda-button")
    search_button.click()

    # Instead of using requests.get, we just look at .page_source of the driver
    driver.page_source

    print("sucess")

except Exception as error:
    print('An exception occurred: {}'.format(traceback.format_exc()))
    logging.error(traceback.format_exc())
    # Logs the error appropriately. 