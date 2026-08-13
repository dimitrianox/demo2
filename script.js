const contenedorGaleria = document.getElementById('galeria');
const overlay = document.querySelector('.modal');

// Lee el archivo fotos.json que generó Python
fetch('fotos.json')
  .then(res => res.json())
  .then(misFotos => {
    // Inserta cada imagen dentro de <main>
    misFotos.forEach(nombreFoto => {
      const anchor = document.createElement('a');
      anchor.href = '#';
      
      const img = document.createElement('img');
      img.src = `media/${nombreFoto}`;
      img.alt = nombreFoto;

      anchor.appendChild(img);
      contenedorGaleria.appendChild(anchor);
    });

    inicializarEventos();
  })
  .catch(err => console.error("Error al cargar fotos.json:", err));

function inicializarEventos() {
  const links = contenedorGaleria.querySelectorAll('a');

  // Abrir modal
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const src = this.querySelector('img').getAttribute('src');
      const alt = this.querySelector('img').getAttribute('alt');
      
      overlay.querySelector('img').setAttribute('src', src);
      overlay.querySelector('img').setAttribute('alt', alt);
      overlay.classList.add('overlay');

      links.forEach(l => l.setAttribute('tabindex', -1));
    });
  });

  // Cerrar modal al tocar la imagen, boton X o fondo
  overlay.addEventListener('click', function(e) {
    if (
      e.target.tagName === 'IMG' || 
      e.target.tagName === 'BUTTON' || 
      e.target.closest('button') ||
      e.target === overlay
    ) {
      overlay.classList.remove('overlay');
      links.forEach(l => l.setAttribute('tabindex', 0));
    }
  });
}