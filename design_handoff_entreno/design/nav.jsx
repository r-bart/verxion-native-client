// nav.jsx — navegación entre pantallas del prototipo verxion-native.
// Cada pantalla es un archivo HTML propio; vxNav hace location.href con
// parámetros de query que fijan el estado de llegada (leídos con vxReadParams
// y fusionados sobre los TWEAK_DEFAULTS, sin persistir nada en disco).

window.VX = {
  HOY:          "Verxion Native - Hoy.html",
  ENTRENO:      "Verxion Native - Entreno.html",
  PRESCRIPCION: "Verxion Native - Prescripción del día.html",
  SESION:       "Verxion Native - Sesión en marcha.html",
  DETALLE:      "Verxion Native - Detalle de ejercicio.html",
};

// navega a `file` con `params` opcionales como query string
function vxNav(file, params) {
  let url = encodeURI(file);
  const entries = params ? Object.entries(params).filter(([, v]) => v != null) : [];
  if (entries.length) {
    url += "?" + entries.map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
  }
  window.location.href = url;
}

// lee `keys` de la URL, coaccionando "true"/"false" a booleano
function vxReadParams(keys) {
  const sp = new URLSearchParams(window.location.search);
  const out = {};
  (keys || []).forEach((k) => {
    if (sp.has(k)) {
      let v = sp.get(k);
      if (v === "true") v = true;
      else if (v === "false") v = false;
      out[k] = v;
    }
  });
  return out;
}

Object.assign(window, { vxNav, vxReadParams });
