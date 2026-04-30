import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_SORT_FIELDS = ["createdAt", "updatedAt"];

function isValidUuid(id: string): boolean {
  return UUID_RE.test(id);
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function badRequest(message: string): Response {
  return jsonResponse({ error: message }, 400);
}

function serverError(): Response {
  return jsonResponse({ error: "An unexpected error occurred. Please try again." }, 500);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/notes-api", "");
  const method = req.method;

  try {
    // GET /categories
    if (path === "/categories" && method === "GET") {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return jsonResponse(data);
    }

    // POST /categories
    if (path === "/categories" && method === "POST") {
      const body = await req.json().catch(() => null);
      if (!body || typeof body.name !== "string" || !body.name.trim()) {
        return badRequest("name is required");
      }
      const name = body.name.trim().slice(0, 100);
      const { data, error } = await supabase.from("categories").insert({ name }).select().single();
      if (error) throw error;
      return jsonResponse(data, 201);
    }

    // GET /notes
    if (path === "/notes" && method === "GET") {
      const archived = url.searchParams.get("archived") === "true";
      const deleted = url.searchParams.get("deleted") === "true";
      const search = url.searchParams.get("search")?.slice(0, 200);
      const categoryId = url.searchParams.get("categoryId");
      const sortByParam = url.searchParams.get("sortBy") ?? "updatedAt";
      const orderParam = url.searchParams.get("order") ?? "DESC";

      const sortBy = VALID_SORT_FIELDS.includes(sortByParam) ? sortByParam : "updatedAt";
      const ascending = orderParam === "ASC";

      if (categoryId && !isValidUuid(categoryId)) {
        return badRequest("invalid categoryId");
      }

      let query = supabase
        .from("notes")
        .select(`*, categories:categories(id, name)`)
        .eq("archived", archived)
        .eq("deleted", deleted)
        .order(sortBy, { ascending });

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }
      if (categoryId) {
        query = query.eq("note_categories.category_id", categoryId);
      }
      if (deleted) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        query = query.gt("deleted_at", cutoff.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return jsonResponse(data ?? []);
    }

    // DELETE /notes/trash
    if (path === "/notes/trash" && method === "DELETE") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("deleted", true)
        .gt("deleted_at", cutoff.toISOString());
      if (error) throw error;
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // POST /notes
    if (path === "/notes" && method === "POST") {
      const body = await req.json().catch(() => null);
      if (!body || typeof body.title !== "string" || !body.title.trim()) {
        return badRequest("title is required");
      }
      if (typeof body.content !== "string") {
        return badRequest("content is required");
      }
      const title = body.title.trim().slice(0, 255);
      const content = body.content.slice(0, 100_000);
      const categoryIds: unknown = body.categoryIds;
      if (
        categoryIds !== undefined &&
        (!Array.isArray(categoryIds) || categoryIds.some((id) => !isValidUuid(id)))
      ) {
        return badRequest("categoryIds must be an array of valid UUIDs");
      }

      const { data: note, error } = await supabase
        .from("notes")
        .insert({ title, content, archived: false, deleted: false })
        .select()
        .single();
      if (error) throw error;

      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        await supabase
          .from("note_categories")
          .insert(categoryIds.map((catId: string) => ({ note_id: note.id, category_id: catId })));
      }

      return jsonResponse(note, 201);
    }

    // /notes/:id routes
    const noteIdMatch = path.match(/^\/notes\/([\w-]+)$/);
    if (noteIdMatch) {
      const noteId = noteIdMatch[1];
      if (!isValidUuid(noteId)) return badRequest("invalid note id");

      if (method === "GET") {
        const { data, error } = await supabase
          .from("notes")
          .select(`*, categories:categories(id, name)`)
          .eq("id", noteId)
          .single();
        if (error) throw error;
        return jsonResponse(data);
      }

      if (method === "PUT") {
        const body = await req.json().catch(() => null);
        if (!body || typeof body.title !== "string" || !body.title.trim()) {
          return badRequest("title is required");
        }
        if (typeof body.content !== "string") {
          return badRequest("content is required");
        }
        const title = body.title.trim().slice(0, 255);
        const content = body.content.slice(0, 100_000);
        const categoryIds: unknown = body.categoryIds;
        if (
          categoryIds !== undefined &&
          (!Array.isArray(categoryIds) || categoryIds.some((id) => !isValidUuid(id)))
        ) {
          return badRequest("categoryIds must be an array of valid UUIDs");
        }

        const { data: note, error } = await supabase
          .from("notes")
          .update({ title, content })
          .eq("id", noteId)
          .select()
          .single();
        if (error) throw error;

        if (Array.isArray(categoryIds)) {
          await supabase.from("note_categories").delete().eq("note_id", noteId);
          if (categoryIds.length > 0) {
            await supabase
              .from("note_categories")
              .insert(categoryIds.map((catId: string) => ({ note_id: note.id, category_id: catId })));
          }
        }

        return jsonResponse(note);
      }

      if (method === "DELETE") {
        const { error } = await supabase
          .from("notes")
          .update({ deleted: true, deleted_at: new Date().toISOString() })
          .eq("id", noteId);
        if (error) throw error;
        return new Response(null, { status: 204, headers: corsHeaders });
      }
    }

    // PATCH /notes/:id/archive
    const archiveMatch = path.match(/^\/notes\/([\w-]+)\/archive$/);
    if (archiveMatch && method === "PATCH") {
      const id = archiveMatch[1];
      if (!isValidUuid(id)) return badRequest("invalid note id");
      const { data: current } = await supabase.from("notes").select("archived").eq("id", id).single();
      const { data, error } = await supabase
        .from("notes")
        .update({ archived: !current?.archived })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(data);
    }

    // PATCH /notes/:id/restore
    const restoreMatch = path.match(/^\/notes\/([\w-]+)\/restore$/);
    if (restoreMatch && method === "PATCH") {
      const id = restoreMatch[1];
      if (!isValidUuid(id)) return badRequest("invalid note id");
      const { data, error } = await supabase
        .from("notes")
        .update({ deleted: false, deleted_at: null })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(data);
    }

    // DELETE /notes/:id/permanent
    const permanentMatch = path.match(/^\/notes\/([\w-]+)\/permanent$/);
    if (permanentMatch && method === "DELETE") {
      const id = permanentMatch[1];
      if (!isValidUuid(id)) return badRequest("invalid note id");
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // POST|DELETE /notes/:id/categories/:catId
    const noteCatMatch = path.match(/^\/notes\/([\w-]+)\/categories\/([\w-]+)$/);
    if (noteCatMatch) {
      const [, noteId, catId] = noteCatMatch;
      if (!isValidUuid(noteId) || !isValidUuid(catId)) return badRequest("invalid id");

      if (method === "POST") {
        const { error } = await supabase
          .from("note_categories")
          .insert({ note_id: noteId, category_id: catId });
        if (error) throw error;
        const { data } = await supabase
          .from("notes")
          .select(`*, categories:categories(id, name)`)
          .eq("id", noteId)
          .single();
        return jsonResponse(data);
      }

      if (method === "DELETE") {
        const { error } = await supabase
          .from("note_categories")
          .delete()
          .eq("note_id", noteId)
          .eq("category_id", catId);
        if (error) throw error;
        const { data } = await supabase
          .from("notes")
          .select(`*, categories:categories(id, name)`)
          .eq("id", noteId)
          .single();
        return jsonResponse(data);
      }
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error("[notes-api]", error);
    return serverError();
  }
});
