import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const jsonHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ status: "pending" }, { headers: jsonHeaders });
    if (!/^\d+$/.test(id)) return NextResponse.json({ status: "rejected" }, { headers: jsonHeaders });
    if (!accessToken) return NextResponse.json({ error: "Mercado Pago nao configurado." }, { status: 500, headers: jsonHeaders });

    const client = new MercadoPagoConfig({ accessToken: accessToken.trim() });
    const payment = new Payment(client);
    const response = await payment.get({ id });

    const status =
      response.status === "approved"
        ? "approved"
        : ["rejected", "cancelled", "refunded", "charged_back"].includes(response.status || "")
          ? "rejected"
          : "pending";

    return NextResponse.json({ status }, { headers: jsonHeaders });
  } catch (error) {
    console.error("check-payment", error);
    return NextResponse.json({ status: "pending" }, { headers: jsonHeaders });
  }
}
