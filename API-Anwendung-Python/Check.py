"""
Checks Data:
1. Event
2. Name

TODO: Check Location, Eventtype and extract time
"""

import requests
import logging

#Endpunkte
url_geonames = "http://api.geonames.org/searchJSON?"

checkList = [1, 5, 9, 12, 26, 36]
"""
1	Hergestellt	Passt fast immer für menschengemachte Objekte. Verwenden, wenn anderer Ereignistyp nicht besser passt.
5	Wurde abgebildet (Akteur)	Bitte verwenden, wenn jemand auf dem Objekt abgebildet wurde (nur Personen/Instiutionen). Dies ist ein Ereignis, welches ein anderes ("Aufgenommen") bedingt, es ist deshalb nicht vollständig. Zeitpunkt und Ort des Aufnehmens sind als Ereignis vom Typ "Aufgenommen" zu verzeichnen. (Wird bei Datenexport gesondert behandelt).
9	Gemalt	Bitte für Gemälde, Pastelle, Aquarelle etc. verwenden.
12	Druckplatte hergestellt	Bitte verwenden bei Kupferstichen, Holzschnitten ... .
26	Gedruckt	Bitte verwenden um die Erstellung von gedruckten Materialien (Bücher, Zeitschriften, ...) zu erfassen.
36	Wurde abgebildet (Ort)	Bitte verwenden, wenn ein Ort oder ein Bauwerk auf dem Objekt abgebildet wurde (nur Ort/Bauwerk). Dies ist ein Ereignis, welches ein anderes ("Aufgenommen") bedingt, es ist deshalb nicht vollständig. Zeitpunkt und Ort des Aufnehmens sind als Ereignis vom Typ "Aufgenommen" zu verzeichnen. (Wird bei Datenexport gesondert behandelt).
"""

def checkData(object, countErrors):
    objectId = object.get("object_id")
    events = object.get("object_events")
    for eventType in checkList:
        for item in events:
            if item["event_type"] == eventType:
                peopleCheck = item.get("people")
                if not peopleCheck or "people_id" not in peopleCheck:
                    countErrors["people"]+=1
                    return None
                people_name = peopleCheck.get("people_display_name", "")
                persInst = peopleCheck.get("people_id")

                geb, tod = CheckYear(people_name)

                timeCheck = item.get("time")

                if not timeCheck or "time_name" not in timeCheck:
                    countErrors["time"]+=1
                    return None
                time= timeCheck.get("time_name")

                place = item.get("place")
                if not place:
                    countErrors["place"]+=1
                    return None
                description = item.get("people_short_description", "")
                return{
                    "objectId": objectId,
                    "objectDatum": time,
                    "objectOrt": place,
                    "Name": people_name,
                    "persInst": persInst,
                    "Geboren": geb,
                    "Gestorben": tod,
                    "Desc": description
                }
    countErrors["eventError"]+=1
    return None

    # try:
    #     objectId = object.get("object_id", "")
    #     events = object.get("object_events", {})
    #
    #     for eventType in checkList:
    #         for item in events:
    #             if item["event_type"] == eventType:
    #                 people = item.get("people", {}) or {}
    #                 people_name = people.get("people_display_name", "")
    #                 persInst = item.get("people", "").get("people_id", "")
    #
    #                 geb, tod = CheckYear(people_name)
    #
    #                 time = item.get("time", {}).get("time_name", {})
    #                 place = item.get("place", "")
    #                 description = item.get("people_short_description", "")
    #                 return{
    #                     "objectId": objectId,
    #                     "objectDatum": time,
    #                     "objectOrt": place,
    #                     "Name": people_name,
    #                     "persInst": persInst,
    #                     "Geboren": geb,
    #                     "Gestorben": tod,
    #                     "Desc": description
    #                 }, countErrors
    #
    #
    # except BaseException as error:
    #     logging.exception("An exception was thrown!")
    #     countErrors +=1
    #     return None, countErrors
    #
    # countErrors +=1
    # return None, countErrors
    #

def CheckYear(people_name):
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

            """
            elif jahre[1][:1] == "-": #erster Eintrag, dann Todesdatum
                tod = jahre[1][-4:]
            elif jahre[1][-1:]== "-": #letzter Eintrag, dann Geburtsdatum
                geb = jahre[1][:4]
            #print(f"Geboren: {geb}, gestorben: {tod}")
            """
        if "-" in geb:
            geb = ""
        if "-" in tod:
            tod = ""
    else:
        geb = ""
        tod = ""
    return geb, tod
