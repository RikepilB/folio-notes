import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/notes-api", "");
  const method = req.method;

  try {
    // Categories endpoints
    if (path === "/categories" && method === "GET") {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "/categories" && method === "POST") {
      const { name } = await req.json();
      const { data, error } = await supabase.from("categories").insert({ name }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notes list with filters
    if (path === "/notes" && method === "GET") {
      const archived = url.searchParams.get("archived") === "true";
      const deleted = url.searchParams.get("deleted") === "true";
      const search = url.searchParams.get("search");
      const categoryId = url.searchParams.get("categoryId");
      const sortBy = url.searchParams.get("sortBy") || "updatedAt";
      const order = url.searchParams.get("order") || "DESC";

      let query = supabase
        .from("notes")
        .select(`
          *,
          categories:categories(id, name)
        `)
        .eq("archived", archived)
        .eq("deleted", deleted)
        .order(sortBy, { ascending: order === "ASC" });

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      if (categoryId) {
        query = query.eq("note_categories.category_id", categoryId);
      }

      // Handle deleted_at filter for trash
      if (deleted) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        query = query.gt("deleted_at", cutoff.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create note
    if (path === "/notes" && method === "POST") {
      const { title, content, categoryIds } = await req.json();
      const { data: note, error } = await supabase
        .from("notes")
        .insert({ title, content, archived: false, deleted: false })
        .select()
        .single();
      if (error) throw error;

      if (categoryIds && categoryIds.length > 0) {
        await supabase.from("note_categories").insert(
          categoryIds.map((catId: string) => ({ note_id: note.id, category_id: catId }))
        );
      }

      return new Response(JSON.stringify(note), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get single note
    const noteIdMatch = path.match(/^\/notes\/([\w-]+)$/);
    if (noteIdMatch && method === "GET") {
      const { data, error } = await supabase
        .from("notes")
        .select(`*, categories:categories(id, name)`)
        .eq("id", noteIdMatch[1])
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update note
    if (noteIdMatch && method === "PUT") {
      const { title, content, categoryIds } = await req.json();
      const { data: note, error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", noteIdMatch[1])
        .select()
        .single();
      if (error) throw error;

      if (categoryIds) {
        await supabase.from("note_categories").delete().eq("note_id", noteIdMatch[1]);
        if (categoryIds.length > 0) {
          await supabase.from("note_categories").insert(
            categoryIds.map((catId: string) => ({ note_id: note.id, category_id: catId }))
          );
        }
      }

      return new Response(JSON.stringify(note), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Toggle archive
    if (path.match(/^\/notes\/([\w-]+)\/archive$/) && method === "PATCH") {
      const id = path.match(/^\/notes\/([\w-]+)\/archive$/)?.[1];
      const { data: current } = await supabase.from("notes").select("archived").eq("id", id).single();
      const { data, error } = await supabase
        .from("notes")
        .update({ archived: !current?.archived })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Soft delete
    if (noteIdMatch && method === "DELETE") {
      const { data, error } = await supabase
        .from("notes")
        .update({ deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", noteIdMatch[1])
        .select()
        .single();
      if (error) throw error;
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Restore from trash
    if (path.match(/^\/notes\/([\w-]+)\/restore$/) && method === "PATCH") {
      const id = path.match(/^\/notes\/([\w-]+)\/restore$/)?.[1];
      const { data, error } = await supabase
        .from("notes")
        .update({ deleted: false, deleted_at: null })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Permanent delete
    if (path.match(/^\/notes\/([\w-]+)\/permanent$/) && method === "DELETE") {
      const id = path.match(/^\/notes\/([\w-]+)\/permanent$/)?.[1];
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Add category to note
    if (path.match(/^\/notes\/([\w-]+)\/categories\/([\w-]+)$/) && method === "POST") {
      const [, noteId, catId] = path.match(/^\/notes\/([\w-]+)\/categories\/([\w-]+)$/)!;
      const { error } = await supabase.from("note_categories").insert({ note_id: noteId, category_id: catId });
      if (error) throw error;
      const { data } = await supabase.from("notes").select(`*, categories:categories(id, name)`).eq("id", noteId).single();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Remove category from note
    if (path.match(/^\/notes\/([\w-]+)\/categories\/([\w-]+)$/) && method === "DELETE") {
      const [, noteId, catId] = path.match(/^\/notes\/([\w-]+)\/categories\/([\w-]+)$/)!;
      const { error } = await supabase.from("note_categories").delete().eq("note_id", noteId).eq("category_id", catId);
      if (error) throw error;
      const { data } = await supabase.from("notes").select(`*, categories:categories(id, name)`).eq("id", noteId).single();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Empty trash
    if (path === "/notes/trash" && method === "DELETE") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const { error } = await supabase.from("notes").delete().eq("deleted", true).gt("deleted_at", cutoff.toISOString());
      if (error) throw error;
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});