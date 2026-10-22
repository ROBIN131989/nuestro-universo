// ===== Cielo: una sola capa que cambia según la página en la que vas =====
const cielo = document.createElement("div");
cielo.className = "cielo";
document.body.prepend(cielo);
document.body.dataset.cielo = "dia";

// El cielo de cada página (en orden): dedicatoria, I, II, III, IV, V, VI, VII, VIII, frases, IX, final
const cielos = ["dia", "dia", "dia", "tarde", "tarde", "atardecer", "atardecer", "atardecer", "noche", "noche", "noche", "noche"];
const paginas = [...document.querySelectorAll("main .pantalla")];
paginas.forEach((p, i) => (p.dataset.cielo = cielos[i] || "noche"));
document.getElementById("portada").dataset.cielo = "dia";

const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting && document.body.dataset.cielo !== e.target.dataset.cielo) {
        document.body.dataset.cielo = e.target.dataset.cielo;
      }
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);
[document.getElementById("portada"), ...paginas].forEach((p) => observador.observe(p));

// ===== Estrellas (solo se dibujan cuando llega la noche) =====
const lienzo = document.getElementById("estrellas");
const ctx = lienzo.getContext("2d");
let estrellas = [];
let anchoPrevio = 0;
let ultimaNoche = 0;

function ajustar() {
  anchoPrevio = innerWidth;
  lienzo.width = innerWidth;
  lienzo.height = innerHeight;
  estrellas = Array.from({ length: 70 }, () => ({
    x: Math.random() * lienzo.width,
    y: Math.random() * lienzo.height,
    r: Math.random() * 1.4 + 0.4,
    f: Math.random() * 6,
  }));
}
function dibujar(t) {
  requestAnimationFrame(dibujar);
  if (document.body.dataset.cielo === "noche") ultimaNoche = t;
  if (document.hidden || t - ultimaNoche > 1800) return; // fuera de la noche no gasta batería ni se traba
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  ctx.fillStyle = "#fff6dc";
  estrellas.forEach((s) => {
    ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t / 1000 + s.f));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, 7);
    ctx.fill();
  });
}
ajustar();
// En el celular la barra del navegador sube y baja al deslizar: solo reacciona si cambia el ANCHO
addEventListener("resize", () => {
  if (innerWidth !== anchoPrevio) ajustar();
});
requestAnimationFrame(dibujar);

// ===== Fotos: están en la carpeta IMG y casi todas son .jpeg =====
const EXTENSIONES = ["jpeg", "JPEG", "jpg", "JPG", "png", "PNG", "webp"];
function cargarFoto(img) {
  return new Promise((resolve) => {
    let i = 0;
    img.decoding = "async";
    img.addEventListener("load", () => resolve(), { once: true });
    const probar = () => {
      if (i >= EXTENSIONES.length) {
        const aviso = document.createElement("small");
        aviso.textContent = "No encontré la foto: IMG/" + img.dataset.foto;
        img.replaceWith(aviso);
        resolve();
        return;
      }
      img.src = "IMG/" + encodeURIComponent(img.dataset.foto) + "." + EXTENSIONES[i++];
    };
    img.addEventListener("error", probar);
    probar();
  });
}

// El libro se abre cuando las fotos ya cargaron, para que no se mueva nada mientras deslizas
const botonEntrar = document.getElementById("entrar");
const fotos = [...document.querySelectorAll("img[data-foto]")];
let hechas = 0;
let abierto = false;
botonEntrar.disabled = true;
botonEntrar.textContent = "Preparando el libro… 0/" + fotos.length;
function libroListo() {
  if (abierto) return;
  abierto = true;
  botonEntrar.disabled = false;
  botonEntrar.textContent = "Abrir el libro";
}
Promise.all(
  fotos.map((f) =>
    cargarFoto(f).then(() => {
      hechas++;
      if (!abierto) botonEntrar.textContent = "Preparando el libro… " + hechas + "/" + fotos.length;
    })
  )
).then(libroListo);
setTimeout(libroListo, 12000); // si el internet va lento, igual se puede abrir

// ===== Entrar al libro (aquí también arranca la música) =====
const musica = document.getElementById("musica");
const btnMusica = document.getElementById("btn-musica");
const chip = document.getElementById("chip");

botonEntrar.addEventListener("click", () => {
  document.getElementById("contenido").hidden = false;
  btnMusica.hidden = false;
  chip.hidden = false;
  actualizarChip();
  musica.play().catch(() => {});
  requestAnimationFrame(() => {
    document.getElementById("inicio").scrollIntoView({ behavior: "auto" });
  });
});
btnMusica.addEventListener("click", () => {
  musica.paused ? musica.play().catch(() => {}) : musica.pause();
});
musica.addEventListener("play", () => btnMusica.classList.remove("silencio"));
musica.addEventListener("pause", () => btnMusica.classList.add("silencio"));

// ===== Nota flotante (mensajes cortos) =====
const nota = document.getElementById("nota");
let temporizador;
function mostrarNota(texto, ms = 5000) {
  nota.textContent = texto;
  nota.hidden = false;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => (nota.hidden = true), ms);
}

// ===== Pozos escondidos (puedes cambiar estos mensajes) =====
const MENSAJES_POZOS = [
  "Dicen que lo que embellece al desierto es el pozo escondido. Tú eres el mío.",
  "Hay días difíciles, pero pensar en ti los hace más fáciles.",
  "Si pudiera elegir un lugar para despertar, sería a tu lado.",
  "Gracias por cada mensaje, cada llamada, cada día. Contigo todo pesa menos.",
  "Los encontraste todos. Eso quiere decir que me conoces bien. Te amo, Henry.",
];
const CORAZON = '<svg class="corazon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-9.1C1.1 8.6 3 5 6.4 5c2 0 3.3 1 5.6 3.4C14.3 6 15.6 5 17.6 5 21 5 22.9 8.6 21.3 11.9 19 16.4 12 21 12 21z"/></svg>';
let hallados = 0;
function actualizarChip() {
  chip.innerHTML = CORAZON + "Pozos escondidos: " + hallados + " de " + MENSAJES_POZOS.length;
}
document.querySelectorAll(".pozo").forEach((b) => {
  b.addEventListener("click", () => {
    if (b.classList.contains("hallado")) return;
    b.classList.add("hallado");
    mostrarNota(MENSAJES_POZOS[Number(b.dataset.n)], 6500);
    hallados++;
    actualizarChip();
  });
});

// ===== Nuestro planeta: rosa, volcán y silla =====
const frasesPlaneta = {
  rosa: [
    "“Lo esencial es invisible a los ojos.” — El Principito",
    "“Es el tiempo que pasaste con tu rosa lo que la hace tan importante.” — El Principito",
    "“Eres responsable para siempre de lo que has domesticado.” — El Principito",
    "“Cuando mires el cielo de noche, será como si todas las estrellas rieran.” — El Principito",
    "Entre millones de estrellas, yo te elijo a ti.",
  ],
  volcan: ["Mi volcán se enciende cada vez que pienso en ti.", "Hay un volcán dormido en mi planeta, y otro en mi corazón cuando me escribes."],
  silla: ["Aquí me siento a ver atardeceres y a pensar en ti.", "Cada atardecer en esta silla es uno menos para vernos."],
};
const contador = { rosa: 0, volcan: 0, silla: 0 };
const textoPlaneta = document.getElementById("frase-planeta");
function tocarZona(z) {
  const lista = frasesPlaneta[z];
  textoPlaneta.textContent = lista[contador[z] % lista.length];
  contador[z]++;
}
document.querySelectorAll(".zona").forEach((z) => {
  z.addEventListener("click", () => tocarZona(z.dataset.zona));
  z.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tocarZona(z.dataset.zona);
    }
  });
});

// ===== El zorro: conversación paso a paso =====
const lineasZorro = [
  ["—¿Qué quiere decir domesticar?", "mano"],
  ["—Crear lazos.", "mano"],
  ["“Si me domesticas, serás para mí único en el mundo.”", "frase"],
  ["Y tú, Henry, ya lo eres.", "mano grande"],
  ["Cerca o lejos, solo tú tienes mi corazón, mis pensamientos y mi amor.", "frase"],
];
const dialogo = document.getElementById("dialogo");
const seguir = document.getElementById("seguir");
let paso = 0;
function siguienteLinea() {
  const [texto, clase] = lineasZorro[paso];
  const p = document.createElement("p");
  p.className = clase;
  p.textContent = texto;
  dialogo.appendChild(p);
  paso++;
  if (paso >= lineasZorro.length) seguir.hidden = true;
}
seguir.addEventListener("click", siguienteLinea);
siguienteLinea();

// ===== 44 atardeceres: mueve la silla =====
const panel = document.getElementById("panel44");
const sol = document.getElementById("sol");
const cuenta = document.getElementById("cuenta");
const sillaBtn = document.getElementById("silla");
let atardeceres = 0;
sillaBtn.addEventListener("click", () => {
  if (atardeceres >= 44) return;
  atardeceres++;
  const avance = atardeceres / 44;
  sol.style.top = 8 + avance * 62 + "%";
  panel.classList.toggle("tarde", avance > 0.35 && avance <= 0.8);
  panel.classList.toggle("noche", avance > 0.8);
  cuenta.textContent = atardeceres + " / 44";
  if (atardeceres === 44) {
    document.getElementById("mensaje44").hidden = false;
    sillaBtn.disabled = true;
  }
});

// ===== La carta =====
const sobre = document.getElementById("sobre");
const carta = document.getElementById("carta");
sobre.addEventListener("click", () => {
  const abrir = carta.hidden;
  carta.hidden = !abrir;
  sobre.classList.toggle("abierto", abrir);
  document.getElementById("pista-sobre").hidden = abrir;
  if (abrir) carta.scrollIntoView({ behavior: "smooth", block: "center" });
});
