import PyPDF2
import re
import time

download_dir = r"C:\Users\grrbm\Desktop"
file_name = "Boleto Simples Nacional.pdf"
pathToRead = download_dir + "/" + file_name
print("path to read = " + pathToRead)
opened_pdf = PyPDF2.PdfFileReader(pathToRead, "rb")

p = opened_pdf.getPage(0)

p_text = p.extractText()

result = re.search("Página:/(.*)AUTENTICAÇÃO MECÂNICA", p_text)

# extract data line by line
P_lines = p_text.splitlines()
print(result.group(1))
