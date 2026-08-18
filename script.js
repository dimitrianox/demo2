const contenedorGaleria = document.getElementById('galeria');
const overlay = document.querySelector('.modal');
const infoCard = document.querySelector('.info-card');
const modalImg = document.getElementById('modal-img');
const modalVideo = document.getElementById('modal-video');

const clasesTamano = ['', 'span-col-2', 'span-row-2', 'span-big'];
const extensionesVideo = ['.mp4', '.webm', '.ogg', '.mov'];

function esVideo(url) {
  return extensionesVideo.some(ext => url.toLowerCase().includes(ext));
}

fetch('fotos.json')
  .then(res => res.json())
  .then(misFotos => {
    misFotos.forEach(item => {
      const url = typeof item === 'string' ? item : item.url;
      const titulo = item.titulo || '';
      const ubicacion = item.ubicacion || '';
      const fecha = item.fecha || '';
      const descripcion = item.descripcion || '';

      const anchor = document.createElement('a');
      anchor.href = '#';
      
      const claseAzar = clasesTamano[Math.floor(Math.random() * clasesTamano.length)];
      if (claseAzar) anchor.classList.add(claseAzar);

      anchor.dataset.url = url;
      anchor.dataset.titulo = titulo;
      anchor.dataset.ubicacion = ubicacion;
      anchor.dataset.fecha = fecha;
      anchor.dataset.descripcion = descripcion;
      anchor.dataset.esVideo = esVideo(url);

      if (esVideo(url)) {
        const video = document.createElement('video');
        video.src = url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        anchor.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = url;
        img.alt = titulo || 'Fotografía';
        anchor.appendChild(img);
      }

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
      
      const url = this.dataset.url;
      const esVid = this.dataset.esVideo === 'true';

      if (esVid) {
        modalImg.style.display = 'none';
        modalImg.src = '';
        
        modalVideo.src = url;
        modalVideo.style.display = 'block';
        modalVideo.play();
      } else {
        modalVideo.style.display = 'none';
        modalVideo.pause();
        modalVideo.src = '';
        
        modalImg.src = url;
        modalImg.style.display = 'block';
      }
      
      if (document.getElementById('info-titulo')) {
        document.getElementById('info-titulo').textContent = this.dataset.titulo;
        document.getElementById('info-ubicacion').textContent = this.dataset.ubicacion ? `📍 ${this.dataset.ubicacion}` : '';
        document.getElementById('info-fecha').textContent = this.dataset.fecha ? `📅 ${this.dataset.fecha}` : '';
        document.getElementById('info-descripcion').textContent = this.dataset.descripcion;

        infoCard.classList.remove('mostrar');
        void infoCard.offsetWidth; 
        
        if (this.dataset.titulo || this.dataset.ubicacion || this.dataset.fecha || this.dataset.descripcion) {
          infoCard.classList.add('mostrar');
        }
      }

      overlay.classList.add('overlay');
      links.forEach(l => l.setAttribute('tabindex', -1));
    });
  });

  overlay.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' || e.target === overlay || e.target.closest('.modal-content')) {
      if (e.target.tagName === 'VIDEO' && e.target.hasAttribute('controls')) {
        return;
      }

      overlay.classList.remove('overlay');
      modalVideo.pause();
      modalVideo.src = '';
      if (infoCard) infoCard.classList.remove('mostrar');
      links.forEach(l => l.setAttribute('tabindex', 0));
    }
  });
}