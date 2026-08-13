// Selecciona todos los enlaces con imagen y el contenedor del modal
const links = document.querySelectorAll('a');
const overlay = document.querySelector('.modal');

// Muestra el overlay al hacer clic en una imagen de la galería
function showOverlay(e) {
  e.preventDefault(); // Evita el salto de la página por el href="#"
  
  // Obtiene los atributos src y alt de la imagen seleccionada
  const src = this.querySelector('img').getAttribute('src');
  const alt = this.querySelector('img').getAttribute('alt');
  
  // Actualiza los datos de la imagen dentro del modal
  overlay.querySelector('img').setAttribute('src', src);
  overlay.querySelector('img').setAttribute('alt', alt);

  // Muestra el modal agregando la clase
  overlay.classList.add('overlay');

  // Deshabilita la navegación por teclado en la galería mientras el modal está activo
  links.forEach(link => link.setAttribute('tabindex', -1));
}

links.forEach(link => link.addEventListener('click', showOverlay));

// Oculta el overlay al hacer clic en la imagen, en el botón de cerrar o en el fondo
function hideOverlay(e) {
  // Se cierra si el clic es en la imagen, el botón (o SVG) o el fondo del overlay
  if (
    e.target.tagName === 'IMG' || 
    e.target.tagName === 'BUTTON' || 
    e.target.closest('button') ||
    e.target === overlay
  ) {
    overlay.classList.remove('overlay');
    
    // Restaura la navegación por teclado en la galería
    links.forEach(link => link.setAttribute('tabindex', 0));
  }
}

overlay.addEventListener('click', hideOverlay);