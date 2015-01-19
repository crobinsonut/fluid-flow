importScripts("multitask.js");

var Filter = (function(){
    function Filter(){
        var script = script;
        Filter.apply(this, "filter.js");
    }
    
    Filter.prototype = Object.create(Process.prototype);
    Filter.prototype.constructor = Filter;
    
    Filter.prototype.onmessage = function(e){
        console.log("yay");
    };
    
    Filter.prototype.onerror = function(e){
        console.log("boo");
    };
    
    return Filter;
})();
