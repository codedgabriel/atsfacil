import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Mercado Pago não configurado." }, { status: 500 });
    }

    const body = (await request.json()) as { userEmail?: string; userName?: string };
    const email = body.userEmail || "comprador@atsfacil.com.br";
    const firstName = (body.userName || "Cliente").split(" ")[0];

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const paymentBody = {
      transaction_amount: 4.9,
      currency_id: "BRL",
      description: "ATSFácil — Currículo ATS",
      payment_method_id: "pix",
      payer: {
        email,
        first_name: firstName,
      },
    };
    const response = await payment.create({
      body: paymentBody as Parameters<typeof payment.create>[0]["body"],
    });

    const transactionData = response.point_of_interaction?.transaction_data;
    const qr_code = transactionData?.qr_code;
    const qr_code_base64 = transactionData?.qr_code_base64;

    if (!response.id || !qr_code || !qr_code_base64) {
      return NextResponse.json({ error: "Resposta incompleta do Mercado Pago.", response }, { status: 502 });
    }

    return NextResponse.json({ qr_code, qr_code_base64, payment_id: String(response.id) });
  } catch (error) {
    console.error("create-payment", error);
    return NextResponse.json({ error: "Erro ao gerar cobrança. Tente novamente." }, { status: 500 });
  }
}
