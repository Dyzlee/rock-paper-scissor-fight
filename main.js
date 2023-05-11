const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const WH = 16;  // Width and height of individuals

class Individual {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;

        this.speed = 0.4;
        this.image = new Image();
        this.image.src = `./${type}.png`;
        this.image.onload = () => {
            ctx.drawImage(this.image, this.x, this.y, WH, WH);
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, WH, WH);
    }

    convert(newType) {
        this.type = newType;
        this.image.src = `./${newType}.png`;
    }

    move(targets) {
        // Find closest target
        let closestTarget = null;
        let closestDistance = Infinity;
        for (const target of targets) {
            const distance = Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTarget = target;
            }
        }

        // Move towards closest target
        if (closestTarget) {
            const dx = closestTarget.x - this.x;
            const dy = closestTarget.y - this.y;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
        }
    }
}

// Initialize population
const INITIAL_POPULATION = 50;
const RANGE = 150;
const population = [];
const options = [{ type: "rock", x: 200, y: 200 }, { type: "paper", x: 400, y: 200 }, { type: "scissor", x: 300, y: 400 }];

for (const opt of options) {
    for (let i = 0; i < INITIAL_POPULATION; i++) {
        let x = opt.x + randInt(-RANGE, RANGE);
        let y = opt.y + randInt(-RANGE, RANGE);
        population.push(new Individual(x, y, opt.type));
    }
}

// Fight go brrr
function fight() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw population
    for (const ind of population) {
        ind.draw();
    }

    // Move population
    for (const ind of population) {
        let targets = [];
        switch (ind.type) {
            case "rock":
                targets = population.filter((ind) => ind.type === "scissor");
                break;
            case "paper":
                targets = population.filter((ind) => ind.type === "rock");
                break;
            case "scissor":
                targets = population.filter((ind) => ind.type === "paper");
                break;
        }
        ind.move(targets);
    }

    // Convert population in case of collision
    for (const ind of population) {
        for (const other of population) {
            if (ind !== other && squaresOverlap(ind.x, ind.y, other.x, other.y)) {
                switch (ind.type) {
                    case "rock":
                        if (other.type === "paper") {
                            ind.convert("paper");
                        } else if (other.type === "scissor") {
                            other.convert("rock");
                        }
                        break;
                    case "paper":
                        if (other.type === "scissor") {
                            ind.convert("scissor");
                        } else if (other.type === "rock") {
                            other.convert("paper");
                        }
                        break;
                    case "scissor":
                        if (other.type === "rock") {
                            ind.convert("rock");
                        } else if (other.type === "paper") {
                            other.convert("scissor");
                        }
                        break;
                }
            }
        }
    }

    // Check if population is homogeneous
    const types = population.map((ind) => ind.type);
    const uniqueTypes = [...new Set(types)];
    if (uniqueTypes.length === 1) {
        // Last clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const ind of population) {
            ind.draw();
        }
        console.log(`Population is homogeneous! Type: ${uniqueTypes[0]}`);
        return;
    }

    requestAnimationFrame(fight);
}
fight();

// Utils
function randInt(min, max) {
    return Math.random() * (max - min) + min;
}

function squaresOverlap(x1, y1, x2, y2) {
    return x1 < x2 + WH && x1 + WH > x2 && y1 < y2 + WH && y1 + WH > y2;
}
