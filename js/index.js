var canvas = document.querySelector('canvas');
var dpi = window.devicePixelRatio;

canvas.width = dpi * window.innerWidth;
canvas.height = dpi * window.innerHeight;
canvas.style.width = window.innerWidth + 'px';
canvas.style.height = window.innerHeight + 'px';

var c = canvas.getContext('2d');

var mouse = {
    x: undefined,
    y: undefined,
}

// react to window resize
window.addEventListener('resize',
    function() {
        canvas.width = dpi * window.innerWidth;
        canvas.height = dpi * window.innerHeight;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }
)

// get mouse position on mouse move
window.addEventListener('mousemove',
    function(event) {
        mouse.x = dpi * event.x;
        mouse.y = dpi * event.y;
    }
)

var clickedCircles = [];
window.addEventListener('mousedown',
    function(event) {
        x = dpi * event.x;
        y = dpi * event.y;

        circles.forEach((circle, index) => {
            const distance = Math.sqrt(Math.pow(circle.x - x, 2) + Math.pow(circle.y - y, 2));
            const tolerance = 1.15;
            if (distance <=  tolerance * circle.r) {
                circle.clicked = true;
                clickedCircles.push(index);
                return;
            }
        });
    }
)

// circle object
function RandomCircle() {
    // radius
    this.r = dpi * Math.floor((Math.random() * 30) + 10);

    // initial position
    do {
        this.x = Math.floor(Math.random() * canvas.width);
    } while (this.x + this.r > canvas.width || this.x - this.r < 0)
    do {
        this.y = Math.floor(Math.random() * canvas.height);
    } while (this.y + this.r > canvas.height || this.y - this.r < 0)

    // initial velocity
    do {
        this.dx = dpi * Math.floor(3 * (Math.random() - 0.5));
    } while (this.dx == 0)
    do {
        this.dy = dpi * Math.floor(3 * (Math.random() - 0.5));
    } while (this.dy == 0)

    // color
    const red = Math.floor(Math.random() * 255);
    const green = Math.floor(Math.random() * 255);
    const blue = Math.floor(Math.random() * 255);
    const alpha = Math.random();
    this.color = `rgba(${red}, ${green}, ${blue}, 1`;

    this.clicked = false;

    this.update = function () {
        // react to click
        if (this.clicked) {
            return;
        }

        // react to mouse postion
        if (mouse.x && mouse.y) {
            const maxDistance = 500;
            const vector = {
               x: this.x - mouse.x,
               y: this.y - mouse.y,
            };
            const distance = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)) - this.r;

            if (distance < maxDistance) {
                const force = 0.5;
                const angle = Math.atan2(vector.y, vector.x);
                if (distance < 0) {
                    this.dx += force * Math.cos(angle);
                    this.dy += force * Math.sin(angle);
                } else {
                    this.dx += force * Math.cos(angle) * Math.pow((1 - (distance/maxDistance)), 2);
                    this.dy += force * Math.sin(angle) * Math.pow((1 - (distance/maxDistance)), 2);
                }
            }
        }

        // update position
        this.x += this.dx;
        this.y += this.dy;

        // bounce of walls
        if (this.x - this.r <= 0) {
            this.x = this.r;
            if (this.dx < 0) {
                this.dx = -this.dx;
            }
        }
        if (this.x + this.r >= canvas.width) {
            this.x = canvas.width - this.r;
            if (this.dx > 0) {
                this.dx = -this.dx;
            }
        }
        if (this.y - this.r <= 0) {
            this.y = this.r;
            if (this.dy < 0) {
                this.dy = -this.dy;
            }
        }
        if (this.y + this.r >= canvas.height) {
            this.y = canvas.height - this.r;
            if (this.dy > 0) {
                this.dy = -this.dy;
            }
        }

        // bounce of each other
        circles.forEach(circle => {
            if (this === circle) {
                return; // continue
            }

            // vector from position of 'this' circle to the other 'circle'
            const c = {
                x: circle.x - this.x,
                y: circle.y - this.y,
            }
            const distance = Math.sqrt(Math.pow(c.x, 2) + Math.pow(c.y, 2)) - circle.r - this.r;

            // collision occured
            if (distance <= 0) {

                const c_angle = Math.atan2(c.y, c.x);

                // fix circles being inside of each other
                if (distance < 0) {
                    circle.x += 0.5 * Math.cos(c_angle) * (Math.abs(distance) + 0.1);
                    circle.y += 0.5 * Math.sin(c_angle) * (Math.abs(distance) + 0.1);
                    this.x   -= 0.5 * Math.cos(c_angle) * (Math.abs(distance) + 0.1);
                    this.y   -= 0.5 * Math.sin(c_angle) * (Math.abs(distance) + 0.1);
                }

                // fuck math, just fake collisions
                var combined_speed = Math.sqrt(Math.pow(circle.dx, 2) + Math.pow(circle.dy, 2))
                                     +  Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
                circle.dx = 0.5 * Math.cos(c_angle) * combined_speed;
                circle.dy = 0.5 * Math.sin(c_angle) * combined_speed;
                this.dx = - 0.5 * Math.cos(c_angle) * combined_speed;
                this.dy = - 0.5 * Math.sin(c_angle) * combined_speed;
            }
        });

        // circles slow down over time
        const slowdown = 0.998;
        this.dx *= slowdown;
        this.dy *= slowdown;
    }

    this.draw = function () {
        if (this.clicked) {
            return;
        }

        c.lineWidth = dpi * 2;
        c.strokeStyle = this.color;
        c.fillStyle = this.color;

        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        c.fill();
    }
}

var circles = [];
const circleCount = 25;
for (let i = 0; i < circleCount; i++) {
    circles.push(new RandomCircle());
}

function tick() {

    // remove clicked circles
    clickedCircles.forEach(circle => {
        circles.splice(circle, 1);
    });
    clickedCircles = [];

    // update circle position
    circles.forEach(circle => circle.update());

    // clear canvas
    c.clearRect(0, 0, canvas.width, canvas.height);

    // draw circle
    circles.forEach(circle => circle.draw());

    // create animation loop
    window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
