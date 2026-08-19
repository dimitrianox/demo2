const contenedorGaleria = document.getElementById('galeria');
const overlay = document.querySelector('.modal');
const infoCard = document.querySelector('.info-card');
const modalImg = document.getElementById('modal-img');
const modalVideo = document.getElementById('modal-video');
const atlasCanvas = document.getElementById('atlas-canvas');

const clasesTamano = ['', 'span-col-2', 'span-row-2', 'span-big'];
const extensionesVideo = ['.mp4', '.webm', '.ogg', '.mov'];

let ultimoToque = 0;

document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
    e.preventDefault();
  }
});

function esVideo(url) {
  return extensionesVideo.some(ext => url.toLowerCase().includes(ext));
}

fetch('fotos.json')
  .then(res => res.json())
  .then(misFotos => {
    misFotos.forEach(item => {
      const url = typeof item === 'string' ? item : item.url;
      const poster = item.poster || '';
      const titulo = item.titulo || '';
      const ubicacion = item.ubicacion || '';
      const fecha = item.fecha || '';
      const descripcion = item.descripcion || '';
      const mapa = item.mapa || 'europe';

      const anchor = document.createElement('a');
      anchor.href = '#';
      
      const claseAzar = clasesTamano[Math.floor(Math.random() * clasesTamano.length)];
      if (claseAzar) anchor.classList.add(claseAzar);

      anchor.dataset.url = url;
      anchor.dataset.titulo = titulo;
      anchor.dataset.ubicacion = ubicacion;
      anchor.dataset.fecha = fecha;
      anchor.dataset.descripcion = descripcion;
      anchor.dataset.mapa = mapa;
      anchor.dataset.esVideo = esVideo(url);

      if (esVideo(url)) {
        if (poster) {
          const img = document.createElement('img');
          img.src = poster;
          img.alt = titulo || 'Video';
          img.setAttribute('referrerpolicy', 'no-referrer');
          anchor.appendChild(img);
        } else {
          const video = document.createElement('video');
          video.src = url;
          video.muted = true;
          video.preload = "metadata";
          video.playsInline = true;
          video.setAttribute('referrerpolicy', 'no-referrer');
          anchor.appendChild(video);
        }
      } else {
        const img = document.createElement('img');
        img.src = url;
        img.alt = titulo || 'Fotografía';
        img.setAttribute('referrerpolicy', 'no-referrer');
        anchor.appendChild(img);
      }

      contenedorGaleria.appendChild(anchor);
    });

    inicializarEventos();
  })
  .catch(err => console.error("Error al cargar fotos.json:", err));

function manejarDobleTap() {
  const tiempoActual = new Date().getTime();
  const diferenciaTiempo = tiempoActual - ultimoToque;

  if (diferenciaTiempo < 350 && diferenciaTiempo > 0) {
    const links = contenedorGaleria.querySelectorAll('a');
    cerrarModal(links);
  }
  
  ultimoToque = tiempoActual;
}

function inicializarEventos() {
  const links = contenedorGaleria.querySelectorAll('a');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const url = this.dataset.url;
      const esVid = this.dataset.esVideo === 'true';
      const datosModal = this.dataset;

      // Resetear clases de visibilidad previa
      modalImg.classList.remove('foto-visible');
      modalVideo.classList.remove('foto-visible');
      overlay.classList.add('overlay');

      // Función que revela la imagen al concluir el mapa
      const mostrarFotografia = () => {
        if (esVid) {
          modalImg.style.display = 'none';
          modalImg.src = '';
          modalVideo.src = url;
          modalVideo.style.display = 'block';
          modalVideo.play().catch(() => {});
          modalVideo.classList.add('foto-visible');
        } else {
          modalVideo.style.display = 'none';
          modalVideo.pause();
          modalVideo.src = '';
          modalImg.src = url;
          modalImg.style.display = 'block';
          modalImg.classList.add('foto-visible');
        }

        if (document.getElementById('info-titulo')) {
          document.getElementById('info-titulo').textContent = datosModal.titulo;
          document.getElementById('info-ubicacion').textContent = datosModal.ubicacion ? `📍 ${datosModal.ubicacion}` : '';
          document.getElementById('info-fecha').textContent = datosModal.fecha ? `📅 ${datosModal.fecha}` : '';
          document.getElementById('info-descripcion').textContent = datosModal.descripcion;

          infoCard.classList.remove('mostrar');
          void infoCard.offsetWidth; 
          
          if (datosModal.titulo || datosModal.ubicacion || datosModal.fecha || datosModal.descripcion) {
            infoCard.classList.add('mostrar');
          }
        }
      };

      // Ejecutar animación de la ruta en mapa antes de revelar la foto
      if (typeof AtlasEngine !== 'undefined' && datosModal.ubicacion) {
        AtlasEngine.ejecutarTransicion(atlasCanvas, {
          ubicacion: datosModal.ubicacion,
          mapa: datosModal.mapa
        }, mostrarFotografia);
      } else {
        mostrarFotografia();
      }

      links.forEach(l => l.setAttribute('tabindex', -1));
    });
  });

  modalVideo.addEventListener('touchstart', manejarDobleTap, { passive: true });
  modalVideo.addEventListener('click', manejarDobleTap);

  overlay.addEventListener('click', function(e) {
    const esModalVideo = modalVideo.style.display === 'block';

    if (e.target === overlay) {
      if (esModalVideo) {
        manejarDobleTap();
      } else {
        cerrarModal(links);
      }
    } else if (!esModalVideo && e.target !== modalImg) {
      cerrarModal(links);
    }
  });
}

function cerrarModal(links) {
  overlay.classList.remove('overlay');
  modalImg.classList.remove('foto-visible');
  modalVideo.classList.remove('foto-visible');
  modalVideo.pause();
  modalVideo.src = '';
  if (infoCard) infoCard.classList.remove('mostrar');
  links.forEach(l => l.setAttribute('tabindex', 0));
}