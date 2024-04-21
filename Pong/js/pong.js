console.log('Pong v0.1');

const canvas = document. querySelector('canvas'),
    ctx = canvas.getContext('2d'); // 2d | webgl

const entidades = [];

const control = {
    botonArriba: false,
    botonAbajo: false,
    botonArriba2: false,
    botonAbajo2: false,
};

class Entidad {

    constructor (x, y, w, h, color, velocidad) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.velocidad = velocidad;
    }

    draw () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    update () {
        // Se implementa en la subclase
    }

    onColision () {
        // Se implementa en la subclase
    }
}

class Jugador1 extends Entidad {

    constructor (x, y, w, h, velocidad) {
        super(x, y, w, h, 'white', velocidad);
        this.puntos = 0;
    }

    update() {
        if (control.botonArriba) {
            this.y -= this.velocidad; 
        }

        if (control.botonAbajo) {
            this.y += this.velocidad;
        }

        if (this.y < 0) {
            this.y = 0;
        }

        if (this.y > canvas.height - this.h) {
            this.y = canvas.height - this.h;
        }
    }

    reset () {
        this.y = canvas.height / 2 - 50; 
    }
}

class Jugador2 extends Entidad {

    constructor (x, y, w, h, velocidad) {
        super(x, y, w, h, 'white', velocidad);
        this.puntos = 0;
    }

    update() {
        if (control.botonArriba2) {
            this.y -= this.velocidad; 
        }

        if (control.botonAbajo2) {
            this.y += this.velocidad;
        }

        if (this.y < 0) {
            this.y = 0;
        }

        if (this.y > canvas.height - this.h) {
            this.y = canvas.height - this.h;
        }
    }

    reset () {
        this.y = canvas.height / 2 - 50; 
    }
}

class Pelota extends Entidad {
    constructor (x, y, w, h, v) {
        super(x, y, w, h, 'white', v);

        this.dx = 0;
        this.dy = 0;

        //this.punto;
    }
    
    update () {
        this.x += this.dx;
        this.y += this.dy;

        const resto = entidades.filter(ent => ent !== this),
            colisionaron = [];

        for (const entidad of resto) {
            if (colision(this, entidad)) {
                colisionaron.push(entidad);
            }
        }

        if (colisionaron.length > 0) {
            if (colision(this, jugador1) || colision(this, jugador2)) {
                this.dx *= -1;
            }
        }

        // Ahora rebota esto tendria que sumar puntos
        if (this.x <= 0 || this.x >= canvas.width - this.w) {
            this.dx = this.dx * -1;
        }

        // Rebotar contra arriba o abajo
        if (this.y <= 0 || this.y >= canvas.height - this.h) {
            this.dy = this.dy * -1;
        }
    }

    draw () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    reset () {
        this.x = canvas.width / 2 - this.w / 2;
        this.y = canvas.height / 2 - this.h / 2;

        let angle = Math.random() * Math.PI * 2;

        while (Math.abs(Math.sin(angle)) > 0.8) { 
            angle = Math.random() * Math.PI * 2;
        }

        this.dx = this.velocidad * Math.cos(angle);
        this.dy = this.velocidad * Math.sin(angle);
    }
}

class Red extends Entidad {
    constructor(x, y, x2, y2, dashLength, color) {
        super(x, y, 0, 0, color, 0);

        this.x2 = x2;
        this.y2 = y2;
        this.dashLength = dashLength;
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.setLineDash([this.dashLength, this.dashLength]); 
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        ctx.setLineDash([]); 
    }
}

const jugador1 = new Jugador1 (30, canvas.height / 2 - 50, 13, 70, 10),
    jugador2 = new Jugador2 (canvas.width - 40, canvas.height / 2 - 50, 13, 70, 10),
    pelota = new Pelota(0, 0, 12, 12, 10),
    red = new Red(canvas.width / 2, 0, canvas.width / 2, canvas.height, 10, 'white');

const Etapas = {
    INICIO: 'INICIO', 
    JUGANDO: 'JUGANDO',
    FIN: 'FIN',
    PAUSA: 'PAUSA',
}

let etapa = Etapas.JUGANDO;

function borrarPantalla () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// INICIO
function updInicio () {
    //if (control.botPausa) {
        etapa = Etapas.JUGANDO;
        resetJuego();
    //}
}

function drwInicio() {
    const margenFondo = 50;

    // Dibujar el texto 'PONG'
    ctx.fillStyle = 'white';
    ctx.font = `${margenFondo * 1.}px 'Public Pixel', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PONG', canvas.width / 2, canvas.height / 2);

    // Dibujar el texto 'Apretá enter para comenzar'
    ctx.fillStyle = 'white';
    ctx.font = '16px "Public Pixel", sans-serif';
    ctx.textBaseline = 'top';
    ctx.textRendering = 'optimizeLegibility';
    ctx.fillText('Apreta enter para comenzar', canvas.width / 2, canvas.height / 2 + margenFondo + 10);
}

// JUGANDO
function updJugando () {
    for (const entidad of entidades) {
        entidad.update();
    }
}

function drwJugando () {
    borrarPantalla();

    for (const entidad of entidades) {
        entidad.draw();
    }
}

function gameloop() {

    switch (etapa) {
        case Etapas.JUGANDO:
            update = updJugando;
            draw = drwJugando;
            break;

        case Etapas.INICIO:
            update = updInicio;
            draw = drwInicio;
            break;
        /*
        case Etapas.FIN:
            update = updFin;
            draw = drwFin;
            break;

        default:
            update = updInicio;
            draw = drwInicio;
            break;
            */
    }

    update();
    draw();

    requestAnimationFrame(gameloop); 
}

document.getElementById('startButton').addEventListener('click', function() {

    jugador1.reset();
    jugador2.reset();
    pelota.reset();

    window.addEventListener('keydown', evt => {
        switch (evt.code) {
            case "KeyW": 
                control.botonArriba = true;
                break;
    
            case "KeyS": 
                control.botonAbajo = true;
                break;

            case "ArrowUp": 
                control.botonArriba2 = true;
                break;
    
            case "ArrowDown": 
                control.botonAbajo2 = true;
                break;
        }
        
    });
    
    window.addEventListener('keyup', evt => {
        switch (evt.code) {
            case "KeyW": 
                control.botonArriba = false;
                break;
    
            case "KeyS": 
                control.botonAbajo = false;
                break;

            case "ArrowUp": 
                control.botonArriba2 = false;
                break;
    
            case "ArrowDown": 
                control.botonAbajo2 = false;
                break;
        }
    });

    entidades.push(jugador1);
    entidades.push(jugador2);
    entidades.push(pelota);
    entidades.push(red);

    etapa = Etapas.INICIO;

    gameloop();

});


function resetJuego () {
    // Reset de posición de jugador
    jugador1.reset();
    jugador2.reset();

    // Reset de posición inicial de pelota
    // Reset de movimiento de pelota
    pelota.reset();
}

function colision (a, b) {
    // Acá ocurren cosas
    const resultado = 
        a.x > b.x + b.w
        || a.y > b.y + b.h
        || a.x + a.w < b.x
        || a.y + a.h < b.y;
        
    return !resultado;
}