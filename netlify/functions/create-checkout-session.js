const Stripe = require("stripe");

exports.handler = async (event) => {
  try {
    // ✅ 1) Instancia correcta con tu secret key desde env
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { service, m2, addOns, customer, clientType } = JSON.parse(event.body || "{}");

    let amount = 0;

    if (service === "luz") {
      amount = clientType === "empresarial" ? 800 * 100 : 450 * 100;
    } else {
      if (service === "feng") amount += Math.round(Number(m2 || 0) * 6 * 100);
      if (service === "hartmann") amount += 200 * 100;
      if (service === "sistemica") amount += 300 * 100;

      if (Array.isArray(addOns)) {
        if (addOns.includes("feng")) amount += Math.round(Number(m2 || 0) * 6 * 100);
        if (addOns.includes("hartmann")) amount += 200 * 100;
        if (addOns.includes("sistemica")) amount += 300 * 100;
      }
    }

    if (!amount || amount < 50) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Monto inválido." }),
      };
    }

    const pretty = {
      feng: "Feng Shui",
      hartmann: "Líneas Hartmann",
      sistemica: "Sistémica",
      luz: "Paquete Luz",
    };

    const servicesList = [service, ...(addOns || [])]
      .filter(Boolean)
      .map((s) => pretty[s] || s);

    const productName =
      service === "luz"
        ? `Paquete Luz - ${clientType || "residencial"}`
        : servicesList.join(" + ");

    // ✅ 2) Return URL dinámico: local o producción
    const baseUrl =
      process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      "http://localhost:8888";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded",
      currency: "eur",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: productName },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      customer_email: customer?.email,
      metadata: {
        service: service || "",
        clientType: clientType || "residencial",
        package:
          service === "luz"
            ? `Paquete Luz - ${clientType || "residencial"}`
            : "Individual",
        m2: String(m2 || ""),
        addOns: JSON.stringify(addOns || []),
        name: `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim(),
        phone: customer?.phone || "",
        address: customer?.address || "",
        city: customer?.city || "",
        country: customer?.country || "",
      },
      return_url: `${baseUrl}/gracias/index.html?session_id={CHECKOUT_SESSION_ID}`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientSecret: session.client_secret }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
