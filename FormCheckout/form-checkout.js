

console.log("✅ form-checkout.js cargado");


document.addEventListener("DOMContentLoaded", () => {
  const btnContinue = document.getElementById("btonContinuar");
  const btnBack = document.getElementById("btnBack");

  const step1Tab = document.querySelector('.step-grid[data-step="1"]');
  const step2Tab = document.querySelector('.step-grid[data-step="2"]');

  const step1Panel = document.getElementById("step1-form");
  const step2Panel = document.getElementById("step2-payment");

  const form = document.getElementById("service-form");
  const recap = document.getElementById("order-recap");
  const checkoutMount = document.getElementById("embedded-checkout");

  if (!btnContinue || !form || !step1Panel || !step2Panel || !recap || !checkoutMount) return;

  let embeddedCheckout = null;
  let lastClientSecret = null;

  // Stripe
  if (!window.Stripe) {
  alert("Stripe.js no cargó");
  return;
  }

  if (!window.STRIPE_PUBLISHABLE_KEY) {
  alert("Falta la publishable key");
  return;
  }

  const stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY);


  function setActiveStep(step) {
    if (step === 1) {
      step1Tab?.classList.add("is-active");
      step2Tab?.classList.remove("is-active");

      step1Panel.hidden = false;
      step2Panel.hidden = true;
    } else {
      step1Tab?.classList.remove("is-active");
      step2Tab?.classList.add("is-active");

      step1Panel.hidden = true;
      step2Panel.hidden = false;
    }
  }

  function getSelectedServices() {
    return Array.from(form.querySelectorAll('input[name="servicios"]:checked'))
      .map(i => i.value);
  }

  function buildRecap({ servicios, m2, customerType }) {
    const PRICES = {
      residencial: { feng: 6, hartmann: 200, sistemica: 300, luz: 450 },
      empresarial: { feng: 12, hartmann: 350, sistemica: 500, luz: 800 },
    };
    const price = PRICES[customerType] || PRICES.residencial;

   
    let total = 0;
    let lines = [];

    if (servicios.includes("paquete-luz")) {
      total = price.luz;
      lines.push({ name: `Paquete Luz(${customerType})`, price: price.luz });
    } else {
      if (servicios.includes("feng")) {
        const p = (Number(m2 || 0) * price.feng);
        total += p;
        lines.push({ name: `Feng Shui (€${price.feng}/m²)`, price: p });
      }
      if (servicios.includes("hartmann")) {
        total += price.hartmann;
        lines.push({ name: "Líneas Hartmann", price: price.hartmann });
      }
      if (servicios.includes("sistemica")) {
        total += price.sistemica;
        lines.push({ name: "Sistémica", price: price.sistemica });
      }
    }

    recap.innerHTML = `
      <div class="recap-card">
        <h3>Resumen de compra</h3>
        <p><strong>Tipo de espacio:</strong> ${customerType || "residencial"}</p>
        <ul>
          ${lines.map(l => `<li>${l.name} <strong>€${Math.round(l.price)}</strong></li>`).join("")}
        </ul>
        <p class="total"><strong>Total estimado:</strong> €${Math.round(total)}</p>
      </div>
    `;
    
  }

  async function createEmbeddedSession(payload) {
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

     const text = await res.text(); // 👈 lee SIEMPRE texto primero

      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error(text || "La función no devolvió JSON"); }

  if (!res.ok) throw new Error(data?.error || "Error creando sesión");
  return data.clientSecret;
  }

    async function mountEmbeddedCheckout(clientSecret) {
  // Si ya hay uno montado, destrúyelo antes de crear otro
  if (embeddedCheckout) {
    try { embeddedCheckout.destroy(); } catch (e) {}
    embeddedCheckout = null;
  }

  checkoutMount.innerHTML = ""; // limpia contenedor

  embeddedCheckout = await stripe.initEmbeddedCheckout({ clientSecret });
  embeddedCheckout.mount("#embedded-checkout");
  lastClientSecret = clientSecret;
}


  btnContinue.addEventListener("click", async () => {
    // Validación HTML (required, email, etc.)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const fd = new FormData(form);

    const customerType = fd.get("tipo-de-espacio");

    const servicios = getSelectedServices();
    if (servicios.length === 0) {
      alert("Selecciona al menos un servicio.");
      return;
    }

    const payload = {
  clientType: customerType,

  // service principal
  service: servicios.includes("paquete-luz") ? "luz" : (servicios[0] || ""),
  m2: fd.get("metros"),
    

  // addOns
  addOns: servicios.includes("paquete-luz") ? [] : servicios.slice(1),

  customer: {
    firstName: fd.get("nombre"),
    lastName: fd.get("apellido"),
    email: fd.get("email"),
    phone: fd.get("telefono"),
    address: fd.get("direccion"),
    city: fd.get("ciudad"),
    country: fd.get("pais"),
    postalCode: fd.get("codigo-postal"),
  },
};


    // 1) activa step2 y muestra recap
    buildRecap({ servicios, m2: payload.m2, customerType });
    setActiveStep(2);

    try {
      // 2) crea sesión embedded y monta checkout
      const clientSecret = await createEmbeddedSession(payload);
      await mountEmbeddedCheckout(clientSecret);
    } catch (err) {
      alert(err.message);
      // vuelve al step1 si falla
      setActiveStep(1);
    }
  });

 btnBack?.addEventListener("click", () => {
  if (embeddedCheckout) {
    try { embeddedCheckout.destroy(); } catch (e) {}
    embeddedCheckout = null;
  }
  checkoutMount.innerHTML = "";
  setActiveStep(1);
});
});