import requests
import csv
from bs4 import BeautifulSoup


page = requests.get('https://web.archive.org/web/20121007172955/http://www.nga.gov/collection/anZ1.htm')

soup = BeautifulSoup(page.text, 'html.parser')

print('will print something')
print(soup.get_text())