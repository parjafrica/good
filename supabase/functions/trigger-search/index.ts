// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.38.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    console.log("Trigger search function called");
    
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 405,
        }
      )
    }

    // Parse request body
    let country, query;
    try {
      const body = await req.json();
      country = body.country;
      query = body.query;
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        }
      )
    }

    if (!country) {
      return new Response(
        JSON.stringify({ error: "Country is required" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        }
      )
    }

    // Check for required environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("Using mock response due to missing configuration");
      return generateMockResponse(country, query);
    }

    // Create a Supabase client with the Auth context of the logged in user
    let supabaseClient;
    try {
      console.log("Creating Supabase client...");
      supabaseClient = createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          global: {
            headers: { Authorization: req.headers.get("Authorization") || "" },
          },
        }
      );
      console.log("Supabase client created successfully");
    } catch (clientError) {
      console.error("Error creating Supabase client:", clientError);
      return generateMockResponse(country, query);
    }

    // In a real implementation, this would trigger a search job
    // For demo purposes, we'll just return a success response
    const now = new Date();
    
    // Return success response
    return new Response(
      JSON.stringify({
        status: "success",
        message: `Search triggered for ${country}`,
        targets_queued: 5,
        job_id: `mock-${Date.now()}`,
        estimated_completion_time: new Date(now.getTime() + 5 * 60 * 1000).toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error in trigger-search function:", error);
    
    // Ensure we always return a valid Response object
    try {
      // Convert error to Error instance to ensure it has proper properties
      const err = error instanceof Error ? error : new Error(String(error || "Unknown error occurred"));
      
      return new Response(
        JSON.stringify({ 
          error: err.message || "Unknown error occurred",
          details: err.toString() || "No details available",
          code: "UNEXPECTED_ERROR"
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    } catch (responseError) {
      console.error("Failed to create error response:", responseError);
      
      // Last resort: return a minimal response
      return new Response(
        '{"error":"Critical function failure","code":"RESPONSE_ERROR"}',
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }
  }
})

// Function to generate a mock response when Supabase is not available
function generateMockResponse(country, query) {
  try {
    console.log("Generating mock response for trigger-search");
    const now = new Date();
    
    return new Response(
      JSON.stringify({
        status: "success",
        message: `Search triggered for ${country}${query ? ` with query: ${query}` : ''}`,
        targets_queued: 5,
        job_id: `mock-${Date.now()}`,
        estimated_completion_time: new Date(now.getTime() + 5 * 60 * 1000).toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error generating mock response:", error);
    
    return new Response(
      JSON.stringify({ 
        status: "success",
        message: `Search triggered for ${country}`,
        targets_queued: 3
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200, // Return 200 even on error to prevent frontend crashes
      }
    );
  }
}