var Job = function Job(script, data, onmessage, onerror){
    this.script = script;
    this.data = data;
    this.onmessage = onmessage;
    this.onerror = onerror;
    this.worker;
};

Job.prototype.start = function(onfinished){
    function wrapHandler(handler, worker){
        return function(e){
            handler(e);
            onfinished();
            worker.terminate();
            worker = undefined;
        };
    }
    
    this.worker = new Worker(this.script);
    this.worker.onmessage = wrapHandler(this.onmessage, this.worker);
    this.worker.onerror = wrapHandler(this.onerror, this.worker);
    this.worker.postMessage(this.data);
};
        
var Scheduler = function Scheduler(){
    this.started = false;
    this.queue = new Array();
    this.shutdown = false;   
};

Scheduler.prototype.start = function(){
    if(this.started === false){
        this.started = true;
        this.execute();
    }
}

Scheduler.prototype.execute = function(){
    if(this.shutdown){
        this.queue = [];
        this.shutdown = false;
        return;
    }
    
    if(this.queue.length !== 0){
        var job = this.queue.shift();
        // job.start(Scheduler.prototype.execute);
        job.start(this.execute.bind(this));
        return;
    }
    
    setTimeout(this.execute.bind(this), 10);
};

Scheduler.prototype.submit = function(job){
    this.queue.push(job);
};

var Pipeline = function Pipeline(n){
    this.schedulers = new Array();
    
    for(var i=0; i<n; i++){
        var scheduler = new Scheduler()
        this.schedulers.push(scheduler);
        scheduler.start();
    }
}

Pipeline.prototype.submit = function(jobs, onmessage, onerror){
    var nJobs = jobs.length;
    var nSchedulers = this.schedulers.length;
    var job1, job2;
    var f1, f2;
    var scheduler;
    
    function decorateOnmessage(handler, onmessage){
        return function(e){
            handler(e);
            if(onmessage)
                 onmessage(e);
        };
    }
    
    function decorateOnerror(handler, onerror){
        return function(e){
            handler(e);
            if(onerror)
               onerror(e);
        };
    }
    
    for(var i=0; i<nJobs-1; i++){
        var job1 = jobs[i];
        var job2 = jobs[i+1];
        
        var scheduler = this.schedulers[i+1];
        var f1 = function f(onmessage, job, scheduler){
            return function(e){
                onmessage(e);
                job.data.inData = e.data.outData;
                scheduler.submit(job);
            };
        };
        
        job1.onmessage = f1(job1.onmessage, job2, scheduler);
    }
    
    var lastJob = jobs[nJobs-1];
    
    lastJob.onmessage = decorateOnmessage(lastJob.onmessage, onmessage);
    lastJob.onerror = decorateOnerror(lastJob.onerror, onerror);
    
    this.schedulers[0].submit(jobs[0]);
}
