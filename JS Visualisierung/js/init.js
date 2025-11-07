import { Node } from "./classes.js";
import * as DomConstructor from "./DomConstructor.js"
import * as backgroundELement from "./backgroundELement.js"

export async function loadJson(json) {
  const response = await fetch(json);
  return response.json()
}

/**
 * Parses JSON and creates all forms of Elements for DOM and P5js classes
 * @param {*} param0 
 * @returns 
 */
export async function init({
    initNodeList: initNodeList,
    länderStatistic: länderStatistic,
    countryList: countryList,
    cityList: cityList,
    colorSchema: colorSchema,
    offsetBorder: offsetBorder,
    warlocationReversed: warlocationReversed
  }){
  const objectList = await loadJson("./data_Künstlersortierung.json");
  objectList.forEach((object) => {
    initNodeList.push(getData(object, colorSchema, offsetBorder))
  })

  //Create Country Classes
  countryList = backgroundELement.countryGrid({
    länderStatistic,
    countryList,
    colorSchema,
    warlocationReversed
  });

  //Create inital object with lands and citys
  cityList = backgroundELement.cityGrid({
    initNodeList: initNodeList,
    cityList : cityList
  })

  return {
    initNodeList,
    countryList,
    cityList
  }
  }

/**
 * Gets Data for each Node and creates Classes of Node
 * @param {*} object
 * @param {*} colorSchema 
 * @param {*} offsetBorder 
 * @returns List of classes Node
 */
function getData(object, colorSchema, offsetBorder){

  let objectId = object.objectId
  let tagId = object.tag_id;
  let name = object.Name;
  let objectDatum = object.objectDatum;
  let place = object.objectOrt.place_name;
  let land = object.Land;
  let imgSrc = object.imgSrc;
  let tod = object.Gestorben
  
  let objectNode = new Node(
    objectId,
    tagId,
    name,
    objectDatum,
    place,
    offsetBorder,
    colorSchema,
    land,
    imgSrc,
    tod
  );
  return objectNode
}

export function cityTable(nodeList, cityTable){
  for (let node of nodeList) {
    let place = node.place
    let time = node.time

    // Falls der Zeit-Eintrag fehlt → neu anlegen
    if (!(time in cityTable)) {
      cityTable[time] = {};
    }

    // Falls der Ort fehlt → auf 1 setzen
    if (!(place in cityTable[time])) {
      cityTable[time][place] = {"count" : 1,
        "iterator" : 0
      }
    }
    // Falls Ort schon existiert → hochzählen
    else {
      cityTable[time][place]["count"] += 1;
    }
  }
  return cityTable
}

export function cityGroups(nodeList, cityTable){
  for (let node of nodeList){
    let place = node.place
    let time = node.time
    if (!(time in cityTable)) {
      cityTable[time] = {};
    }
    if (!(place in cityTable[time])){
      cityTable[time][place] = []
    }
    cityTable[time][place].push(node)
  }
  return cityTable
}

export function sortArtists(initNodeList, artistList, tagSet){
  initNodeList.forEach((artWork) =>{
    tagSet.add(artWork.tag)
    if (!artistList[artWork.name]) {
        artistList[artWork.name] = [];
        }
    artistList[artWork.name].push(artWork.objectId)
  }); 
  
  Object.keys(artistList).forEach(artist =>{
    let sortedArtworks = artistList[artist].sort((a,b)=> (initNodeList.find(node => node.objectId === a)).time - (initNodeList.find(node => node.objectId === b)).time)
    artistList[artist] = sortedArtworks
  })
  return { artistList, tagSet };

}

/**
 * Calcs Percentages
 * @param {*} länderStatistic 
 * @returns % of artists per country
 */
export function calcPerc(länderStatistic, total){
  //console.log("vor Prozentberechnung", länderStatistic)
  Object.keys(länderStatistic).forEach(land =>
    länderStatistic[land] = länderStatistic[land]*100/total
  )
  //console.log("nach Prozentberechnung", länderStatistic)
  return länderStatistic
}
/**
 * Sortiert nach Ländern -> Städten und Anzahl Einträge
 * @param {*} länderStatistic 
 * @param {*} initNodeList 
 * @returns 
 */
export function sortCountries(länderStatistic, initNodeList){
  let tmpCityCount={};
  initNodeList.forEach(node =>{
    if(!(node.land in tmpCityCount)){
      tmpCityCount[node.land] = {}
    }
    if(!(node.time in tmpCityCount[node.land])){
      tmpCityCount[node.land][node.time]=1
    }
    else{
      tmpCityCount[node.land][node.time]+=1
    }
  })
  Object.keys(tmpCityCount).forEach(land => {
    let tmpArrayHolder = []
    Object.keys(tmpCityCount[land]).forEach(year =>{
      tmpArrayHolder.push(tmpCityCount[land][year])}
    )
    let max = (Math.max(...tmpArrayHolder))
    tmpCityCount[land] = max
  })
  länderStatistic= tmpCityCount
  return länderStatistic
}


export function calcLog(länderStatistic, logValue) {
  //console.log("Werte absolut", länderStatistic)
  Object.keys(länderStatistic).forEach(land => {
      länderStatistic[land] = Math.log(logValue * länderStatistic[land] + 1)
  })
  //console.log("Logarithm applied", länderStatistic)
  return länderStatistic
}

/**
 * Sort by date
 * @param {*} warlocation 
 * @returns 
 */
export function sortLocation(warlocation){

//Extract data from warlocation and sort by date
    let sortedLocation = []
    Object.keys(warlocation).forEach(land => {
        sortedLocation.push([land,warlocation[land]])
    });
    
    sortedLocation.sort(function(a, b) {
      if (b[0] === "Deutschland") return -1;
      if (a[0] === "Deutschland") return 1;
        return b[1] - a[1];
    });
    return sortedLocation
  }