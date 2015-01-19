importScripts("math.js");

onmessage = function(e){
    var coordinates = e.data.coordinates;
    var corners = e.data.corners;
    
    var constants= getConstants(corners);
    transform(coordinates, constants);
}

function getConstants(corners){
    var x0 = corners[0];
    var y0 = corners[1];
    var x1 = corners[2];
    var y1 = corners[3];
    
    var x2 = cornerrs[4];
    var y2 = cornerrs[5];
    var x3 = cornerrs[6];
    var y3 = cornerrs[7];
    
    var u = math.matrix([x2, y2, x3, y3]);
    var M = math.matrix([
        [x0, y0, 1, 0],
        [-y0, x0, 0, 1],
        [x1, y1, 1, 0],
        [-y1, x1, 0, 1]
    ])
    
    M = math.inv(M);
    return M * u;

function transform(coordinates, constants){
    var numCoords = coordinates.length / 2;
    var x, y;
    
    for(var i=0; i<numCoords; i+=2){
        x = coordinates[i];
        y = coordinates[i+1];
        
        coordinates[i] = x*constans[0] + y*constants[1] + constants[2];
        coordinates[i] = x*constants[1] - y*constants[2] + constants[3];
    }
}
