const contenedorGaleria = document.getElementById('galeria');
const overlay = document.querySelector('.modal');

// Cargar la lista de imágenes desde el archivo JSON
fetch('fotos.json')
  .then(response => response.json())
  .then(misFotos => {
    // Crear el HTML de cada imagen dinámicamente
    misFotos.forEach(nombreFoto => {
      const anchor = document.createElement('a');
      anchor.href = '#';
      
      const img = document.createElement('img');
      img.src = `media/${nombreFoto}`;
      img.alt = nombreFoto;

      anchor.appendChild(img);
      contenedorGaleria.appendChild(anchor);
    });

    // Asignar los eventos de clic una vez creadas las imágenes
    inicializarGaleria();
  })
  .catch(error => console.error('Error al cargar fotos.json:', error));

function inicializarGaleria() {
  const links = contenedorGaleria.querySelectorAll('a');

  function showOverlay(e) {
    e.preventDefault();
    const src = this.querySelector('img').getAttribute('src');
    const alt = this.querySelector('img').getAttribute('alt');
    
    overlay.querySelector('img').setAttribute('src', src);
    overlay.querySelector('img').setAttribute('alt', alt);
    overlay.classList.add('overlay');

    links.forEach(link => link.setAttribute('tabindex', -1));
  }

  links.forEach(link => link.addEventListener('click', showOverlay));

  function hideOverlay(e) {
    if (
      e.target.tagName === 'IMG' || 
      e.target.tagName === 'BUTTON' || 
      e.target.closest('button') ||
      e.target === overlay
    ) {
      overlay.classList.remove('overlay');
      links.forEach(link => link.setAttribute('tabindex', 0));
    }
  }

  overlay.addEventListener('click', hideOverlay);
}