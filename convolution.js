onmessage = function(e){
    var outData = new ImageData(e.data.width, e.data.height);
    outData.data.set(e.data.inData.data);
    
    convolve3x3(e.data.inData, outData.data, e.data.width, e.data.height, e.data.kernel);

    
    
    postMessage({"outData" : outData});
};

function convolve3x3(inData, outData, width, height, kernel) {
    var idx, r, g, b, a,
    pyc, pyp, pyn,
    pxc, pxp, pxn,
    x, y,
    n = width * height,
    k00 = kernel[0][0], k01 = kernel[0][1], k02 = kernel[0][2],
    k10 = kernel[1][0], k11 = kernel[1][1], k12 = kernel[1][2],
    k20 = kernel[2][0], k21 = kernel[2][1], k22 = kernel[2][2],
    p00, p01, p02,
    p10, p11, p12,
    p20, p21, p22;
    
    //var start = new Date().getTime();
    for(idx=0;idx<n;idx++){
        y = idx % width;
        x = idx - (y * width);
        pyc = y * width * 4;
        pyp = pyc - width * 4;
        pyn = pyc + width * 4;
        if (y < 1) pyp = pyc;
        if (y >= width-1) pyn = pyc;
        pxc = x * 4;
        pxp = pxc - 4;
        pxn = pxc + 4;
        if (x < 1) pxp = pxc;
        if (x >= width-1) pxn = pxc;
        p00 = pyp + pxp; p01 = pyp + pxc; p02 = pyp + pxn;
        p10 = pyc + pxp; p11 = pyc + pxc; p12 = pyc + pxn;
        p20 = pyn + pxp; p21 = pyn + pxc; p22 = pyn + pxn;
        r = inData[p00] * k00 + inData[p01] * k01 + inData[p02] * k02
        + inData[p10] * k10 + inData[p11] * k11 + inData[p12] * k12
        + inData[p20] * k20 + inData[p21] * k21 + inData[p22] * k22;
        g = inData[p00 + 1] * k00 + inData[p01 + 1] * k01 + inData[p02 + 1] * k02
        + inData[p10 + 1] * k10 + inData[p11 + 1] * k11 + inData[p12 + 1] * k12
        + inData[p20 + 1] * k20 + inData[p21 + 1] * k21 + inData[p22 + 1] * k22;
        b = inData[p00 + 2] * k00 + inData[p01 + 2] * k01 + inData[p02 + 2] * k02
        + inData[p10 + 2] * k10 + inData[p11 + 2] * k11 + inData[p12 + 2] * k12
        + inData[p20 + 2] * k20 + inData[p21 + 2] * k21 + inData[p22 + 2] * k22;
    
        outData[idx] = r;
        outData[idx+1] = g;
        outData[idx+2] = b;
         
    }
//    var end = new Date().getTime();
//    console.log(end - start);
}
