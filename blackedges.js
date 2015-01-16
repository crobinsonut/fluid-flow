  blackedges : function(inData, outData, width, height, options, progress) {
          // findblack

          var n = width * height * 4,
          midData = [],
          r, g, b;

          for (var i=0;i<n;i+=4) {
            r = inData[i];
            g = inData[i+1];
            b = inData[i+2];

            if (Math.max(r/255, g/255, b/255) <= options.value) {
              midData[i] = 0;
              midData[i+1] = 0;
              midData[i+2] = 0;
              midData[i+3] = inData[i+3];
            } else {
              midData[i] = 255;
              midData[i+1] = 255;
              midData[i+2] = 255;
              midData[i+3] = inData[i+3];
            }
          }

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

          convolve3x3(midData, data1, width, height,
            [[-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]]
          );
          convolve3x3(midData, data2, width, height,
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

            if (progress) {
              prog = 0.8 + (i/n*100 >> 0) / 100 * 0.2;
              if (prog > lastProg) {
                lastProg = progress(prog);
              }
            }

          // wipe out bottom black edge
          for (k=4*width*(height-1);k<4*width*height;k++) {
            outData[k] = 255;
          }

          for (i=0;i<n;i+=4) {
            if (outData[i] == 0) {
              // outline[j] = i;     // r-coordinate
              outline[j] = i/4;   // pixel coordinate

              // convert to 2D-coordinates
              r = Math.floor(outline[j]/width);
              c = outline[j]-(r*width);
              var rcblackpix = [];
              rcblackpix[j] = [r,c];
              ++j;
            }
          }

          //console.dir(window.rcblackpix);
          // console.log(rcblackpix.max)

          // console.dir(outData)
          // console.dir(outline);

          // console.log("width " + width)
          // console.log("height " + height)

          // find rectangle vertices
          // mmin = outline.max
          // mmax = outline.max
          // nmin =
          // nmax =
        },
