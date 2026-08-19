const AtlasEngine = (function () {
  const cacheMapas = {};
  
  const coordenadas = {
    'world': {
      'cdmx': { x: 210, y: 220 },
      'madrid': { x: 480, y: 160 },
      'londres': { x: 475, y: 130 },
      'tokio': { x: 820, y: 180 }
    },
    'europe': {
      'madrid': { x: 210, y: 380 },
      'paris': { x: 270, y: 290 },
      'londres': { x: 240, y: 245 },
      'brujas': { x: 275, y: 250 }
    }
  };

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
      if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);
      const svgTexto = await respuesta.text();
      cacheMapas[nombreMapa] = svgTexto;
      return svgTexto;
    } catch (e) {
      console.warn("Atlas Engine: No se pudo cargar el mapa SVG:", nombreMapa, e);
      return null;
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
    if (!contenedor) return;

    const mapaElegido = datos.mapa || 'europe';
    const claveUbicacion = resolverClaveUbicacion(datos.ubicacion);
    
    const svgContenido = await cargarMapa(mapaElegido);
    if (!svgContenido) {
      // Fallback silencioso: no interrumpe la apertura de la foto si no hay mapa
      contenedor.classList.remove('visible');
      return;
    }

    contenedor.innerHTML = svgContenido;
    const svgElem = contenedor.querySelector('svg');
    if (!svgElem) return;

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

    if (puntos.length > 1 && layerRuta) {
      const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElem.setAttribute('d', dPath);
      pathElem.setAttribute('class', 'atlas-flight-path');
      
      layerRuta.appendChild(pathElem);

      try {
        const largoTotal = pathElem.getTotalLength();
        pathElem.style.strokeDasharray = largoTotal;
        pathElem.style.strokeDashoffset = largoTotal;

        contenedor.classList.add('visible');

        setTimeout(() => {
          pathElem.style.transition = 'stroke-dashoffset 220ms ease-in-out';
          pathElem.style.strokeDashoffset = '0';
        }, 150);
      } catch (e) {
        contenedor.classList.add('visible');
      }
    } else {
      contenedor.classList.add('visible');
    }

    if (layerNodos) {
      puntos.forEach((pt, idx) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        circle.setAttribute('r', idx === puntos.length - 1 ? 4 : 2.5);
        circle.setAttribute('class', idx === puntos.length - 1 ? 'atlas-node-target' : 'atlas-node');
        layerNodos.appendChild(circle);
      });
    }
  }

  function limpiar(contenedor) {
    if (!contenedor) return;
    contenedor.classList.remove('visible');
    setTimeout(() => { contenedor.innerHTML = ''; }, 200);
  }

  return { renderizarRuta, limpiar };
})();