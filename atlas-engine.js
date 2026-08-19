const AtlasEngine = (function () {
  const cacheMapas = {};
  
  // Coordenadas locales simplificadas dentro de los mapas SVG
  const coordenadas = {
    'world': {
      'cdmx': { x: 210, y: 220, label: 'Ciudad de México' },
      'madrid': { x: 480, y: 160, label: 'Madrid' },
      'londres': { x: 475, y: 130, label: 'Londres' },
      'tokio': { x: 820, y: 180, label: 'Tokio' }
    },
    'europe': {
      'madrid': { x: 210, y: 380, label: 'Madrid' },
      'paris': { x: 270, y: 290, label: 'París' },
      'londres': { x: 240, y: 245, label: 'Londres' },
      'brujas': { x: 275, y: 250, label: 'Brujas' }
    }
  };

  // Definición de itinerarios del viaje para hacer la progresión real
  const itinerarios = {
    'londres': ['madrid', 'paris', 'londres'],
    'brujas': ['madrid', 'paris', 'brujas'],
    'paris': ['madrid', 'paris'],
    'madrid': ['madrid']
  };

  async function cargarMapa(nombreMapa) {
    if (cacheMapas[nombreMapa]) return cacheMapas[nombreMapa];
    try {
      const respuesta = await fetch(`maps/${nombreMapa}.svg`);
      const svgTexto = await respuesta.text();
      cacheMapas[nombreMapa] = svgTexto;
      return svgTexto;
    } catch (e) {
      console.warn("No se pudo cargar el mapa offline:", nombreMapa);
      return '';
    }
  }

  function resolverClaveUbicacion(textoUbicacion) {
    if (!textoUbicacion) return null;
    const minuscula = textoUbicacion.toLowerCase();
    if (minuscula.includes('londres')) return 'londres';
    if (minuscula.includes('madrid')) return 'madrid';
    if (minuscula.includes('parís') || minuscula.includes('paris')) return 'paris';
    if (minuscula.includes('brujas')) return 'brujas';
    if (minuscula.includes('méxico') || minuscula.includes('cdmx')) return 'cdmx';
    return null;
  }

  async function renderizarRuta(contenedor, datos) {
    const mapaElegido = datos.mapa || 'europe';
    const claveUbicacion = resolverClaveUbicacion(datos.ubicacion);
    
    const svgContenido = await cargarMapa(mapaElegido);
    if (!svgContenido) return;

    contenedor.innerHTML = svgContenido;
    const svgElem = contenedor.querySelector('svg');
    const layerRuta = svgElem.querySelector('#route-layer');
    const layerNodos = svgElem.querySelector('#nodes-layer');

    if (!claveUbicacion || !coordenadas[mapaElegido]) {
      contenedor.classList.add('visible');
      return;
    }

    const secuencia = itinerarios[claveUbicacion] || [claveUbicacion];
    const coordsMapa = coordenadas[mapaElegido];

    let dPath = '';
    let puntos = [];

    secuencia.forEach((p, idx) => {
      if (coordsMapa[p]) {
        const pt = coordsMapa[p];
        puntos.push(pt);
        dPath += (idx === 0) ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`;
      }
    });

    if (puntos.length > 1) {
      const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElem.setAttribute('d', dPath);
      pathElem.setAttribute('class', 'atlas-flight-path');
      
      layerRuta.appendChild(pathElem);

      const largoTotal = pathElem.getTotalLength();
      pathElem.style.strokeDasharray = largoTotal;
      pathElem.style.strokeDashoffset = largoTotal;

      // Fase 1: Mostrar mapa (200ms)
      contenedor.classList.add('visible');

      // Fase 2: Trazado incremental de la ruta (220ms)
      setTimeout(() => {
        pathElem.style.transition = 'stroke-dashoffset 220ms ease-in-out';
        pathElem.style.strokeDashoffset = '0';
      }, 150);
    } else {
      contenedor.classList.add('visible');
    }

    // Dibujar nodos de parada
    puntos.forEach((pt, idx) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', idx === puntos.length - 1 ? 4 : 2.5);
      circle.setAttribute('class', idx === puntos.length - 1 ? 'atlas-node-target' : 'atlas-node');
      layerNodos.appendChild(circle);
    });
  }

  function limpiar(contenedor) {
    contenedor.classList.remove('visible');
    setTimeout(() => { contenedor.innerHTML = ''; }, 200);
  }

  return { renderizarRuta, limpiar };
})();