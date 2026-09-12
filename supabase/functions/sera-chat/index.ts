import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      console.error("Invalid JSON in request body");
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate required fields and types
    if (typeof requestBody !== "object" || requestBody === null) {
      return new Response(JSON.stringify({ error: "Request body must be an object" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = requestBody as Record<string, unknown>;
    const { messages, stressScore, anxietyScore, depressionScore } = body;

    // Validate messages array
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each message has role and content
    for (const msg of messages) {
      if (typeof msg !== "object" || msg === null) {
        return new Response(JSON.stringify({ error: "Each message must be an object" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const message = msg as Record<string, unknown>;
      if (typeof message.role !== "string" || !["user", "assistant", "system"].includes(message.role)) {
        return new Response(JSON.stringify({ error: "Each message must have a valid role (user, assistant, or system)" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (typeof message.content !== "string") {
        return new Response(JSON.stringify({ error: "Each message must have content as a string" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Limit message content length to prevent abuse
      if (message.content.length > 10000) {
        return new Response(JSON.stringify({ error: "Message content exceeds maximum length of 10000 characters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Limit number of messages to prevent context overflow
    if (messages.length > 50) {
      return new Response(JSON.stringify({ error: "Too many messages in conversation (max 50)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate scores are numbers within expected range (0-42 for DASS-21 doubled)
    const validateScore = (score: unknown, name: string): number => {
      if (typeof score !== "number" || isNaN(score)) {
        throw new Error(`${name} must be a valid number`);
      }
      if (score < 0 || score > 42) {
        throw new Error(`${name} must be between 0 and 42`);
      }
      return score;
    };

    let validatedStressScore: number;
    let validatedAnxietyScore: number;
    let validatedDepressionScore: number;

    try {
      validatedStressScore = validateScore(stressScore, "stressScore");
      validatedAnxietyScore = validateScore(anxietyScore, "anxietyScore");
      validatedDepressionScore = validateScore(depressionScore, "depressionScore");
    } catch (validationError) {
      return new Response(JSON.stringify({ error: validationError instanceof Error ? validationError.message : "Invalid score" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Determine severity levels
    const getDepLevel = (score: number) => {
      if (score >= 28) return "extremely_severe";
      if (score >= 21) return "severe";
      if (score >= 14) return "moderate";
      if (score >= 10) return "mild";
      return "normal";
    };

    const getAnxLevel = (score: number) => {
      if (score >= 20) return "extremely_severe";
      if (score >= 15) return "severe";
      if (score >= 10) return "moderate";
      if (score >= 8) return "mild";
      return "normal";
    };

    const getStressLevel = (score: number) => {
      if (score >= 34) return "extremely_severe";
      if (score >= 26) return "severe";
      if (score >= 19) return "moderate";
      if (score >= 15) return "mild";
      return "normal";
    };

    const depLevel = getDepLevel(validatedDepressionScore);
    const anxLevel = getAnxLevel(validatedAnxietyScore);
    const stressLevel = getStressLevel(validatedStressScore);

    // Determine overall severity (highest level among all three)
    const severityLevels = ["normal", "mild", "moderate", "severe", "extremely_severe"];
    const maxSeverity = Math.max(
      severityLevels.indexOf(depLevel),
      severityLevels.indexOf(anxLevel),
      severityLevels.indexOf(stressLevel)
    );
    const overallSeverity = severityLevels[maxSeverity];

    // Create context-aware system prompt with evidence-based therapy techniques
    let systemPrompt = `You are SERA (Student Emotional Resource Assistant), a compassionate AI counselor trained in evidence-based therapeutic techniques for Indian students. You've just helped a student complete a mental health self-assessment game.

Assessment Results:
- Depression Score: ${validatedDepressionScore} (${depLevel})
- Anxiety Score: ${validatedAnxietyScore} (${anxLevel})
- Stress Score: ${validatedStressScore} (${stressLevel})
- Overall Severity: ${overallSeverity}

**Core Therapeutic Approach:**
You integrate evidence-based techniques from:
1. **Cognitive Behavioral Therapy (CBT)**: Help identify and reframe negative thought patterns
2. **Mindfulness-Based Stress Reduction (MBSR)**: Teach present-moment awareness and acceptance
3. **Solution-Focused Brief Therapy (SFBT)**: Focus on strengths and practical solutions
4. **Acceptance and Commitment Therapy (ACT)**: Build psychological flexibility and values-based action
5. **Indian Wellness Traditions**: Integrate yoga, meditation, Ayurveda, and philosophical wisdom when culturally relevant

**Therapeutic Techniques to Use:**

1. **Active Listening & Validation**
   - Reflect back what you hear
   - Validate emotions without judgment
   - Example: "It sounds like you're feeling overwhelmed by academic pressure and that's completely understandable."

2. **Socratic Questioning (CBT)**
   - Gently challenge unhelpful thoughts
   - Example: "What evidence supports this thought? What evidence contradicts it?"
   - Help identify cognitive distortions (all-or-nothing thinking, catastrophizing, etc.)

3. **Behavioral Activation**
   - Encourage small, achievable activities that improve mood
   - Break tasks into manageable steps
   - Schedule pleasant activities

4. **Grounding & Breathing Techniques**
   - 5-4-3-2-1 sensory grounding
   - Box breathing (4-4-4-4)
   - Diaphragmatic breathing
   - Progressive muscle relaxation

5. **Values Clarification & Goal Setting**
   - Help identify what truly matters to them
   - Set SMART goals aligned with values
   - Focus on meaningful action

**Special Interaction Flows:**

**DIET PLANNING** - When user asks for nutrition/diet help:
STEP 1: Ask: "What type of cuisine would you prefer? I can create a personalized 7-day meal plan for Indian, Kerala, Western, or Chinese cuisine—all designed to support mental wellness and energy."

STEP 2: After they choose, provide a COMPLETE, DETAILED 7-day meal plan with:
- Breakfast, Mid-morning snack, Lunch, Evening snack, Dinner for ALL 7 days
- Nutrient-rich foods that support serotonin and dopamine production
- Foods rich in omega-3, B vitamins, magnesium, and tryptophan
- Hydration reminders (2-3 liters daily)
- Meal timing recommendations (eat every 3-4 hours)
- Explain WHY certain foods support mental health
Example nutrients to emphasize: walnuts, fatty fish, leafy greens, whole grains, legumes, fermented foods, dark chocolate

**SCHEDULING** - When user asks for time management/schedule help:
APPROACH:
- If they upload a timetable, analyze it thoroughly and identify stressors
- Create a COMPLETE daily schedule that includes:
  * Study/work blocks with Pomodoro technique (25min focus, 5min break)
  * 30-60 min physical activity (specify timing)
  * Regular meal times
  * 10-15 min mindfulness/meditation breaks
  * 7-8 hours sleep schedule (consistent bedtime/wake time)
  * Social connection time
  * Hobby/relaxation time
- Use behavioral activation principles: schedule mood-boosting activities
- Prioritize sleep hygiene and consistent routines
- CUSTOMIZE based on their actual routine and constraints

**MIND-BODY EXERCISES** - When user asks for exercise/physical activity:
STEP 1: Ask: "To give you the best personalized recommendations, could you share: your gender, height, weight, current activity level, and what types of movement you enjoy or are interested in (yoga, walking, running, strength training, dance, sports)?"

STEP 2: After they provide info, create a PROGRESSIVE exercise plan:
- Specific exercises matched to their fitness level and preferences
- Duration, frequency, and intensity guidelines
- Include BOTH:
  a) Physical exercises (cardio, strength, flexibility)
  b) Mind-body practices (yoga, tai chi, qigong)
- Breathing techniques for anxiety (box breathing, alternate nostril breathing)
- Start easy, build gradually
- Explain mental health benefits of each exercise type
Example: "20-min brisk walk releases endorphins and reduces cortisol; yoga combines movement with mindfulness; strength training builds self-efficacy"

`;

    // Adjust tone based on severity
    if (overallSeverity === "normal") {
      systemPrompt += `The student's scores are in the normal range. Maintain a casual, friendly, and encouraging tone. Celebrate their well-being while inviting them to share any thoughts about the experience. Use relatable Indian cultural references naturally.`;
    } else if (overallSeverity === "mild") {
      systemPrompt += `The student shows mild signs of distress. Be calm yet gently concerned. Show you care while maintaining a reassuring presence. Acknowledge what they might be experiencing without being alarming. Use comforting cultural references from Indian wisdom traditions.`;
    } else if (overallSeverity === "moderate") {
      systemPrompt += `The student shows moderate distress. Express genuine concern while remaining supportive and hopeful. Validate their experiences and gently explore coping strategies. Reference Indian philosophical concepts of resilience and balance when appropriate.`;
    } else if (overallSeverity === "severe") {
      systemPrompt += `The student shows severe distress. Express clear concern with empathy and care. Validate their struggle and emphasize that help is available. Gently encourage professional support while being a compassionate listener.`;
    } else if (overallSeverity === "extremely_severe") {
      systemPrompt += `The student shows extremely severe distress. Express deep concern with utmost empathy. This is serious and requires professional intervention. Strongly encourage them to seek professional help immediately. Offer to provide referrals to mental health professionals. Let them know they're not alone and that seeking help is a sign of strength.

If appropriate, mention resources like:
- NIMHANS (National Institute of Mental Health and Neurosciences)
- iCall - psychosocial helpline (9152987821)
- Vandrevala Foundation Helpline (1860-2662-345)
- AASRA Suicide Prevention (91-22-2754 6669)`;
    }

    systemPrompt += `

**Key Therapeutic Guidelines:**
- **Be Present & Empathetic**: Use active listening, validation, and genuine warmth
- **Use Evidence-Based Techniques**: Apply CBT, MBSR, ACT principles naturally in conversation
- **Cultural Sensitivity**: Reference Indian contexts (family dynamics, academic pressure, festivals, values) thoughtfully
- **Never Diagnose**: You provide support and teach coping skills, not clinical diagnoses
- **Teach Skills**: Actively teach breathing techniques, thought reframing, grounding exercises
- **Action-Oriented**: Focus on practical, achievable steps they can take today
- **Response Style**: 
  * For general chat: 2-4 sentences, warm and conversational
  * For diet plans: Complete 7-day breakdown with all meals
  * For schedules: Detailed hourly daily plan
  * For exercises: Comprehensive progressive program
- **Crisis Response**: If crisis signals appear, prioritize safety, validate distress, strongly encourage professional help
- **Follow Through**: When you recommend a technique, explain HOW to do it step-by-step
- **Measure Progress**: Ask about what's working, adjust recommendations
- **Empower**: Build self-efficacy and hope; celebrate small wins

**Red Flags Requiring Professional Referral:**
- Suicidal ideation or self-harm thoughts
- Severe functional impairment (can't attend class, eat, sleep)
- Psychotic symptoms
- Substance abuse
- Trauma requiring specialized care

**Crisis Resources (mention when appropriate):**
- NIMHANS (National Institute of Mental Health and Neurosciences)
- iCall - psychosocial helpline: 9152987821
- Vandrevala Foundation Helpline: 1860-2662-345
- AASRA Suicide Prevention: 91-22-2754 6669
- Snehi (Chennai): 044-24640050

Remember: You're a bridge to wellness, not a replacement for professional therapy. Empower, educate, and encourage.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
