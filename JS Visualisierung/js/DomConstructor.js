import * as utils from "./utils.js";
import { filterNodeListByArtist, filterNodeListByTag } from "./filters.js";
import { filterNodeListByRange as filterNodeListByRange } from "./filters.js";

let debounceTimer;

export function initConstructor(artistList, tagSet, initNodeList, nodeList, colorSchema, filterSetting){

  //Create DomELements
  RadioButton(tagSet, initNodeList, nodeList, colorSchema, filterSetting)
  ArtistFilter(artistList, filterSetting)
  //ButtonConstructor({input:tagSet})
  Slider(artistList, filterSetting)

  //Abschluss
  InitCheckButtons(tagSet, artistList)
}

/**
 *Dynamic creation of HTML checkboxes in Index 

    index.html before code
    <div class="dropdown">
    </div>

    Buttons:
    <label class="round-checkbox">
        <input type="checkbox" checked>
        <span class="checkmark"></span>
    </label>
 * @param {*} tagSet 
 * @param {*} colorSchema 
 */
function RadioButton(tagSet, initNodeList, nodeList, colorSchema, filterSetting){
   tagSet.forEach(tag => {
    //Create Elements
    const label = document.createElement("label");
    label.classList.add("round-checkbox");
    label.setAttribute("id", `label-${tag}`)

    const input = document.createElement("input");
    input.type = "checkbox"
    input.setAttribute('id', `filter-${tag}`);

    input.addEventListener("change", (e) => {
      if (e.target.checked) {
        filterNodeListByTag(e.target.checked, tag, initNodeList, nodeList, filterSetting)
        console.log(e.target.checked, `${tag} wurde aktiviert`);
      } else {
        filterNodeListByTag(e.target.checked, tag, initNodeList, nodeList, filterSetting)
        console.log(e.target.checked, `${tag} wurde deaktiviert`);
      }
    });

    const span = document.createElement("span")
    span.classList.add("checkmark")

    //Text
    const text = document.createTextNode(tag);

    //styling
    var style = document.createElement('style');
    style.innerHTML = `
        #label-${tag}{
            display: block;
            padding: 4px;
            margin: 0;
            background-color: rgb(${colorSchema[tag].join(',')});
        }
        .checkmark {
        }
    `
    document.head.appendChild(style)
    
    //Hierarchie
    label.appendChild(input);
    label.append(text)
    label.appendChild(span);

    document.getElementById("tag-dropdown").appendChild(label);
   })
  }

function ArtistFilter(artistList){
  const label = document.createElement("label");
  label.classList.add("round-checkbox");
  label.setAttribute("id", `label}`)

  const input = document.createElement("input");
  input.type = "checkbox"
  input.setAttribute('id', `Hauptschalter`);
  const span = document.createElement("span")
  span.classList.add("checkmark")

  //Text
  const text = document.createTextNode(`Leer`);


  Object.keys(artistList).forEach(artist =>{

    const label = document.createElement("label");
    label.classList.add("round-checkbox");
    let safeId = artist.replace(/\s+/g, "-");
    label.setAttribute("id", `label-${safeId}`)

    const input = document.createElement("input");
    input.type = "checkbox"
    input.setAttribute('id', `filter-${safeId}`);

    input.addEventListener("change", (e) => {
      if (e.target.checked) {
        filterNodeListByArtist(e.target.checked, artist)
        console.log(e.target.checked, `${artist} wurde aktiviert`);
      } else {
        filterNodeListByArtist(e.target.checked,artist)
        console.log(e.target.checked, `${artist} wurde deaktiviert`);
      }
    });

    const span = document.createElement("span")
    span.classList.add("checkmark")

    //Text
    const text = document.createTextNode(`${artist}: (${artistList[artist].length})`);

    //Hierarchie
    label.appendChild(input);
    label.append(text)
    label.appendChild(span);

    document.getElementById("artist-dropdown").appendChild(label);

  })
}

/**
 * Aktiviert die Filter UIs
 * @param {*} tagSet 
 * @param {*} artistList 
 */
function InitCheckButtons(tagSet, artistList){
  tagSet.forEach(tag => {
    //console.log(`filter-${tag}`)
    let element = document.getElementById(`filter-${tag}`)
    element.checked = true
  })
  Object.keys(artistList).forEach(artist =>{
    let safeId = artist.replace(/\s+/g, "-");
    let element = document.getElementById(`filter-${safeId}`)
    element.checked = true
  })
  }


function Slider(artistList){

  const maxLength = Math.max(...Object.values(artistList).map(arr => arr.length));

  let parent = document.getElementById("slider-container")
  let slider = document.createElement("input")
  slider.title = "Anzeige Künstler*Innen nach Werkanzahl"
  slider.id = "slider"
  slider.type = "range"
  slider.min = 1;
  slider.max = maxLength;
  slider.value= 5;

  let valueBox = document.createElement("span");
  valueBox.id = "slider-value";
  valueBox.textContent = slider.value;
  for (let i =51; i>=5; i--){
    filterNodeListByRange(i)
  }
  parent.appendChild(slider)
  parent.appendChild(valueBox);
  slider.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {

      filterNodeListByRange(document.getElementById("slider").value)

      valueBox.textContent = document.getElementById("slider").value
    }, 10);

  })

}

export function sidebarHandler(name, artistChoice, initNodeList){
  utils.toggleDropdown("sidebar")

  let sidebar = document.getElementById("sidebar-content")
  let titelHolder = document.createElement("h1")
  let titelText = document.createTextNode(name)

  titelHolder.appendChild(titelText)
  sidebar.innerHTML = ""

  sidebar.appendChild(titelHolder)
  artistChoice.forEach(objectId => {
    console.log(objectId)
    const node = initNodeList.find(n => n.objectId === objectId);
    if (node) {
      let link = `https://global.museum-digital.org/object/${node.objectId}`;
      let imageHTML = new Image()
      imageHTML.src = `/assets/images/${node.imgSrc}`
      imageHTML.addEventListener("click", () => openTab(link))
      document.getElementById("sidebar-content").appendChild(imageHTML);
      imageHTML.style.width = "100%";   // nimmt die ganze Breite des Parent-Elements
      imageHTML.style.height = "auto";  // Höhe proportional zur Breite
      imageHTML.style.objectFit = "contain"; // Bild wird skaliert, ohne verzerrt zu werden
    }
  })
}

function openTab(link){
  window.open(link, "_blank")
}