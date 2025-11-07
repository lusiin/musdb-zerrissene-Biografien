import * as domConstructor from "./DomConstructor.js"

export class Node {
  constructor(objectId, tag, name, time, place, offsetBorder, colorSchema, land, imgSrc, tod) {
    this.objectId = objectId;
    this.tag = tag
    this.name = name;
    this.time = time;
    this.place = place;
    this.land = land
    this.imgSrc = imgSrc
    this.tod = tod
    this.color = colorSchema[this.tag]
    this.offsetBorder = offsetBorder
    this.imgLoaded = false

    this.progress = 0; // individueller Fortschritt
    this.sizeCircle = 13
    this.x = 0
    this.y = 0
  }
  show(cityList, xOffset, range, yOffset, i) {

    let xMapped = map(Number(this.time), 1933, 1945, 0 + this.offsetBorder.left, width - this.offsetBorder.right)
    let localRange = xMapped+range-20
    if (xMapped + i*xOffset > localRange ) {
      xOffset = 0
      yOffset += 10
    }

    let finalY = cityList[this.land][this.place]
    if (this.progress < 1) this.progress += 0.04;
    this.y = lerp(height / 2, finalY+yOffset, this.progress);
    this.x = xMapped+(i*xOffset)

    noStroke()
    fill(this.color)
    circle(this.x, this.y, this.sizeCircle)
  }
  isMouseOver() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < (this.sizeCircle)/2*0.9;
  }
  onHover(artistList, nodeList) {
    if (this.isMouseOver()) {
      this.drawCircle(20);

      // Verbindet Kunstwerke
      this.drawLine(artistList, nodeList)
      //Draw Image
      this.drawImage()
    }else{
      this.sizeCircle =13
    }
  }
  drawCircle(size){
    fill(this.color)
    this.sizeCircle = size
    circle(this.x, this.y, this.sizeCircle)
  }
  drawLine(artistList, nodeList) {
    let tmp = artistList[this.name]
    let tmpLineArray = []
    for (let objectId of tmp) {
      const node = nodeList.find(n => n.objectId === objectId);
      if (node) {
        tmpLineArray.push([node.x, node.y])
      }
    }
    /*if(Number(this.tod)< 1945){
      tmpLineArray.push(map(Number(this.tod), 1933, 1945, 0+this.offsetBorder.left, width-this.offsetBorder.right))
    }*/
    stroke("white")
    if (tmpLineArray.length > 0) {
      tmpLineArray.forEach(([xCord, yCord], i, arr) => {
        if (arr[i + 1]) {
          const [nextX, nextY] = arr[i + 1];

          line(xCord, yCord, nextX, nextY)
        }
      })
    }
  }
  drawImage() {
    if (this.imgLoaded) {
      if (this.y + this.imgFile.height<height && this.y + this.imgFile.height>0 && this.x + this.imgFile.width<width){
        image(this.imgFile, this.x, this.y, this.imgFile.width, this.imgFile.height)
      }
      if (this.y + this.imgFile.height>height){
        image(this.imgFile, this.x, this.y-this.imgFile.height, this.imgFile.width, this.imgFile.height)
      }
      if (this.x+this.imgFile.width>width){
        image(this.imgFile, this.x-this.imgFile.width, this.y, this.imgFile.width, this.imgFile.height)
      }
    } else {
      this.imgFile = loadImage(`../assets/images/${this.imgSrc}`)
      this.imgLoaded = true
      return
    }
    noStroke()
  };
  drawText() {
    fill(0)
    text(this.place, this.x + 20, this.y)
  }
  active(artistList, nodeList){
    //this.drawImage(imgList)
    stroke(1)
    this.drawCircle(20)
    this.drawLine(artistList, nodeList)
    //this.drawText()
  };

  click(artistList, nodeList, activeList, initNodeList) {
    let tmp = artistList[this.name]
    domConstructor.sidebarHandler(this.name, tmp, initNodeList)

    for (let objectId of tmp) {
      const node = nodeList.find(n => n.objectId === objectId);
      if (node) {
        activeList.push(node)
      }
    }
    return activeList
  }
  
}
export class Country {
  constructor(land, lerpedColor) {
    this.land = land
    this.color = lerpedColor
  }
  show(yPos, width, rectHeight) {
    fill(this.color)
    stroke(0.5)
    rect(0, yPos, width, rectHeight)
  }
}

export class City extends Country {
  constructor({ name, land, year }) {
    super(land);
    this.name = name;
  }
  init(yPos, stepSize, coorX, year) {
    year = this.year
    //fill(0)
    //circle(coorX, yPos+stepSize, 10)
  }
}