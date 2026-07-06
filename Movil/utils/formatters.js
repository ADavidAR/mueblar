export const numberSeparatorFormatter = (number, sep=",") => {
    if(!number) return 0.00
    const str = String(number)
    let periodIndex = str.indexOf(".")
    let curIndex = periodIndex === -1 ? str.length -3 : periodIndex -3 
    let lastIndex = str.length
    let numParts = []
    while (curIndex > -3) {
        numParts.push(str.substring(curIndex, lastIndex))
        lastIndex = curIndex
        curIndex -= 3
    }

    return numParts.reverse().join(sep)
}
export const tableRowContentClassNameParser = (className, contentSize) => {
    if(!Array.isArray(className))
        return Array(contentSize).fill(className)
    
    if(className.length < contentSize)
        return Array.from({length: contentSize}, (_, index) => {
            return className[index] ?? className[className.length - 1]
        })
    return className
}

export const parseAttributes = (attibrutes = []) => {

    const color = [attibrutes.filter((at) => at.attribType.id === "COLOR")[0].id]
    let materials = []
    const tempMat = attibrutes.filter((at) => at.attribType.id === "MATERIAL")
    let attribSet = new Set(tempMat.map((at) => at.id))
    attribSet.forEach((a) => {
        let sameMaterial = tempMat.filter((at) => at.id === a).map((at) => at.value)
        materials.push(`${a}: ${sameMaterial.join(",")}`)
    })

    return {
        materials,
        color: color
    }
}