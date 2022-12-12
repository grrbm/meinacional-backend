from selenium import webdriver
from selenium.webdriver.common.keys import Keys

driver = webdriver.Chrome('C:\Python38\ChromeDriver\chromedriver')

driver.get("https://www.python.org")

print(driver.title)