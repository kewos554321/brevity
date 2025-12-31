import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://brevity.vercel.app";

  // 取得所有公開的短網址（排除已過期、有密碼保護、一次性連結）
  const links = await prisma.link.findMany({
    where: {
      password: null,
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        { OR: [{ maxClicks: null }, { maxClicks: { gt: 1 } }] },
      ],
    },
    select: {
      shortCode: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const linkEntries: MetadataRoute.Sitemap = links.map((link) => ({
    url: `${baseUrl}/${link.shortCode}`,
    lastModified: link.createdAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...linkEntries,
  ];
}
