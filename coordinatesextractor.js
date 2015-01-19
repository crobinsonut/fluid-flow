onmessage = function(e){
    var contour = [];
    extractCoordinates(contour, e.data.inData, e.data.width, e.data.height);
    postMessage(contour);
}
    
    
function extractCoordinates(contour, outData, width, height){
    var row;
    var column;
    for(var i=0; i<width*height; i++){
        if(outData.data[i] === 0){
            column = i % width;
            row = (i - column) / width;
            
            contour.push(row);
            contour.push(column);
            i+=3;
        }
    }
}
