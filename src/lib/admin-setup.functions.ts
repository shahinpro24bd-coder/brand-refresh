import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function usernameToEditorEmail(username: string) {
  const clean = username.trim().toLowerCase();
  return clean.includes("@") ? clean : `${clean}@drarman.local`;
}

async function hasExistingAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export const getEditorSetupState = createServerFn({ method: "GET" }).handler(async () => {
  const hasAdmin = await hasExistingAdmin();
  return { setupRequired: !hasAdmin };
});

const setupPayload = z.object({
  username: z.string().trim().min(3).max(80),
  password: z.string().min(8).max(200),
});

export const createFirstEditor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => setupPayload.parse(input))
  .handler(async ({ data }) => {
    if (await hasExistingAdmin()) {
      throw new Error("An editor account already exists.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = usernameToEditorEmail(data.username);

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });

    if (createError) throw new Error(createError.message);
    const userId = created.user?.id;
    if (!userId) throw new Error("Could not create the editor account.");

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleError) throw new Error(roleError.message);
    return { email };
  });
