import colorvibrance from "./colorvibrance";

class RingComponent {
    canvas = document.createElement("canvas");
    radius = 512;
    options = {
        thickness: 10,
        blur: 3,
        cropSize: 50,
        cropHardness: 50,
    };

    setOptions(options) {
        for (var opt in options) {
            this.options[opt] = options[opt];
        }
    }

    constructor(radius, options) {
        this.radius = radius;
        this.setOptions(options);
    }

    render() {
        this.canvas.width = this.radius * 2;
        this.canvas.height = this.radius * 2;
        
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.radius, this.radius, this.radius - this.options.blur, 0, 2 * Math.PI, true);
        var gradient = ctx.createRadialGradient(this.radius, this.radius, 0, this.radius, this.radius, this.radius - this.options.blur);
        gradient.addColorStop(0, "black");
        gradient.addColorStop(1 - (this.options.thickness / this.radius), "black");
        gradient.addColorStop(1, "white");
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

export default RingComponent;