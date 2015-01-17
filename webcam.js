(function() {
    
    var streaming = false,
    video        = document.querySelector('#video'),
    canvas       = document.querySelector('#canvas'),
    startbutton  = document.querySelector('#startbutton');
    
    navigator.getMedia = ( navigator.getUserMedia || 
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
        
        navigator.getMedia(
        { 
            video: true, 
            audio: false 
        },
        function(stream) {
            if (navigator.mozGetUserMedia) { 
                video.mozSrcObject = stream;
            } else {
                var vendorURL = window.URL || window.webkitURL;
                video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
            }
            video.play();
        },
        function(err) {
            console.log("An error occured! " + err);
        }
    );
    
    video.addEventListener('loadedmetadata', function(ev){
        var height = video.clientHeight;
        var width = video.clientWidth;
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
    }, false);
    
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
    
    // A 3x3 Sobel edge detect (similar to Photoshop's)
    function findEdges(inData, outData, width, height, options, progress) {
        var n = width * height * 4,
        i,
        data1 = [],
        data2 = [],
        gr1, gr2, gg1, gg2, gb1, gb2,
        prog, lastProg = 0,
        convProgress1, convProgress2;
        
        if (progress) {
            convProgress1 = function(p) {
                progress(p * 0.4);
                return p;
            };
            convProgress2 = function(p) {
                progress(0.4 + p * 0.4);
                return p;
            };
        }
        convolve3x3(inData, data1, width, height,
            [[-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]]
        );
        convolve3x3(inData, data2, width, height,
            [[-1, -2, -1],
            [ 0, 0, 0],
            [ 1, 2, 1]]
        );
        for (i=0;i<n;i+=4) {
            gr1 = data1[i];
            gr2 = data2[i];
            gg1 = data1[i+1];
            gg2 = data2[i+1];
            gb1 = data1[i+2];
            gb2 = data2[i+2];
            if (gr1 < 0) gr1 = -gr1;
            if (gr2 < 0) gr2 = -gr2;
            if (gg1 < 0) gg1 = -gg1;
            if (gg2 < 0) gg2 = -gg2;
            if (gb1 < 0) gb1 = -gb1;
            if (gb2 < 0) gb2 = -gb2;
            outData[i] = 255 - (gr1 + gr2) * 0.8;
            outData[i+1] = 255 - (gg1 + gg2) * 0.8;
            outData[i+2] = 255 - (gb1 + gb2) * 0.8;
            outData[i+3] = inData[i+3];
            if (progress) {
                prog = 0.8 + (i/n*100 >> 0) / 100 * 0.2;
                if (prog > lastProg) {
                    lastProg = progress(prog);
                }
            }
        }
        
        return outData;
    }
    
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
    
    function takepicture() {
        var outData;
        var inData, outData;
        var width, height;
        var n;
        var cv2;
        
        cv2 = document.createElement('canvas');
        width = canvas.width;
        height = canvas.height;
        
        cv2.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        inData = cv2.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        outData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        
        filter(0.2, inData.data, outData.data, width, height);
        inData.data.set(outData.data);
        findEdges(inData.data, outData.data, width, height);
        
        
        canvas.getContext('2d').putImageData(outData, 0, 0);
        //var data = canvas.toDataURL('image/png');
        //photo.setAttribute('src', data);
    }
    
    startbutton.addEventListener('click', function(ev){
        takepicture();
        ev.preventDefault();
    }, false);
    
})();
