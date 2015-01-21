onmessage = function(e){
    var imageData = new ImageData(e.data.width, e.data.height);
    var coord = [];
    imageData.data.set(e.data.inData.data);
    blackedges(e.data.cutoff, e.data.inData.data, imageData.data, e.data.width, e.data.height, e.data.sx, e.data.sy, e.data.tx, e.data.ty, coord, e.data.filter, e.data.findEdges);
    postMessage({"outData" : coord});
};

// A 3x3 Sobel edge detect (similar to Photoshop's)
function blackedges(cutoff, inData, outData, width, height, sx, sy, tx, ty, coord, filterFlag, edgeFlag) {
    // findblack
    var x_camera, y_camera;
    var x_grid, y_grid;
    var Ax = 0.3125;
    var Ay = -0.16666666666666666;
    var Bx = 0.0;
    var By = 80.0;
    var n = width * height * 4,
    midData = [],
    r, g, b;

    if(filterFlag){
        for (var i=0;i<n;i+=4) {
            r = inData[i];
            g = inData[i+1];
            b = inData[i+2];

            if (Math.max(r/255, g/255, b/255) <= cutoff) {
                outData[i] = 0;
                outData[i+1] = 0;
                outData[i+2] = 0;
                outData[i+3] = 255;
            } else {
                outData[i] = 255;
                outData[i+1] = 255;
                outData[i+2] = 255;
                outData[i+3] = 255;
            }
        }
    }

    if(edgeFlag){
        // blackedges: apply findedges to findblack
        var i,
        outline = [],
        j = 0,
        r, c,
        data1 = [],
        data2 = [],
        gr1, gr2, gg1, gg2, gb1, gb2,
        prog, lastProg = 0,
        convProgress1, convProgress2;

        convolve3x3(outData, data1, width, height,
            [[-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]]
        );
        convolve3x3(outData, data2, width, height,
            [[-1, -2, -1],
            [ 0,  0,  0],
            [ 1,  2,  1]]
        );

        for (i=0;i<n;i+=4) {
            gr1 = Math.abs(data1[i]);
            gr2 = Math.abs(data2[i]);
            gg1 = Math.abs(data1[i+1]);
            gg2 = Math.abs(data2[i+1]);
            gb1 = Math.abs(data1[i+2]);
            gb2 = Math.abs(data2[i+2]);

            outData[i] = 255 - (gr1 + gr2) * 0.8;
            outData[i+1] = 255 - (gg1 + gg2) * 0.8;
            outData[i+2] = 255 - (gb1 + gb2) * 0.8;
            outData[i+3] = inData[i+3];
        }

        // wipe out bottom black edge
        for (k=4*width*(height-1);k<4*width*height;k++) {
            outData[k] = 255;
        }
    }

    for(var i=0; i<n; i++){
        if(outData[i*4] === 0){
            x_camera = i % width;
            y_camera = (i - x_camera) / width;

            x_camera = sx * x_camera + tx;
            y_camera = sy * y_camera + ty;

            x_grid =  Ax * x_camera + Bx;
            y_grid = Ay * y_camera + By;

            coord.push(Math.floor(x_grid));
            coord.push(Math.floor(y_grid));
        }
    }
}

function convolve3x3(inData, outData, width, height, kernel, progress, alpha, invert, mono) {
    var idx, r, g, b, a,
    pyc, pyp, pyn,
    pxc, pxp, pxn,
    x, y,
    prog, lastProg = 0,
    n = width * height * 4,
    k00 = kernel[0][0], k01 = kernel[0][1], k02 = kernel[0][2],
    k10 = kernel[1][0], k11 = kernel[1][1], k12 = kernel[1][2],
    k20 = kernel[2][0], k21 = kernel[2][1], k22 = kernel[2][2],
    p00, p01, p02,
    p10, p11, p12,
    p20, p21, p22;
    for (y=0;y<height;++y) {
        pyc = y * width * 4;
        pyp = pyc - width * 4;
        pyn = pyc + width * 4;
        if (y < 1) pyp = pyc;
        if (y >= width-1) pyn = pyc;
        for (x=0;x<width;++x) {
            idx = (y * width + x) * 4;
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
            if (alpha) {
                a = inData[p00 + 3] * k00 + inData[p01 + 3] * k01 + inData[p02 + 3] * k02
                + inData[p10 + 3] * k10 + inData[p11 + 3] * k11 + inData[p12 + 3] * k12
                + inData[p20 + 3] * k20 + inData[p21 + 3] * k21 + inData[p22 + 3] * k22;
            } else {
                a = inData[idx+3];
            }
            if (mono) {
                r = g = b = (r + g + b) / 3;
            }
            if (invert) {
                r = 255 - r;
                g = 255 - g;
                b = 255 - b;
            }
            outData[idx] = r;
            outData[idx+1] = g;
            outData[idx+2] = b;
            outData[idx+3] = a;
            if (progress) {
                prog = (idx/n*100 >> 0) / 100;
                if (prog > lastProg) {
                    lastProg = progress(prog);
                }
            }
        }
    }
}
