/**
 * TODO:
 * Threshhold Slider
 */

import * as classes from "./classes.js"
import * as init from "./init.js"
import * as backgroundELement from "./backgroundELement.js"
import * as DomConstructor from "./DomConstructor.js"
import * as utils from "./utils.js"
import * as filters from "./filters.js"

//UI Elemente und Parameter
let canvas;
let offsetBorder ={
  top: 0,
  right: 250,
  bottom: 0,
  left: 100
}

let legende="Legende:\nRot: Ausdehnung 3. Reich im Nationalsozialismus\ny-Achse: Verteilung Länder nach Jahr der Machtübernahme der Nationalsozialisten"
// 2 Listen, initNodeList wird durch die async Funktion erstellt und dient als Backup, die Visualisierung basiert auf nodeList
export let initNodeList = []
export let nodeList = [];

let imgList = {}

// Listen für Klassen und Filter
let countryList = [] // Alle Instanzen von Klasse Land
let cityList = [] // Alle Instanzen von Klasse Stadt
export let artistList = {}
let cityTable = {}
let tagSet = new Set;

let activeList = [];
export let filterSetting = [
  { field: "tag", values: ["Malerei", "Skulptur", "Zeichnung"]},
  { field: "name", values: []}
];

let years = Array.from({ length: 1945 - 1933 + 1 }, (e, i) => 1933 + i);

let colorSchema = {
  bg: [13, 13, 13],
  highlight: [37, 38, 1],
  Malerei: [255, 213, 0],
  Skulptur: [158, 27, 27],
  Zeichnung: [255, 255, 255],
  countryInit: [110, 111, 115], ///165, 156, 152]
  countryGoal: [216, 216, 216],
  germanReich: [220, 30, 30, 125]
}

let länderStatistic;
let warlocation = {
  "Deutschland": 1933,
  "Jugoslawien": 1941,
  "Nederland": 1940,
  "Danmark": 1940,
  "Belgien": 1940,
  "Italia": 1933,
  "Lietuva": 1941,
  "Magyarország": 1941,
  "France": 1940,
  "Österreich": 1938,
  "Shqipëria": 1943,
  "Norge": 1940,
  "Polska": 1938
}
let sortedWarLocation
let warlocationReversed

//Values Draw
let logValue = 0.35
let minDate;

export async function setup() {
    //Erstellung Canvas --------------------------------------------------------------------------------
  const container = select("#myContainer").elt;
  const width = container.clientWidth;
  const height = container.clientHeight || window.innerHeight - document.getElementById("head").offsetHeight;
  canvas = createCanvas(width, height);
  canvas.parent("myContainer");

  // Daten laden --------------------------------------------------------------------------------
  länderStatistic = await init.loadJson("./Länderstatistik.json");

  //Überprüft aktuelle Länderstatistic mit hard coded warlocations und umgekehrt
  Object.keys(länderStatistic).forEach(land => {
    if (!(land in warlocation)) {
      console.log(`Update warlocations. Missing entry: ${land}`);
    }
  })
  
  // warlocations sortieren und zu Array transformieren
  sortedWarLocation = init.sortLocation(warlocation);
  warlocationReversed = [...sortedWarLocation].reverse(); //create [..{arr}] copy of warlocation 

  // Prozente logarithmisch berechnen
  //länderStatistic = init.calcLog(länderStatistic, logValue);
  //let total = Object.values(länderStatistic).reduce((sum, value) => sum + value, 0);
  //länderStatistic = init.calcPerc(länderStatistic, total); //calculates the percentages of every countries artworks
 

  //Klassen -------------------------------------------------------------------------------------
  //Erstellt Ausgangsliste von Objekten und Initiierung der Objekte als Nods
  ({initNodeList, countryList, cityList} = await init.init({
    initNodeList: initNodeList,
    länderStatistic: länderStatistic,
    countryList: countryList,
    cityList: cityList,
    colorSchema: colorSchema,
    offsetBorder: offsetBorder,
    warlocationReversed : warlocationReversed
  }))
  nodeList = [...initNodeList];

  // Anteile -------------------------------------------------------------------------------------
  //  Anzahl gleichzeitiger Städte pro Jahr und erstellt so die Grössen der Länderinstanzen in Prozent 
  länderStatistic = init.sortCountries(länderStatistic, initNodeList)
  let total = Object.values(länderStatistic).reduce((sum, value) => sum + value, 0);
  länderStatistic = init.calcPerc(länderStatistic, total);

  // Erstellung Object zur Ordnung von Städten und Künstler*innen -------------------------------------------------------------------------------------
  //cityTable = init.cityTable(nodeList, cityTable) //creates object for year/place/nmbr of calls
  // Städte/Werke Sortierung
  cityTable = init.cityGroups(nodeList, cityTable);
  // Künstler*innen Sortierung
  ({artistList, tagSet} = init.sortArtists(initNodeList, artistList, tagSet));

  //Filterinitiierung
  let nameFilter = filterSetting.find(filter => filter.field === "name");
Object.keys(artistList).forEach(artist => {
    if (!nameFilter.values.includes(artist)) { // Duplikate vermeiden
        nameFilter.values.push(artist);
    }
});

  //DOM Construction-------------------------------------------------------------------------------------
  // Construction Handler
  DomConstructor.initConstructor(artistList, tagSet, initNodeList, nodeList, colorSchema)

  //Berechne Werte für Draw
  minDate = Math.min(...sortedWarLocation.map(entry => entry[1]))
  //console.log(cityList)


  canvas.mousePressed(() => {
    const el = document.getElementById("sidebar")
    for (let node of nodeList) {
      if (node.isMouseOver()) {
        activeList = node.click(artistList, nodeList, activeList, initNodeList);
        offsetBorder.right = 475
        if (el) {
          el.style.display = "block";
        }
        return
      }
    }
    offsetBorder.right = 250
    if (el) {
      el.style.display = "none";
    }
    activeList = []
    });
    
}

function draw() {
  background(255)
  
  // Loader ---------------------------------------------------------------
  if (!länderStatistic) {
    text("Processing Data",width/2, height/2)
    console.log("Warte auf Daten von länderStatistic");
    return
  };
  if (!countryList || countryList.length === 0) {
    text("Processing Data",width/2, height/2)
    console.log("Warte auf Daten von countryList")
    return
  };
  
  //Background Elements ---------------------------------------------------------------
  //Preparing Data in Lists an Objects
  let coorHolder = drawData()

  //Zeichnung Hintergrund ---------------------------------------------------------------
  drawCountry(coorHolder)
  backgroundELement.germanReich({ coorHolder: coorHolder, colorSchema: colorSchema, offsetBorder: offsetBorder, warlocationReversed: warlocationReversed, minDate: minDate })
  backgroundELement.grid(years, offsetBorder);

  //Zeichnung Vordergrund ---------------------------------------------------------------
  let range = map(1934, 1933, 1944, 0+offsetBorder.left, width-offsetBorder.right)-map(1933, 1933, 1945, 0+offsetBorder.left, width-offsetBorder.right)
  const activeIds = new Set(nodeList.map(n => n.objectId));

  Object.keys(cityTable).forEach(time => {
    Object.keys(cityTable[time]).sort().forEach(location => {
      let xOffset = 20
      let yOffset = 0
      for (let [i, node] of cityTable[time][location].entries()) {
        if (activeIds.has(node.objectId)) {
    node.show(cityList, xOffset, range, yOffset, i);
  }
      }
    })
  })

  for (let node of nodeList) {
    node.onHover(artistList, nodeList);
  }
  for (let node of activeList){
    node.active(artistList, nodeList)
  }

  //Text
  Object.keys(coorHolder).forEach(land => {
    let data = coorHolder[land];
    noStroke();
    fill(255);
    textAlign(RIGHT, CENTER)
    textSize(12);
    text(land, width - 20, data.yPos + data.rectHeight / 2);
  })
  textAlign(RIGHT, BOTTOM);
  text(legende, width-offsetBorder.right+240, height-10)

  //Performance Check ---------------------------------------------------------------
  //Framerate 
  /*
  let fps = getFrameRate();
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP)
  text("FPS: " + fps.toFixed(1), 10, 10);
  */
}

/**
 * Creates an Object, which hold all the drawing-data requried for each country
 * @returns object with data to draw: 
 * yPos, rectHeight
 */
function drawData() {
  let yPos = offsetBorder.top;
  let coorHolder = {}
  sortedWarLocation.forEach(([land, date]) => {
    if (!(land in länderStatistic)) return;
    let percentage = länderStatistic[land]/100;
    let rectHeight = percentage * (height-offsetBorder.top-offsetBorder.bottom);
    coorHolder[land] = {
      "yPos": yPos,
      "rectHeight": rectHeight
    }

    let stepSize = rectHeight / Object.keys(cityList[land]).length
  
    Object.keys(cityList[land]).forEach((city, i) => {
      cityList[land][city] = yPos + i * stepSize
    })
    yPos += rectHeight
  })

  return coorHolder
}

/**
 * Draws the lands
 * @param {*} land 
 * @param {*} yPos 
 * @param {*} rectHeight 
 */
function drawCountry(coorHolder) {
  Object.keys(coorHolder).forEach(land => {
    let data = coorHolder[land];
    let countryInit = countryList.find(c => c.land === land);
    countryInit.show(data.yPos, width, data.rectHeight)
  });
}

export function windowResized() {
  const container = select("#myContainer").elt;
  const bounds = container.getBoundingClientRect();
  resizeCanvas(bounds.width, bounds.height);
}


export function updateNodeList(filterSetting) {

    let filteredList = initNodeList.filter(node => {
        return filterSetting.every(filter => {
            const fieldValue = node[filter.field];
            // Prüfen, ob Filter leer ist oder der Wert enthalten ist
            return !filter.values || filter.values.length === 0 || filter.values.includes(fieldValue);
        });
    });
    let added = filteredList.filter(fNodes => !nodeList.includes(fNodes))
    added.forEach(aNode => aNode.progress=0)
    nodeList = filteredList
  
}


window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;