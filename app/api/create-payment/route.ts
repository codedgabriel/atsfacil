import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";
import { PIX_PRICE_AMOUNT } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const jsonHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Mercado Pago nao configurado." }, { status: 500, headers: jsonHeaders });
    }

    const body = (await request.json()) as { userEmail?: string; userName?: string };
    const email = (body.userEmail || "comprador@atsfacil.com.br").trim();
    const firstName = (body.userName || "Cliente").trim().split(/\s+/)[0].slice(0, 60);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Informe um email valido para gerar a cobranca." }, { status: 400, headers: jsonHeaders });
    }

    const client = new MercadoPagoConfig({ accessToken: accessToken.trim() });
    const payment = new Payment(client);
    const paymentBody = {
      transaction_amount: PIX_PRICE_AMOUNT,
      description: "ATSFacil - Curriculo ATS",
      payment_method_id: "pix",
      payer: {
        email,
        first_name: firstName || "Cliente",
      },
    };

    const response = await payment.create({
      body: paymentBody as Parameters<typeof payment.create>[0]["body"],
    });

    const transactionData = response.point_of_interaction?.transaction_data;
    const qr_code = transactionData?.qr_code;
    const qr_code_base64 = transactionData?.qr_code_base64;

    if (!response.id || !qr_code || !qr_code_base64) {
      return NextResponse.json({ error: "Resposta incompleta do Mercado Pago." }, { status: 502, headers: jsonHeaders });
    }

    return NextResponse.json({ qr_code, qr_code_base64, payment_id: String(response.id) }, { headers: jsonHeaders });
  } catch (error) {
    console.error("create-payment", error);
    return NextResponse.json({ error: "Erro ao gerar cobranca. Tente novamente." }, { status: 500, headers: jsonHeaders });
  }
}
