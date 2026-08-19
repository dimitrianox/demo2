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

  function ejecutarSecuenciaAtlas(contenedor, datos, alEmergerFoto) {
    const mapaElegido = datos.mapa || 'europe';
    const claveUbicacion = resolverClaveUbicacion(datos.ubicacion);

    cargarMapa(mapaElegido).then(svgContenido => {
      if (!svgContenido || !claveUbicacion) {
        if (alEmergerFoto) alEmergerFoto();
        return;
      }

      contenedor.innerHTML = svgContenido;
      const svgElem = contenedor.querySelector('svg');
      if (svgElem) svgElem.classList.add('atlas-svg');

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

      const destino = puntos[puntos.length - 1];

      // T0 ms: 3. MAPA APARECE (Fade In)
      contenedor.classList.add('activo');

      // T200 ms: 4. RUTA SE DIBUJA
      setTimeout(() => {
        if (puntos.length > 1 && layerRuta) {
          const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathElem.setAttribute('d', dPath);
          pathElem.setAttribute('class', 'atlas-flight-path');
          layerRuta.appendChild(pathElem);

          const largoTotal = pathElem.getTotalLength();
          pathElem.style.strokeDasharray = largoTotal;
          pathElem.style.strokeDashoffset = largoTotal;

          pathElem.style.transition = 'stroke-dashoffset 200ms ease-in-out';
          pathElem.style.strokeDashoffset = '0';
        }

        if (layerNodos) {
          puntos.forEach((pt, idx) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pt.x);
            circle.setAttribute('cy', pt.y);
            circle.setAttribute('r', idx === puntos.length - 1 ? 5 : 3);
            circle.setAttribute('class', idx === puntos.length - 1 ? 'atlas-node-target' : 'atlas-node');
            layerNodos.appendChild(circle);
          });
        }
      }, 200);

      // T400 ms: 5. ZOOM A LA CIUDAD
      setTimeout(() => {
        if (destino && svgElem) {
          svgElem.style.transformOrigin = `${(destino.x / 800) * 100}% ${(destino.y / 600) * 100}%`;
          svgElem.style.transform = 'scale(2.2)';
        }
      }, 400);

      // T600 ms: 6. FOTO EMERGE Y EXPANDE
      setTimeout(() => {
        if (alEmergerFoto) alEmergerFoto();
      }, 600);

      // T700 ms: 7. FOTO COMPLETA (Mapa Desaparece por completo)
      setTimeout(() => {
        contenedor.classList.remove('activo');
        setTimeout(() => { contenedor.innerHTML = ''; }, 200);
      }, 750);

    }).catch(() => {
      if (alEmergerFoto) alEmergerFoto();
    });
  }

  return { ejecutarSecuenciaAtlas };
})();