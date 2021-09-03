import glob
import os
import PyPDF2
import re

download_dir = r"C:\Users\grrbm\Downloads"
os.chdir(download_dir)

full_list = []
for file in glob.glob("DAS-PGMEI*.pdf"):
    full_list.append(file)

found_file = full_list[len(full_list) - 1]

pathToRead = download_dir + "/" + found_file
print("path to read = " + pathToRead)
opened_pdf = PyPDF2.PdfFileReader(pathToRead, "rb")

p = opened_pdf.getPage(0)

p_text = p.extractText()
result = re.search("Página:/(.*)AUTENTICAÇÃO MECÂNICA", p_text)

num_boleto = result.group(1)

print(num_boleto)
