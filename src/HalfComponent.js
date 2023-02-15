class HalfComponent {
    canvas = document.createElement("canvas");
    
    setCanvas(canvas, width, height, leftHalf=true, rightHalf=true) {
        this.canvas.width = Math.round(width / 2) * 2;
        this.canvas.height = height;
        var ctx = this.canvas.getContext("2d");
        ctx.drawImage(canvas, 0, 0, this.canvas.width, this.canvas.height);
        if (leftHalf == false) ctx.clearRect(0, 0, this.canvas.width / 2, this.canvas.height);
        if (rightHalf == false) ctx.clearRect(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height);
    }

    constructor(canvas, width, height, leftHalf=true, rightHalf=true) {
        this.setCanvas(canvas, width, height, leftHalf, rightHalf);
    }
}

export default HalfComponent;