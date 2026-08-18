const contenedorGaleria = document.getElementById('galeria');
const overlay = document.querySelector('.modal');

// Opciones de tamaño aleatorio
const clasesTamano = ['', 'span-col-2', 'span-row-2', 'span-big'];

fetch('fotos.json')
  .then(res => res.json())
  .then(misFotos => {
    misFotos.forEach(nombreFoto => {
      const anchor = document.createElement('a');
      anchor.href = '#';
      
      // Asigna una clase de tamaño al azar
      const claseAzar = clasesTamano[Math.floor(Math.random() * clasesTamano.length)];
      if (claseAzar) anchor.classList.add(claseAzar);

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

  // Cierra al tocar la imagen o el fondo oscuro
  overlay.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' || e.target === overlay) {
      overlay.classList.remove('overlay');
      links.forEach(l => l.setAttribute('tabindex', 0));
    }
  });
}