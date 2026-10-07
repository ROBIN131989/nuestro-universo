// Cielo de estrellas parpadeantes
const lienzo = document.getElementById("estrellas");
const ctx = lienzo.getContext("2d");
let estrellas = [];

function ajustar() {
  lienzo.width = innerWidth;
  lienzo.height = innerHeight;
  estrellas = Array.from({ length: 130 }, () => ({
    x: Math.random() * lienzo.width,
    y: Math.random() * lienzo.height,
    r: Math.random() * 1.5 + 0.3,
    f: Math.random() * 6,
  }));
}

function dibujar(t) {
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  ctx.fillStyle = "#fff";
  estrellas.forEach((s) => {
    ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t / 900 + s.f));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, 7);
    ctx.fill();
  });
  requestAnimationFrame(dibujar);
}

ajustar();
addEventListener("resize", ajustar);
requestAnimationFrame(dibujar);

// Entrar al universo (aquí también arranca la música)
const musica = document.getElementById("musica");
const btnMusica = document.getElementById("btn-musica");

document.getElementById("entrar").addEventListener("click", () => {
  const contenido = document.getElementById("contenido");
  contenido.hidden = false;
  contenido.firstElementChild.scrollIntoView({ behavior: "smooth" });
  btnMusica.hidden = false;
  musica.play().catch(() => {}); // si no hay canción, no pasa nada
});

btnMusica.addEventListener("click", () => {
  musica.paused ? musica.play().catch(() => {}) : musica.pause();
});

// Abrir la carta
const sobre = document.getElementById("sobre");
const carta = document.getElementById("carta");

sobre.addEventListener("click", () => {
  carta.hidden = !carta.hidden;
  sobre.setAttribute("aria-expanded", String(!carta.hidden));
  sobre.textContent = carta.hidden ? "💌 Toca para abrir" : "Cerrar carta";
  if (!carta.hidden) carta.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Fotos: están en la carpeta IMG y todas son .jpeg
const EXTENSIONES = ["jpeg", "JPEG", "jpg", "JPG", "png", "PNG", "webp"];
document.querySelectorAll("img[data-foto]").forEach((img) => {
  let i = 0;
  const probar = () => {
    if (i >= EXTENSIONES.length) {
      const aviso = document.createElement("small");
      aviso.textContent = "No encontré la foto: IMG/" + img.dataset.foto;
      img.replaceWith(aviso);
      return;
    }
    img.src = "IMG/" + encodeURIComponent(img.dataset.foto) + "." + EXTENSIONES[i++];
  };
  img.addEventListener("error", probar);
  probar();
});
