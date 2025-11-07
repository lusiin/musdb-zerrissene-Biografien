import { filterSetting, artistList, updateNodeList} from "./main.js";

export function filterNodeListByRange(rangeValue) {

    Object.keys(artistList).forEach(artist => {
        let works = artistList[artist]
        let nameFilter = filterSetting.find(filter => filter.field === "name")
        if (works.length<rangeValue){
            nameFilter.values = nameFilter.values.filter(a => a !== artist)
        }
        if (works.length>= rangeValue && !nameFilter.values.includes(artist)){
            nameFilter.values.push(artist)
        }
    })

    updateNodeList(filterSetting)

}

export function filterNodeListByArtist(targetValue, artist) {
    let artistFilter = filterSetting.find(filter => filter.field ==="name")
    if (!targetValue) {
        artistFilter.values = artistFilter.values.filter(artists => artists !== artist)
    }
    if (targetValue) {
        artistFilter.valies.push(artist)
    }
    updateNodeList(filterSetting)
}

export function filterNodeListByTag(targetValue, itemtag) {
    let tagFilter = filterSetting.find(group => group.field === "tag")
    
    if (!targetValue) {
        tagFilter.values = tagFilter.values.filter(tags => tags !== itemtag)
    }
    if (targetValue) {
        tagFilter.values.push(itemtag)
    }
    updateNodeList(filterSetting)
}


    /*
    added.forEach(newNode => {
        if(!nodeList.some(node => node.id === newNode.id)){
        newNode.progress = 0;
        nodeList.push(newNode);}
    });
    /*
    const removed = nodeList.filter(node => !filteredList.some(f => f.id === node.id));
    const added   = filteredList.filter(f => !nodeList.some(n => n.id === f.id));

    for (let i = nodeList.length - 1; i >= 0; i--) {
        if (removed.some(r => r.id === nodeList[i].id)) {
            nodeList.splice(i, 1);
        }
    }

    added.forEach(newNode => {
        newNode.progress = 0;
        nodeList.push(newNode);
    });
    */