import colorvibrance from "./colorvibrance";

class IrisComponent {
    canvas = document.createElement("canvas");
    radius = 512;
    options = {
        roundness: 20,
        sides: 5,
        fillAlpha: 25,
        fringeAlpha: 50,
        fringeSize: 10,
        hue: 200,
        saturation: 100,
        blur: 5,
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
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.beginPath();

        var polarPoints = []; // [r, theta]
        var startAngle = 0;
        for (var i = 0; i < this.options.sides; i++) {
            polarPoints.push([this.radius, startAngle]);
            var r1, r = this.radius, theta = 0;
            var resolution = 360;
            for (var j = 0; j < resolution; j++) {
                theta += 1 / resolution * (Math.PI * 2 / this.options.sides);
                r1 = this.radius / Math.sin(Math.PI - theta - 0.5 * (Math.PI - 2 * Math.PI / this.options.sides)) * Math.sin(0.5 * (Math.PI - 2 * Math.PI / this.options.sides));
                r = r1 * (1 - this.options.roundness / 100) + this.radius * (this.options.roundness / 100);
                polarPoints.push([r, startAngle + theta]);
            }
            startAngle += Math.PI * 2 / this.options.sides;
        }

        //console.log(polarPoints);
        var firstPoint = true;
        for (var pt of polarPoints) {
            var r = pt[0], theta = pt[1];
            var x = Math.cos(theta) * r + this.radius, y = Math.sin(theta) * r + this.radius;
            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            }
            else ctx.lineTo(x, y);
        }
        
        ctx.fillStyle = `hsl(0deg, 0%, ${this.options.fringeAlpha}%)`;
        ctx.fill();
        ctx.restore();
        ctx.save();

        ctx.fillStyle = "black";
        ctx.filter = `blur(${this.options.fringeSize}px)`;
        ctx.fill();
        ctx.restore();
        ctx.save();

        ctx.fillStyle = "white";
        ctx.globalAlpha = this.options.fillAlpha / 100;
        ctx.fill();
        ctx.restore();
        ctx.save();

        var blurBuff = document.createElement("canvas");
        blurBuff.width = this.canvas.width; blurBuff.height = this.canvas.height;
        blurBuff.getContext("2d").drawImage(this.canvas, 0, 0);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.filter = `blur(${this.options.blur}px)`;
        ctx.drawImage(blurBuff, this.options.blur, this.options.blur, this.canvas.width - 2 * this.options.blur, this.canvas.height - 2 * this.options.blur);
        ctx.restore();
        ctx.save();
        
        colorvibrance(ctx, this.options.hue, this.options.saturation);
        ctx.restore();
        ctx.save();
    }
}

export default IrisComponent;