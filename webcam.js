(function() {
    
    onmessage = function(e){
        updateContour(e.data.inData, e.data.width, e.data.height);
    };
    
    function updateContour(inData, width, height) {
        var contour = [];
        var outData = new ImageData(width, height);
        
        filter(0.2, inData.data, outData.data, width, height);
        inData.data.set(outData.data);
        
        outData = new ImageData(width, height);
        findEdges(inData.data, outData.data, width, height);
        //inData.data.set(outData.data);
        for (var k=4*width*(height-1);k<4*width*height;k++) {
            outData.data[k] = 255;
        }
        
        for(var i=0; i<width*height; i++){
            if(outData.data[i] === 0){
                contour.push(i % width);
                contour.push(i % height);
                i+=3;
            }
        }
        
        postMessage(contour);
    }
})();
