import json
import requests
from bs4 import BeautifulSoup

firstName:str
lastName:str

#Endpoint
#url = f"https://collections.yadvashem.org/en/names/search-results?page=1&s_last_name_search_en={firstName}&t_last_name_search_en=yvSynonym&s_first_name_search_en={lastName}&t_first_name_search_en=yvSynonym"
url_example = "https://collections.yadvashem.org/en/names/search-results?page=1&s_last_name_search_en=Levi&t_last_name_search_en=yvSynonym&s_first_name_search_en=Primo&t_first_name_search_en=yvSynonym&s_place_birth_search_en=Turin&t_place_birth_search_en=yvSynonym"
url_example_2 = "https://collections.yadvashem.org/en/names/search-results?page=1&s_last_name_search_en=Levi&t_last_name_search_en=yvSynonym&s_first_name_search_en=Primo&t_first_name_search_en=yvSynonym&s_year_death_search=1944&t_year_death_search=exactly&s_place_birth_search_en=Turin&t_place_birth_search_en=yvSynonym"
#Datapoints

noResults:str= "No Matching Results"
resultNumbers:int = 0
results:str = f"{resultNumbers} Results"

results_parent:str = '<div class="cards_list">'
results_child_none:str = f'<div class="num_results">'
results_child:str = f'<div class="ng-star-inserted">'

#if no results
for i in range(10):
    page_empty = requests.get(url_example_2)
    page_result = requests.get(url_example)
    soup_empty = BeautifulSoup(page_empty.content,
                               "html.parser")  # with the help of beautifulSoup and html parser create soup
    soup_result = BeautifulSoup(page_result.content,
                                "html.parser")  # with the help of beautifulSoup and html parser create soup
    print(f"Anfrage: {i} -------------------------------------------")
    for child in soup_empty.find_all("div", {"class": "cards_list"}):
        print("Negative Feedback")
        print(f"Content: {child.contents[0].string} +++ {len(child.contents[0].string)}")
        print(f"Content: {child.contents[1].string} +++ {len(child.contents[1].string)}")
    for child in soup_result.find_all("div", {"class": "cards_list"}):
        print("Positive Feedback")
        print(f"Content: {child.contents[0].string} +++ {len(child.contents[0].string)}")
        print(f"Content: {child.contents[1].string} +++ {len(child.contents[1].string)}")



"""
if results.text == noResults:
    print("unknown")
else:
    print(results.text)
"""

#for i in child_soup.children:
#    print("child :  ", i)