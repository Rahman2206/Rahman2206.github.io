i want to make 2d Only vanilla javascript web submarine platypus like game. can you tel me how to add parallax into my game?

1. Structure a Layer Class
Instead of writing separate scrolling logic for every single background image, create a reusable Layer class. This class will handle its own positioning, drawing, and speed modifier.

To make the background loop seamlessly, each layer draws its image twice side-by-side. When the first image slides completely off the left side of the screen, the position resets instantly.

JavaScript
class Layer {
    constructor(image, speedModifier, canvasWidth, canvasHeight) {
        this.image = image;
        this.speedModifier = speedModifier; // Closer to 1 = moves faster, closer to 0 = moves slower
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = image.width;
        this.height = image.height;
        this.x = 0;
        this.y = 0;
    }

    // Update position based on the global game speed
    update(gameSpeed) {
        // Calculate speed relative to this layer's depth
        const speed = gameSpeed * this.speedModifier;
        
        // Move left
        this.x -= speed;
        
        // Reset position once the image has scrolled completely past the screen width
        if (this.x <= -this.width) {
            this.x = 0;
        }
    }

    // Draw two identical images side-by-side for a seamless loop
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
}


// Ensure images are loaded before initializing layers
function initLayers() {
    layers = [
        new Layer(bgLayer1, 0.1, canvas.width, canvas.height),
        new Layer(bgLayer2, 0.4, canvas.width, canvas.height),
        new Layer(bgLayer3, 0.8, canvas.width, canvas.height)
    ];
}



