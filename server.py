import undetected_chromedriver.v2 as uc
from webdriver_manager.chrome import ChromeDriverManager

driver = None


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
    result = chromedriver_function(driver, "http://www.google.com")
    print(result)


def function2(driver):
    # ... do something
    result = chromedriver_function(driver, "http://www.gmail.com")
    print(result)


while True:
    choice = input("What would you like to do ? ")
    if choice == "1":
        print("Creating driver.")
        driver = create_driver()
    elif choice == "2":
        print("Calling function 1.")
        function1(driver)
    elif choice == "3":
        print("Calling function 2.")
        function2(driver)
    elif choice == "exit":
        print("Exiting")
        exit()
    else:
        print("That is not a valid input.")
