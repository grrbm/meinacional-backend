import PyPDF2
import re
import time
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
download_dir = r"C:\Users\grrbm\Desktop"
chrome_options.add_experimental_option(
    "prefs",
    {
        "download.default_directory": download_dir,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "plugins.always_open_pdf_externally": True,
    },
)

driver = webdriver.Chrome(
    executable_path=r"C:\Python39\ChromeDriver\chromedriver", options=chrome_options
)
driver.get("https://www.google.com/")
time.sleep(5)
file_name = "API-v-1.1.pdf"
driver.get("https://foxbit.com.br/wp-content/uploads/2018/06/" + file_name)
time.sleep(5)

file_name = "Boleto Simples Nacional.pdf"
pathToRead = download_dir + "/" + file_name
print("path to read = " + pathToRead)
opened_pdf = PyPDF2.PdfFileReader(pathToRead, "rb")

p = opened_pdf.getPage(0)

p_text = p.extractText()
result = re.search("Página:/(.*)AUTENTICAÇÃO MECÂNICA", p_text)

num_boleto = result.group(1)

print(num_boleto)
