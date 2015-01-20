onmessage = function(e){
    var contour = [];
    extractCoordinates(contour, e.data.inData, e.data.width, e.data.height);
    postMessage({"outData" : contour});
}
    
    
function extractCoordinates(contour, outData, width, height){
    var x_camera, y_camera;
    var x_grid, y_grid;
    var Ax = 0.3125;
    var Ay = -0.16666666666666666;
    var Bx = 0.0;
    var By = 80.0;
    
    for(var i=0; i<width*height; i++){
        if(outData.data[i] === 0){
            x_camera = i % width;
            y_camera = (i - x_camera) / width;
            
            x_grid =  Ax * x_camera + Bx;
            y_grid = Ay * y_camera + By;
            
            contour.push(x_grid);
            contour.push(y_grid);
            i+=3;
        }
    }
}
