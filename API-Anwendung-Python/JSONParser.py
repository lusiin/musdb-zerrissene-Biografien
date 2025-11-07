import json

def parseToJSON(dataObjectHolder, fetchParams, artists):
    """
    creates an artist oriented datastructure
    :param dataObjectHolder:
    :param fetchParams:
    :param artists:
    :return:
    """
    for siObject in dataObjectHolder:
        persId = siObject["persInst"]

        #creates Artist with persInst as key
        if persId not in artists:
            artists[persId] = {
                k: v for k, v in siObject.items() if k != "persinst" and k != "objektId" and k != "objectOrt" and k != "objectDatum" and k != "imgSrc"}
            #artists[persId]["Objekte"] = []  # leere Liste für Werke
            artists.setdefault(persId, {}) \
                .setdefault("Objekte", {}) \
                .setdefault(fetchParams["tag_id"], [])

        # Werk hinzufügen
        if fetchParams["tag_id"] not in artists[persId]["Objekte"]:
            artists.setdefault(persId, {}) \
                .setdefault("Objekte", {}) \
                .setdefault(fetchParams["tag_id"], [])

        artists[persId]["Objekte"][fetchParams["tag_id"]].append({siObject["objectId"]: {
                "objectOrt" : siObject.get("objectOrt"),
                "objectDatum" : siObject.get("objectDatum"),
                "imgSrc": siObject.get("imgSrc")
        }
        })
    with open("data_Künstlersortierung.json", "w", encoding="utf-8") as f:
        json.dump(artists, f, ensure_ascii=False, indent=4)

def parseToFlattenList(dataObjectHolder, artists):
    """
    Creates an objectoriented datastructure
    :param dataObjectHolder: list of dicts
    {"objectId": objectId,
    "objectDatum": time,
    "objectOrt": place,
    "Name": people_name,
    "persInst": persInst,
    "Geboren": geb,
    "Gestorben": tod,
    "Desc": description,
    "imgSrc": imgSrc,
    "event_type": eventType}
    :param artists: empty list
    :return: dict
    example:
    "objectId": 2153923,
    "objectDatum": "1942",
    "objectOrt": {
        ...
        },
    "Name": "Heribert Fischer-Geising (1896-1984)",
    "persInst": 22198,
    "Geboren": "1896",
    "Gestorben": "1984",
    "Desc": "German painter",
    "subset": "sachsen",
    "folder": "images/29/202206/48630",
    "imgSrc": "200w_gemaelde-48630.jpg",
    "tag_id": 106
    """
    for singleObject in dataObjectHolder:
        artists.append({k:v for k,v in singleObject.items()})

    with open("data_Künstlersortierung.json", "w", encoding="utf-8") as f:
        json.dump(artists, f, ensure_ascii=False, indent=4)
