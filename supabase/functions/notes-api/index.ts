import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseKey);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_SORT_FIELDS = ["created_at", "updated_at"];

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

async function getNoteCategories(noteId: string) {
  const { data } = await supabase
    .from("note_categories")
    .select("categories(id, name)")
    .eq("note_id", noteId);
  return data?.map((row) => row.categories).flat() ?? [];
}

async function attachCategories(noteId: string, categoryIds: string[]) {
  await supabase.from("note_categories").delete().eq("note_id", noteId);
  if (categoryIds.length > 0) {
    await supabase.from("note_categories").insert(
      categoryIds.map((catId) => ({ note_id: noteId, category_id: catId }))
    );
  }
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
      return jsonResponse(data ?? []);
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
       const sortByParam = url.searchParams.get("sortBy") ?? "updated_at";
      const orderParam = url.searchParams.get("order") ?? "DESC";

       const sortBy = VALID_SORT_FIELDS.includes(sortByParam) ? sortByParam : "updated_at";
      const ascending = orderParam === "ASC";

      if (categoryId && !isValidUuid(categoryId)) {
        return badRequest("invalid categoryId");
      }

      let query = supabase
        .from("notes")
        .select("*")
        .eq("archived", archived)
        .eq("deleted", deleted)
        .order(sortBy, { ascending });

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data: notes, error } = await query;
      if (error) throw error;

      const notesWithCategories = notes ?? [];

      if (notesWithCategories.length > 0) {
        const noteIds = notesWithCategories.map(n => n.id);
        const { data: links } = await supabase
          .from("note_categories")
          .select("note_id, category_id")
          .in("note_id", noteIds);

        const catIds = [...new Set(links?.map(l => l.category_id) ?? [])];
        let cats: { id: string; name: string }[] = [];
        if (catIds.length > 0) {
          const { data } = await supabase.from("categories").select("id, name").in("id", catIds);
          cats = data ?? [];
        }

        const catMap = Object.groupBy(cats, c => c.id);
        const linkMap = Object.groupBy(links ?? [], l => l.note_id);

        const enriched = notesWithCategories.map(note => ({
          ...note,
          categories: (linkMap[note.id] ?? [])
            .map(l => catMap[l.category_id]?.[0])
            .filter(Boolean)
        }));

        if (categoryId) {
          return jsonResponse(enriched.filter((n) =>
            n.categories.some((c: { id: string }) => c.id === categoryId)
          ));
        }
        return jsonResponse(enriched);
      }

      return jsonResponse(notesWithCategories.map(n => ({ ...n, categories: [] })));
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

      const { data: note, error } = await supabase
        .from("notes")
        .insert({ title, content, archived: false, deleted: false })
        .select()
        .single();
      if (error) throw error;

      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        await attachCategories(note.id, categoryIds.filter(isValidUuid));
      }

      const categories = await getNoteCategories(note.id);
      return jsonResponse({ ...note, categories }, 201);
    }

    // /notes/:id routes
    const noteIdMatch = path.match(/^\/notes\/([\w-]+)$/);
    if (noteIdMatch) {
      const noteId = noteIdMatch[1];
      if (!isValidUuid(noteId)) return badRequest("invalid note id");

      if (method === "GET") {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("id", noteId)
          .single();
        if (error) throw error;
        const categories = await getNoteCategories(noteId);
        return jsonResponse({ ...data, categories });
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

        const { data: note, error } = await supabase
          .from("notes")
          .update({ title, content })
          .eq("id", noteId)
          .select()
          .single();
        if (error) throw error;

        if (Array.isArray(categoryIds)) {
          await attachCategories(noteId, categoryIds.filter(isValidUuid));
        }

        const categories = await getNoteCategories(noteId);
        return jsonResponse({ ...note, categories });
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
      const { data: current, error: fetchError } = await supabase
        .from("notes")
        .select("archived")
        .eq("id", id)
        .single();
      if (fetchError || !current) return badRequest("note not found");
      const newArchived = !current.archived;
      const { data, error } = await supabase
        .from("notes")
        .update({ archived: newArchived })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      const categories = await getNoteCategories(id);
      return jsonResponse({ ...data, categories });
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
      const categories = await getNoteCategories(id);
      return jsonResponse({ ...data, categories });
    }

    // DELETE /notes/:id/permanent
    const permanentMatch = path.match(/^\/notes\/([\w-]+)\/permanent$/);
    if (permanentMatch && method === "DELETE") {
      const id = permanentMatch[1];
      if (!isValidUuid(id)) return badRequest("invalid note id");
      await supabase.from("note_categories").delete().eq("note_id", id);
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
       }

       if (method === "DELETE") {
         const { error } = await supabase
           .from("note_categories")
           .delete()
           .eq("note_id", noteId)
           .eq("category_id", catId);
         if (error) throw error;
       }

      const { data: note } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();
      const categories = await getNoteCategories(noteId);
      return jsonResponse({ ...note, categories });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error("[notes-api]", error);
    const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
    return jsonResponse({ error: "Server error", details: errMsg }, 500);
  }
});