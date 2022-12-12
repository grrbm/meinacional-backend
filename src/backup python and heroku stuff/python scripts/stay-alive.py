import undetected_chromedriver.v2 as uc
from webdriver_manager.chrome import ChromeDriverManager


def create_driver():
    options = uc.ChromeOptions()
    # options.add_argument("--headless")
    # options.add_argument("--disable-gpu")
    # options.add_argument("--no-sandbox")
    # options.add_argument("--disable-dev-shm-usage")
    # driver = uc.Chrome(chrome_options=options, executable_path="/opt/chromedriver")
    driver = uc.Chrome(executable_path=ChromeDriverManager().install(), options=options)
    return driver


def chromedriver_function(driver, url):
    # Do whatever you want here

    driver.get(url)

    return url


def function1(driver):
    # ... do something
    chromedriver_function(driver, "http://www.google.com")


def function2(driver):
    # ... do something
    chromedriver_function(driver, "http://www.gmail.com")


driver = create_driver()
function1(driver)
function2(driver)
