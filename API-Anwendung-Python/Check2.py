from tqdm import tqdm
import time
import unicodedata

checkList = [1, 9, 19, 10, 12, 26, 31]
"""
1	Hergestellt	Passt fast immer für menschengemachte Objekte. Verwenden, wenn anderer Ereignistyp nicht besser passt.
9	Gemalt	Bitte für Gemälde, Pastelle, Aquarelle etc. verwenden.
31	Modelliert	Bei z.B. Keramik verwenden.
12	Druckplatte hergestellt	Bitte verwenden bei Kupferstichen, Holzschnitten ... .
26	Gedruckt	Bitte verwenden um die Erstellung von gedruckten Materialien (Bücher, Zeitschriften, ...) zu erfassen.
19	Gezeichnet	Gilt für Zeichnungen, technische wie künstlerische.
10	Aufgenommen	Bitte verwenden bei Fotografien, Ton- oder Video-/Filmaufzeichnungen, ... .
"""

def checkData(object, countErrors, fetchParams):
    """
    Checks data for integrity and the location of production of the object
    :param object: JSON object
    :param countErrors: dict collecting errors
    :return: datastructure with extracted data from object
    """
    eventList = []
    events = object.get("object_events")

    for eventType in checkList:
        for singleEvent in events:
            #Check for Event_Type
            if singleEvent["event_type"] == eventType:

                # Get data
                peopleCheck = singleEvent.get("people")
                timeCheck = singleEvent.get("time")
                place = singleEvent.get("place")

                # Check Data for missing entities
                ok = True
                if peopleCheck is None or "people_id" not in peopleCheck:
                    countErrors["people"]+=1
                    ok = False
                if timeCheck is None or "time_name" not in timeCheck:
                    countErrors["time"]+=1
                    ok = False
                if place is None:
                    countErrors["place not found"]+=1
                    ok = False
                #location = checkLocation(object, geolocator) #TODO: Implement Location Check
                # if location is None:
                #     countErrors["place not in Drittes Reich"]+=1
                #     ok = False
                if ok is True:
                    eventList.append(singleEvent.get("event_type")) #[9,6,1]
                    return dataCollector(object, eventType, fetchParams)

    if not eventList:
        countErrors["no event found"]+=1
    return None

def CheckYear(people_name):
    """
    Extracts years from display name in ()
    TODO: Handle missing year in input (-19xx)
    :param people_name: display name
    :return: dates
    """
    if "(" in people_name:
        count = 0
        tmpCount = []
        for i in people_name:
            if "(" in i:
                tmpCount.append(count + 1)
            if ")" in i:
                tmpCount.append(count)
            count += 1
        jahre = [people_name[i:j] for i, j in zip(tmpCount[::2], tmpCount[1::2])]
        if len(jahre) > 1:
            jahre[1] = jahre[1].replace(" ", "")
            geb = jahre[1][:4]
            tod = jahre[1][-4:]

        else:
            jahre[0] = jahre[0].replace(" ", "")
            geb = jahre[0][:4]
            tod = jahre[0][-4:]

        if "-" in geb:
            geb = ""
        if "-" in tod:
            tod = ""
    else:
        geb = ""
        tod = ""
    return geb, tod


def checkLocation(dataObjectHolder, geolocator):
    """
    Reverse geolocation of the objects place
    :param dataObjectHolder: dict of objects
    :param geolocator: handler for the API
    :return: countryset - set of countries, latlongdict - dict of "(lat, long)": "Country"
    """
    #Setup for dict and set
    countryCoords = set()
    countrySet = set()
    latLongDict = {}
    for singleObject in dataObjectHolder:
        objectOrt = singleObject.get("objectOrt")
        geonames = objectOrt.get("geonames")
        lat = objectOrt.get("place_latitude")
        long = objectOrt.get("place_longitude")

        countryCoords.add((float(lat), float(long)))

    for lat, long in tqdm(countryCoords, desc="Fetching Locations"):
        try:
            location = geolocator.reverse((lat, long))

            country_raw = location.raw.get("address", {}).get("country")
            if country_raw:  # nur wenn ein String vorhanden ist
                country = country_raw
                countrySet.add(country)
                latLongDict[(lat, long)] = country
            else:
                country = None
            time.sleep(1)
        except Exception as e:
            print(e)
    return countrySet, latLongDict


def matchLocation(objectDataHolder, latLongDict):
    for singleObject in objectDataHolder:

        objectOrt = singleObject.get("objectOrt")
        objectLatitude = objectOrt.get("place_latitude")
        objectLongitude = objectOrt.get("place_longitude")
        key = (float(objectLatitude), float(objectLongitude))
        if  (objectLatitude, objectLongitude) in latLongDict:
            singleObject["Land"] = latLongDict[key]
    return objectDataHolder


warLocations = [
    "Polska",
    "Nederland",
    "Danmark",
    "Belgïe",
    "Italia",
    "Lietuva",
    "Magyarország",
    "France",
    "Österreich",
    "Deutschland",
    "Shqipëria",
    "Norge"
]
jugoslawien_aliases = {
    "Crna Gora", "Црна Гора",
    "Bosna i Hercegovina", "Босна и Херцеговина",
    "Србија", "Serbia"
}
# Unicode angleichen
warLocations = [unicodedata.normalize("NFC", x) for x in warLocations]

def removeByLocations(updatedDataObjectHolder):
    """
    Removes Locations not directly impacted by Nazi presence
    :param updatedDataObjectHolder: dict of objects from fetch
    :return: return dict with valid data
    """
    for obj in updatedDataObjectHolder[:]:  # [:] = Kopie für sicheres Iterieren
        objLand = obj.get("Land")
        if not objLand:
            updatedDataObjectHolder.remove(obj)
            print("object ohne Land gefunden", obj)
            continue
        parts = normalize_land_name(objLand)

        # Spezialregel Jugoslawien: wenn irgendein Teil zu den Aliassen passt
        if any(p in jugoslawien_aliases for p in parts):
            obj["Land"] = "Jugoslawien"
            continue

        # Normale Filterung: nur behalten, wenn eines der Teile in warLocations vorkommt
        if not any(p in warLocations for p in parts):
            updatedDataObjectHolder.remove(obj)

    print(f"Datenlänge nach clean-up: {len(updatedDataObjectHolder)}")
    return updatedDataObjectHolder

def normalize_land_name(name):
    """
    Normalisiert Unicode und splittet Mehrfachnamen von geopy.
    :param name: Landesname von Geopy
    :return: Unterschiedliche Nennungen des Landes in einer Liste
    """
    name = unicodedata.normalize("NFC", name)
    #Check auf mehrere Nennungen
    parts = [part.strip() for part in name.split("/")]
    return parts

def dataCollector(object, eventType, fetchParams):
    """
    Bundles information into a new dict
    :param object: JSON of a musb object
    :param eventType: int
    :return: dict with extracted data
    """
    events = object.get("object_events")
    singleEvent = next((e for e in events if e["event_type"] == eventType))

    objectId = object.get("object_id")

    images_ = object.get("object_images")[0]
    imgSrc = images_.get("preview")
    subset = images_.get("subset")
    folder = images_.get("folder")

    people_name = singleEvent.get("people").get("people_display_name")
    persInst = singleEvent.get("people").get("people_id")
    geb, tod = CheckYear(people_name)
    time= singleEvent.get("time").get("time_start")
    place = singleEvent.get("place")
    description = singleEvent.get("people").get("people_short_description")

    if fetchParams["tag_id"] == 106:
        tagId = "Malerei"
    if fetchParams["tag_id"] == 266:
        tagId = "Malerei"
    if fetchParams["tag_id"] == 12912:
        tagId = "Zeichnung"
    if fetchParams["tag_id"] == 1739:
        tagId = "Skulptur"

    return{
        "objectId": objectId,
        "objectDatum": time,
        "objectOrt": place,
        "Name": people_name,
        "persInst": persInst,
        "Geboren": geb,
        "Gestorben": tod,
        "Desc": description,
        "subset": subset,
        "folder": folder,
        "imgSrc": imgSrc,
        "event_type": eventType,
        "tag_id": tagId
                            }
