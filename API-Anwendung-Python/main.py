from tqdm import tqdm

import API_Fetcher
import Check2
import JSONParser
import CountEntries

import json

from geopy.geocoders import Nominatim
geolocator = Nominatim(user_agent="my_app")

# Parameter für Endpunkt
alpha = {"alpha": 1933}
omega = {"omega": 1945}
gbn = {"gbreitenat": 100}

params = [
   {
        "tag_id": 106, #Malerei
        **alpha,
        **omega,
        **gbn
  },
      {
          "tag_id": 12912, #Zeichnung
          **alpha,
          **omega,
          **gbn
      },
      {
          "tag_id": 1739, #Skulptur
          **alpha,
          **omega,
          **gbn
      },
    {"tag_id": 266, #93776 Kriegsfotografie, 7950 Druckgrafik
          **alpha,
          **omega,
          **gbn
     }
]

# Endpunkte
url_tag = "https://global.museum-digital.org/json/objects"
url_objects = "https://global.museum-digital.org/json/object"

#JSON
artists = []
countErrors ={
    "no event found": 0,
    "people": 0,
    "place not found": 0,
    "time": 0,
    "place not in Drittes Reich": 0
}
dataObjectHolder = []
for fetchParams in params:
    data = API_Fetcher.fetch(fetchParams, url_tag)

    # Anfrage einzelne Objekte

    for singleObject in tqdm(data, desc="Fetching Objects"):
        dataObject = API_Fetcher.fetchSingleObject(url_objects, singleObject["objekt_id"])
        #Check für event_types
        checkedSingleObjekt = Check2.checkData(dataObject, countErrors, fetchParams)
        if checkedSingleObjekt is not None:
            dataObjectHolder.append(checkedSingleObjekt)

#überprüfung der Orte
#latitude and longitude set for reference
countrySet, latLongDict = Check2.checkLocation(dataObjectHolder, geolocator)
#überprüfung der Objekte mit den sets
updatedDataObjectHolder = Check2.matchLocation(dataObjectHolder, latLongDict)
#clean-up places
cleanDataObjectHolder = Check2.removeByLocations(updatedDataObjectHolder)

#Create statistics
statistik = CountEntries.statistics(updatedDataObjectHolder, countrySet)

#Ordnung in JSON übertragen
#JSONParser.parseToJSON(dataObjectHolder, fetchParams, artists) #Künstler*innen orientiert
JSONParser.parseToFlattenList(updatedDataObjectHolder, artists) #Objektorientiert

#Tmp country Set
jsonCountrySet = json.dumps(list(countrySet))
with open("Länder.json", "w", encoding="utf-8") as f:
    json.dump(jsonCountrySet, f, ensure_ascii=False, indent=4)

with open("Länderstatistik.json", "w", encoding="utf-8") as f:
    json.dump(statistik, f, ensure_ascii=False, indent=4)

print(f"Entries without proper Data: {countErrors}")

