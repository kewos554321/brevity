import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ shortCode: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { shortCode } = await params
    const { password } = await request.json()

    const link = await prisma.link.findUnique({
      where: { shortCode },
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    if (!link.password) {
      return NextResponse.json({ error: "No password required" }, { status: 400 })
    }

    // Hash the provided password
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashedPassword = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (hashedPassword !== link.password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    return NextResponse.json({ success: true, originalUrl: link.originalUrl })
  } catch (error) {
    console.error("Error verifying password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
