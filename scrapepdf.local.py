import PyPDF2
import undetected_chromedriver.v2 as uc
import re
import time
import autoit
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options

chrome_options = uc.ChromeOptions()
download_dir = r"C:\Users\grrbm\Desktop"
# chrome_options.headless = True
# chrome_options.add_argument("--headless")
chrome_options.add_argument("--blink-settings=imagesEnabled=false")
chrome_options.add_argument("--print-to-pdf=" + download_dir)

driver = uc.Chrome(options=chrome_options)
# driver.get("https://www.google.com/")
# time.sleep(5)
file_name = "API-v-1.1.pdf"
driver.get("https://foxbit.com.br/wp-content/uploads/2018/06/" + file_name)
time.sleep(5)

autoit.send("^p")

time.sleep(5)

autoit.send("{ENTER}")

time.sleep(15)

autoit.send("38294699000112")

time.sleep(3)

autoit.send("{ENTER}")

time.sleep(10)

file_name = "Boleto Simples Nacional.pdf"
pathToRead = download_dir + "/" + file_name
print("path to read = " + pathToRead)
opened_pdf = PyPDF2.PdfFileReader(pathToRead, "rb")

p = opened_pdf.getPage(0)

p_text = p.extractText()
result = re.search("Página:/(.*)AUTENTICAÇÃO MECÂNICA", p_text)

num_boleto = result.group(1)

pageSource = driver.page_source
fileToWrite = open(download_dir + "/" + "page_source.html", "w")
fileToWrite.write(pageSource)
fileToWrite.close()
print(num_boleto)
