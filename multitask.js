function createWorker(script, onmessage, onerror){
    var worker = new Worker(script);
    worker.onmessage = onmessage;
    worker.onerror = onerror;
    
    return worker;
}

var Job = function Job(script, data, onmessage, onerror){
    this.script = script;
    this.data = data;
    this.onmessage = onmessage;
    this.onerror = onerror;
    this.worker;
};

Job.prototype.start = function(onfinished){
    var self = this;
    
    function wrapHandler(handler){
        return function(e){
            handler(e);
            self.worker.terminate();
            self.worker = undefined;
            onfinished();
        };
    }
    
    this.onmessage = wrapHandler(this.onmessage);
    this.onerror = wrapHandler(this.onerror);
    this.worker = createWorker(this.script, this.onmessage, this.onerror);
    this.worker.postMessage(this.data);
};
        
var Scheduler = function Scheduler(){
    var self = this;
    
    self.queue = new Array();
    self.shutdown = false;   
};

Scheduler.prototype.execute = function(){
    if(this.shutdown){
        this.queue = [];
        this.shutdown = false;
        return;
    }
    
    if(this.queue.length !== 0){
        var job = this.queue.shift();
        // job.start(Scheduler.prototype.execute);
        job.start(function(){});
        return;
    }
    
    setTimeout(this.execute.bind(this), 10);
};

Scheduler.prototype.submit = function(job){
    this.queue.push(job);
};

Scheduler.prototype.kill = function(){
    this.shutdown = true;
};
