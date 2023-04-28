import colorvibrance from "./colorvibrance";
import PrerenderedEllipticalGradient from "./EllipticalGradient";
import FractalNoise from "./FractalNoise";
import polarCoordinatesFilter from "./polarCoordinatesFilter";

class SpotComponent {
    canvas = document.createElement("canvas");
    options = {
        intensity: 10,
        deformationFrequency: 0.006,
        deformationAmount: 1.6,
        deformationSeed: 1,
        hue: 200,
        saturation: 100,
        angle: 0,
    };
    radius = 1024;

    constructor(radius, options) {
        this.radius = radius;
        for (var opt in options) {
            this.options[opt] = options[opt];
        }
    }

    render() {
        this.canvas.width = Math.max(this.radius * 2, 2);
        this.canvas.height = Math.max(this.radius * 2, 2);
        var ctx = this.canvas.getContext("2d");
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(PrerenderedEllipticalGradient.canvas, 0, this.options.intensity, this.canvas.width, this.canvas.height - this.options.intensity);

        var deformationTexture = new FractalNoise(1024, 1024, {
            baseFrequency: [this.options.deformationFrequency, 0],
            seed: this.options.deformationSeed,
        });
        deformationTexture.render();

        ctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = "soft-light";
        ctx.filter = `saturate(0) contrast(${this.options.deformationAmount})`;
        var deformationOffset = this.canvas.width * this.options.angle / 360;
        ctx.drawImage(deformationTexture.canvas, deformationOffset, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(deformationTexture.canvas, deformationOffset - this.canvas.width, 0, this.canvas.width, this.canvas.height);

        ctx.restore();
        ctx.save();
        colorvibrance(ctx, this.options.hue, this.options.saturation);

        polarCoordinatesFilter(ctx);
    }
}

export default SpotComponent;