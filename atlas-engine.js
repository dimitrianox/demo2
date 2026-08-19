const AtlasEngine = (function () {
  const cacheMapas = {};
  
  const coordenadas = {
    'world': {
      'cdmx': { x: 210, y: 220 },
      'madrid': { x: 480, y: 160 },
      'londres': { x: 475, y: 130 }
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
      if (!respuesta.ok) return null;
      const svgTexto = await respuesta.text();
      cacheMapas[nombreMapa] = svgTexto;
      return svgTexto;
    } catch (e) {
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
    return null;
  }

  function ejecutarTransicion(contenedor, datos, alFinalizar) {
    const mapaElegido = datos.mapa || 'europe';
    const claveUbicacion = resolverClaveUbicacion(datos.ubicacion);

    cargarMapa(mapaElegido).then(svgContenido => {
      if (!svgContenido || !claveUbicacion) {
        // Fallback rápido si no hay mapa o ubicación
        if (alFinalizar) alFinalizar();
        return;
      }

      contenedor.innerHTML = svgContenido;
      const svgElem = contenedor.querySelector('svg');
      const layerRuta = svgElem.querySelector('#route-layer');
      const layerNodos = svgElem.querySelector('#nodes-layer');
      const coordsMapa = coordenadas[mapaElegido];

      const secuencia = itinerarios[claveUbicacion] || [claveUbicacion];
      let dPath = '';
      let puntos = [];

      secuencia.forEach((p, idx) => {
        if (coordsMapa[p]) {
          const pt = coordsMapa[p];
          puntos.push(pt);
          dPath += (idx === 0) ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`;
        }
      });

      // 1. Mostrar pantalla de mapa (150ms)
      contenedor.classList.add('activo');

      const destino = puntos[puntos.length - 1];

      if (puntos.length > 1 && layerRuta) {
        const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElem.setAttribute('d', dPath);
        pathElem.setAttribute('class', 'atlas-flight-path');
        layerRuta.appendChild(pathElem);

        const largoTotal = pathElem.getTotalLength();
        pathElem.style.strokeDasharray = largoTotal;
        pathElem.style.strokeDashoffset = largoTotal;

        // 2. Dibujar ruta y hacer zoom a la ciudad destino (150ms -> 350ms)
        setTimeout(() => {
          pathElem.style.transition = 'stroke-dashoffset 200ms ease-in-out';
          pathElem.style.strokeDashoffset = '0';

          if (destino) {
            svgElem.style.transformOrigin = `${(destino.x / 800) * 100}% ${(destino.y / 600) * 100}%`;
            svgElem.style.transform = 'scale(1.8)';
          }
        }, 120);
      }

      // Dibujar nodos
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

      // 3. Transformación y ocultamiento total del mapa (450ms -> 600ms)
      setTimeout(() => {
        contenedor.classList.remove('activo');
        if (alFinalizar) alFinalizar();
        
        // Limpiar el DOM del mapa al completar la transición
        setTimeout(() => {
          contenedor.innerHTML = '';
          svgElem.style.transform = 'scale(1)';
        }, 200);
      }, 420);
    }).catch(() => {
      if (alFinalizar) alFinalizar();
    });
  }

  return { ejecutarTransicion };
})();