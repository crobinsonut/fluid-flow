onmessage = function(e){
    var outData = new ImageData(e.data.width, e.data.height);
    outData.data.set(e.data.inData.data);
    filter(e.data.cutoff, e.data.inData.data, outData.data, e.data.width, e.data.height);
    postMessage({"outData" : outData});
};

function filter(cutoff, inData, outData, width, height){
    var n = width * height * 4;
    var r,g,b,a;
    var value;
    
    a = 255;
    
    for(var i = 0; i<n; i+=4){
        r = inData[i] / 255;
        g = inData[i + 1] / 255;
        b = inData[i + 2] / 255;
        a = 255;
        
        value = Math.max(r, g, b);
        value = value <= cutoff ? 0 : 255 ;
        
        outData[i] = value;
        outData[i + 1] = value;
        outData[i + 2] = value;
        outData[i + 3] = a;
    }
}
