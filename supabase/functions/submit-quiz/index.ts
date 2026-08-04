import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuizAnswer {
  question_id: string;
  selected_option_index: number;
  open_answer?: string | null;
}

interface QuizRequestBody {
  answers: QuizAnswer[];
  location?: {
    state: string;
    city: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Client with service role for DB writes; user identity comes from the JWT.
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Verify the user's JWT from the Authorization header.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await serviceClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = userData.user.id;

    // Parse and validate the request body.
    let body: QuizRequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Answers array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch all quiz questions to validate answers server-side.
    const { data: questions, error: questionsError } = await serviceClient
      .from("quiz_questions")
      .select("id, options, allow_open_answer, order_index");

    if (questionsError || !questions) {
      return new Response(
        JSON.stringify({ error: "Failed to load questions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Validate each answer against the real question set.
    const validatedResponses: Array<{
      user_id: string;
      question_id: string;
      selected_option_index: number;
      open_answer: string | null;
    }> = [];

    const scores = {
      exact_sciences: 0,
      humanities: 0,
      biological: 0,
      technology: 0,
      arts_creative: 0,
    };

    let maxPossibleScore = 0;

    for (const answer of body.answers) {
      const question = questionMap.get(answer.question_id);
      if (!question) {
        return new Response(
          JSON.stringify({ error: "Invalid question reference" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const options = question.options as Array<{
        text: string;
        scores?: Record<string, number>;
      }>;

      if (
        typeof answer.selected_option_index !== "number" ||
        answer.selected_option_index < 0 ||
        answer.selected_option_index >= options.length
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid option selection" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Sanitize open answer: trim and cap length.
      let openAnswer: string | null = null;
      if (question.allow_open_answer && answer.open_answer) {
        openAnswer = String(answer.open_answer).trim().slice(0, 2000);
      }

      validatedResponses.push({
        user_id: userId,
        question_id: answer.question_id,
        selected_option_index: answer.selected_option_index,
        open_answer: openAnswer,
      });

      // Accumulate scores server-side — client never computes these.
      const selectedOption = options[answer.selected_option_index];
      if (selectedOption?.scores) {
        for (const [area, points] of Object.entries(selectedOption.scores)) {
          if (area in scores) {
            scores[area as keyof typeof scores] += points || 0;
          }
        }
      }

      // Track the max possible per question (highest-scoring option).
      let bestOptionScore = 0;
      for (const opt of options) {
        if (opt.scores) {
          const optTotal = Object.values(opt.scores).reduce((a, b) => a + (b || 0), 0);
          if (optTotal > bestOptionScore) bestOptionScore = optTotal;
        }
      }
      maxPossibleScore += bestOptionScore || 25;
    }

    // Normalize scores to 0–100.
    const normalizedScores = {
      exact_sciences: Math.min(100, Math.round((scores.exact_sciences / Math.max(maxPossibleScore, 1)) * 100)),
      humanities: Math.min(100, Math.round((scores.humanities / Math.max(maxPossibleScore, 1)) * 100)),
      biological: Math.min(100, Math.round((scores.biological / Math.max(maxPossibleScore, 1)) * 100)),
      technology: Math.min(100, Math.round((scores.technology / Math.max(maxPossibleScore, 1)) * 100)),
      arts_creative: Math.min(100, Math.round((scores.arts_creative / Math.max(maxPossibleScore, 1)) * 100)),
    };

    // Replace previous responses atomically.
    const { error: deleteError } = await serviceClient
      .from("quiz_responses")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: "Failed to update responses" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: insertError } = await serviceClient
      .from("quiz_responses")
      .insert(validatedResponses);

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to save responses" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Save location to profile if provided
    if (body.location && body.location.state && body.location.city) {
      const stateUf = String(body.location.state).trim().slice(0, 2).toUpperCase();
      const cityName = String(body.location.city).trim().slice(0, 100);

      if (stateUf.length === 2 && cityName.length > 0) {
        const { error: profileError } = await serviceClient
          .from("profiles")
          .update({ state: stateUf, city: cityName, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (profileError) {
          return new Response(
            JSON.stringify({ error: "Failed to save location" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }
    }

    const { error: skillError } = await serviceClient
      .from("skill_profiles")
      .upsert({
        user_id: userId,
        ...normalizedScores,
        completed_at: new Date().toISOString(),
      });

    if (skillError) {
      return new Response(
        JSON.stringify({ error: "Failed to save skill profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, scores: normalizedScores }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    // Never leak internal details to the client.
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
