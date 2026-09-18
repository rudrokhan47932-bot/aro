import type { getMemberData, getAdminData } from "@/lib/server/data";

export type MemberData = Awaited<ReturnType<typeof getMemberData>>;
export type AdminData = Awaited<ReturnType<typeof getAdminData>>;
