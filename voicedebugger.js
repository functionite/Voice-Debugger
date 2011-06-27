/*jslint sloppy: true, vars: true, white: true, plusplus: true, newcap: true */

/*
voicedebugger.js - debug with a voice ;-)
Copyright (c) 2011 Damian Wielgosik (me@varjs.com)
Inspiration brought from a talk with Ard (http://twitter.com/ard)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function () {
    var audio;
    var path = "audio/";
    var format = ".wav";
    
    var errorTypes = {
        "notdefined" : [/is not defined/g],
        "syntax" : [/syntax error/g],
        "token" : [/Unexpected token/g],
        "nofunction" : [/has no method/g, /is not a function/g],
        "propundefined" : [/is undefined/g, /of undefined/g],
        "error" : [/Uncaught Error/g, /Error/g]
    };
    
    var defaultError = "error";
    
    var getErrorType = function(msg) {
        for (var i in errorTypes) {
            for (var j = 0, jlen = errorTypes[i].length; j < jlen; j++) {
                if (errorTypes[i][j].test(msg)) {
                    return i;
                }
            }
        }
        
        return defaultError;
    };
    
    var prepareLines = function(line) {
        line = parseInt(line, 10);
        
        var arr = [];
        var r;
        var j = 0;
        var lvl = 0;
        
        if (!isNaN(line)) {
            while (line > 0) {
                r = parseInt(line % 10, 10);
                line = parseInt(line / 10, 10);
                if (j === 0 && (line % 100 !== 0 || r !== 0)) {
                    if (lvl !== 0) {
                        arr.unshift(Math.pow(1000, lvl));
                    }
                }
            
                if (j === 0 && line % 10 !== 1) { 
                    if (r !== 0) {
                        arr.unshift(r);
                    }
                }
            
                if (j === 0 && line % 10 === 1) {
                    arr.unshift(10 + r);
                    line = parseInt(line / 10, 10);
                    j += 2;
                    continue;
                }
            
                if (j === 1) {
                    if (r !== 0) {
                        arr.unshift(r * 10);
                    }
                } else if (j === 2) {
                    if (r !== 0) {
                        arr.unshift(100);
                        arr.unshift(r);
                    }
        
                    j=-1;
                    lvl++;
                }
                j++;
            }
        
            arr.unshift("line");
        }
        return arr;
    };
    
    var play = function(options) {
        if (typeof options.line !== "undefined" && typeof options.msg === "string") {
            window.setTimeout(function() {
                var lines = prepareLines(options.line);
                if (lines.length) {
                    var callback = function() {
                        window.setTimeout(function() {
                            audio.src = path + lines.shift() + format;
                            audio.play();
                        }, 100);
                    };
                    audio.addEventListener("ended", callback, false);
                    audio.src = path + getErrorType(options.msg) + format;
                    audio.play();
                }
            }, 600);
        }
    };
    
    window.onload = function() {
        audio = document.createElement("audio");
        document.body.appendChild(audio);
    };
    
    window.onunload = function() {
        audio = null;
    };
     
    window.onerror = function() {
        play({
            line: arguments[2],
            msg: arguments[0]
        });
    };

})();