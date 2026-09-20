import ContentEditor from "@/components/admin/ContentEditor";
import { getConfig, DEFAULTS, CONFIG_GROUPS } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const config = await getConfig();

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          Content
        </h1>
        <p className="mt-1 max-w-[70ch] text-[0.85rem] leading-relaxed text-ink-soft">
          Everything the public site shows that is likely to change between one
          year and the next. Saving takes effect immediately. Reset puts a
          section back to the version compiled into the code, so nothing here
          can be permanently broken.
        </p>
      </div>

      <ContentEditor
        groups={CONFIG_GROUPS.map((g) => ({ ...g }))}
        current={config as unknown as Record<string, unknown>}
        defaults={DEFAULTS as unknown as Record<string, unknown>}
      />
    </div>
  );
}
