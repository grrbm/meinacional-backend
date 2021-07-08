#time
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
from bs4 import BeautifulSoup

try:
        
    # Initialize a Chrome webdriver
    #driver = webdriver.Chrome()

    driver = uc.Chrome()
    driver.get('http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao')


    # We use .find_element_by_id here because we know the id
    text_input = driver.find_element_by_id("cnpj")

    # Then we'll fake typing into it
    text_input.send_keys("38294699000112")

    #sleep
    time.sleep(3)

    # Now we can grab the search button and click it
    search_button = driver.find_element_by_css_selector("button.btn.btn-success.ladda-button")
    search_button.click()

    time.sleep(6)
    emit_das_tab = driver.find_element_by_xpath('//a[@href="'+'/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/emissao'+'"]')
    emit_das_tab.click()

    time.sleep(1)
    unclicked_dropdown = driver.find_element_by_css_selector("button.btn.dropdown-toggle.bs-placeholder.btn-default")
    unclicked_dropdown.click()

    time.sleep(1.2)
    list = driver.find_elements_by_css_selector("ul.dropdown-menu.inner li")
    size = len(list)
    #print("size of list = {}".format(size))

    time.sleep(0.8)
    list[-1].click()
    
    time.sleep(0.4)
    ok_button = driver.find_element_by_css_selector('button.btn.btn-success.ladda-button')
    ok_button.click()
    

    # Instead of using requests.get, we just look at .page_source of the driver
    driver.page_source

    # We can feed that into Beautiful Soup
    doc = BeautifulSoup(driver.page_source, "html.parser")

    rows = doc.find('table', {"class": "table table-hover table-condensed emissao is-detailed"}).find_all('tr', attrs={'class': "pa"})

    results = []
    for row in rows:
        cells = row.find_all("td")
        #print("this is cells amount: {}".format(len(cells)))
        result = {
            'periodo': cells[1].getText().strip(),
            'apurado': cells[2].getText().strip(),
            'beneficio_inss': cells[3].getText().strip(),
            'situacao': cells[5].getText().strip(),
            # 'principal': cells[6].text,
            # 'multa': cells[7].text,
            # 'juros': cells[8].text,
            # 'total': cells[9].text,
            # 'data_vencimento': cells[10].text,
            # 'data_acolhimento': cells[11].text
        }
        results.append(result)


    #print results
    print(results)

    # Close the webdriver
    driver.close()

except Exception as error:
    print('An exception occurred: {}'.format(traceback.format_exc()))
    logging.error(traceback.format_exc())
    # Logs the error appropriately. 