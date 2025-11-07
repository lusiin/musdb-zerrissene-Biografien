import requests
import json
import csv


def fetch(params, url):
    # holder json
    dataholder = []
    stw = 0

    # first request
    params.setdefault("startwert", stw)
    response = requests.get(url, params=params)

    # Execute API Fetch
    if response.status_code == 200:
        data = response.json()
        total = data[0]["total"]
        print(f"Total Objekte: {total}")

        for step in range(total):
            if stw >= total:
                break
            params["startwert"] = stw
            response = requests.get(url, params=params)
            data = response.json()
            for i in data:
                dataholder.append(i)
            #print(f"Aktueller Startwert: {stw}")
            stw += 100

    else:
        print(f"Fehler: Statuscode {response.status_code}")
        print(response.text)
        return()
    print(f"Retrieved Data Length: {len(dataholder)}")
    return dataholder

def fetchSingleObject (url, id):
    try:
        response = requests.get(f"{url}/{str(id)}", timeout=5)
        response.raise_for_status()
        if response.status_code == 200:
            data = response.json()
            return data
    except requests.exceptions.RequestException as e:
        print(f"Fehler bei der Verbindung: {e}")


