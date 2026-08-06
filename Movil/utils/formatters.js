// Agrupa un número en bloques de 3 dígitos desde la derecha (separador de
// miles), sin tocar la parte decimal.
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
// Normaliza `className` a un array de `contentSize` clases (una por
// columna de la fila): si viene un solo string lo repite, si viene un
// array corto rellena con la última clase.
export const tableRowContentClassNameParser = (className, contentSize) => {
    if(!Array.isArray(className))
        return Array(contentSize).fill(className)
    
    if(className.length < contentSize)
        return Array.from({length: contentSize}, (_, index) => {
            return className[index] ?? className[className.length - 1]
        })
    return className
}

// De los `attribs` de una variación, saca el id de color y agrupa los
// materiales por atributo (ej. "madera: Roble,Nogal").
export const parseAttributes = (attributes = []) => {
    const color = [attributes.filter((at) => at.attribType === "COLOR")[0].value]
    let materials = []
    const tempMat = attributes.filter((at) => at.attribType === "MATERIAL")
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