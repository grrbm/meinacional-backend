#time
import time
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
        
    # Initialize a Chrome webdriver
    driver = webdriver.Chrome(executable_path=r'C:\Python38\ChromeDriver\chromedriver')

    # Grab the web page
    driver.get("http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao")

    # We use .find_element_by_id here because we know the id
    text_input = driver.find_element_by_id("cnpj")

    # Then we'll fake typing into it
    text_input.send_keys("38294699000112")

    #sleep
    time.sleep(3)

    # Now we can grab the search button and click it
    search_button = driver.find_element_by_css_selector("button.btn.btn-success.ladda-button")
    search_button.click()

    time.sleep(3)
    emit_das_tab = driver.find_element_by_xpath('//a[@href="'+'/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao'+'"]')
    emit_das_tab.click()

    time.sleep(1)
    unclicked_dropdown = driver.find_element_by_css_selector("button.btn.dropdown-toggle.bs-placeholder.btn-default")
    unclicked_dropdown.click()

    time.sleep(1.2)
    list = driver.find_elements_by_css_selector("ul.dropdown-menu.inner li")
    size = len(list)
    print("size of list = {}".format(size))

    time.sleep(0.8)
    list[-1].click()
    
    time.sleep(0.4)
    ok_button = driver.find_element_by_css_selector('button.btn.btn-success.ladda-button')
    ok_button.click()
    

    # Instead of using requests.get, we just look at .page_source of the driver
    driver.page_source

    print(driver.page_source)

except Exception as error:
    print('An exception occurred: {}'.format(traceback.format_exc()))
    logging.error(traceback.format_exc())
    # Logs the error appropriately. 