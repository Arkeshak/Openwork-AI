import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(req, await params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(req, await params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  return handleProxy(req, await params);
}

async function handleProxy(req: NextRequest, params: { slug: string[] }) {
  const path = params.slug.join("/");
  const url = new URL(req.url);
  const searchParams = url.searchParams.toString();
  
  const backendUrl = process.env.BACKEND_URL || "https://openwork-ai-production-61b2.up.railway.app";
  const target = `${backendUrl}/${path}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const headers = new Headers();
    
    // Copy essential headers but omit host and connection
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!["host", "connection", "accept-encoding"].includes(lowerKey)) {
        headers.set(key, value);
      }
    });

    // For POST/PUT/PATCH we need the body
    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.arrayBuffer();
    }

    const response = await fetch(target, {
      method: req.method,
      headers,
      body: body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("access-control-allow-origin", "*");

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Failed to proxy request to backend" }, { status: 502 });
  }
}
