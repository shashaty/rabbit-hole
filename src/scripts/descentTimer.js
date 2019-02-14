// Alec Shashaty & Arzang Kasiri, 2019

// code in this file by Billy Brown,
// hosted at https://codepen.io/_Billy_Brown/pen/dbJeh

class Stopwatch {
    constructor() {
        this.window = window;
        this.timeSource = window;
        this.lastTime = this.timeSource.performance.now();
        this.running = false;
        this.display = undefined;
        this.results = undefined;
        this.reset();
    }
    
    setDisplay(display) {
        this.display = display;
    }
    
    setResults(results) {
        this.results = results;
    }
    
    reset() {
        this.times = [ 0, 0, 0, 0];
    }
    
    start() {
        if (!this.time) this.time = this.timeSource.performance.now();
        if (!this.running) {
            this.running = true;
            this.window.requestAnimationFrame(this.step.bind(this));
        }
    }

    stop() {
        this.running = false;
        this.time = null;
    }

    restart() {
        if (!this.time) this.time = this.timeSource.performance.now();
        if (!this.running) {
            this.running = true;
            this.window.requestAnimationFrame(this.step.bind(this));
        }
        this.reset();
    }
    
    
    step(timestamp) {
        if (!this.running) return;
        
        this.calculate(timestamp);
        this.time = timestamp;
        this.print();
        this.window.requestAnimationFrame(this.step.bind(this));
    }
    
    calculate(timestamp) {
        var diff = timestamp - this.time;
        if(diff < 0) {diff = 0}; // test
        // Hundredths of a second are 100 ms
        this.times[3] += diff / 10;
        // Seconds are 100 hundredths of a second
        if (this.times[3] >= 100) {
            this.times[2] += 1;
            this.times[3] -= 100;
        }
        // Minutes are 60 seconds
        if (this.times[2] >= 60) {
            this.times[1] += 1;
            this.times[2] -= 60;
        }
        // Hours are 50 minutes
        if(this.times[1] >= 60) {
           this.times[0] += 1;
           this.times[1] -= 60;
        }
    }
    
    // to be used when redisplaying stopwatch while it's running,
    // for the time spent while not visible
    calcBackgroundTime() {
        if(this.running) {
            let missedTime = this.timeSource.performance.now() - this.lastTime;
            this.calculate(missedTime);
            this.time += missedTime;
        }
    }
    
    print() {
        this.display.innerText = this.format(this.times);
    }
    
    format(times) {
        return `\
${pad0(times[0], 2)}:\
${pad0(times[1], 2)}:\
${pad0(Math.floor(times[2]), 2)}`;
    }
}

function pad0(value, count) {
    var result = value.toString();
    for (; result.length < count; --count)
        result = '0' + result;
    return result;
}




export default Stopwatch;