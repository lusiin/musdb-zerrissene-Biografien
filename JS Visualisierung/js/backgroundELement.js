import * as jsonParser from "./init.js";
import { Country, City } from "./classes.js";
import { initConstructor } from "./DomConstructor.js";

export function grid(years, offsetBorder) {
    //Basic grid
    stroke(255)
    line(10, height / 2, width - 10, height / 2);

    //grid years
    years.forEach((year) => {
        push();
        fill(255)
        let x = map(year, 1933, 1945, 0 + offsetBorder.left, width - offsetBorder.right)
        line(x, height / 2 + 50, x, height / 2 - 50)
        //rotate(PI/4)
        textAlign(LEFT, CENTER)
        noStroke()
        text(year, x +10, height / 2+40)
        pop();
    })
}
 /**
  * Creates Countries classes
  * @param {*} param0 
  * @returns 
  */
export function countryGrid({ länderStatistic, countryList, colorSchema, warlocationReversed}) {

    let startColor = color(...colorSchema["countryInit"]);  // spread operator
    let finishColor = color(...colorSchema["countryGoal"]);

    warlocationReversed.forEach((entry, index) =>{
        const [land, date] = entry
        let lerpPos = Object.keys(länderStatistic).length === 1 ? 1 : index / (Object.keys(länderStatistic).length - 1);
        let lerpedColor = lerpColor(startColor, finishColor, lerpPos)
        
        let country = new Country(land, lerpedColor)
        countryList.push(country)
    })
    return countryList
}
/**
 * inits citygrid with y value of 0 (y value in draw)
 * @param {*} param0 
 * @returns 
 */
export function cityGrid({initNodeList, cityList}){
    initNodeList.forEach(node => {
        if (!(node.land in cityList)){
            cityList[node.land] = {[node.place] : 0};
        }
        else{
            cityList[node.land][node.place] = 0;
        }
    })
    return cityList
}
/**
 * /*
    Creates background for expansion of the german reich

 * @param {*} param0 
 */
export function germanReich({ coorHolder, colorSchema, offsetBorder, warlocationReversed, minDate }) {

    let vertices = []

    warlocationReversed.forEach(([land, date], i, warlocationReversed)  => {

        let data = coorHolder[land]
        if (!data) {
            return;
        }
        let coorX = map(date, 1933, 1945, 0 + offsetBorder.left, width - offsetBorder.right)
        let coorY = data.yPos
        
        vertices.push([coorX, coorY])
        if (warlocationReversed[i+1] && warlocationReversed[i+1][1] !== date){
            let coorXnext = map(warlocationReversed[i+1][1], 1933, 1945, 0+ offsetBorder.left, width - offsetBorder.right)
            vertices.push([coorXnext, coorY])
        }
        //vertices.push([coorX+20, coorY])
    })
    let [fland, fyear] = warlocationReversed[1]; 
    noStroke()
    let color = colorSchema["germanReich"]
    fill(color)
    beginShape()
        vertex(0, coorHolder[fland].yPos)
        vertex(100,coorHolder["Italia"].yPos)
        vertices.forEach(([coorX, coorY]) => {
            vertex(coorX, coorY)
        })
        vertex(width, 0+offsetBorder.top)
        vertex(width, height-offsetBorder.bottom)
        vertex(0, height-offsetBorder.bottom)
    endShape(CLOSE)
}
