import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ status: "pending" });
    if (!accessToken) return NextResponse.json({ error: "Mercado Pago não configurado." }, { status: 500 });

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const response = await payment.get({ id });

    const status = response.status === "approved" ? "approved" : ["rejected", "cancelled", "refunded", "charged_back"].includes(response.status || "") ? "rejected" : "pending";
    return NextResponse.json({ status });
  } catch (error) {
    console.error("check-payment", error);
    return NextResponse.json({ status: "pending" });
  }
}
