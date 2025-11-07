import requests
import json
import time
import os
from tqdm import tqdm

zielOrdner = "images"
os.makedirs(zielOrdner, exist_ok=True)

#Endpunkt: asset.museum-digital.org
with open("data_Künstlersortierung.json", "r", encoding="utf-8") as file:
    data = json.load(file)

for artwork in tqdm(data, desc="Images"):
    """
    "subset": "owl",
    "folder": "images/201409",
    "imgSrc": "200w_25143306690.jpg",
    """
    subset = artwork["subset"]
    folder = artwork["folder"]
    image = artwork["imgSrc"]
    zielPfad = os.path.join(zielOrdner, image)
    url = f"https://asset.museum-digital.org/{subset}/{folder}/{image}"
    response = requests.get(url)
    if response.status_code == 200:
        with open(zielPfad, "wb") as file:
            file.write(response.content)
    time.sleep(0.5)

