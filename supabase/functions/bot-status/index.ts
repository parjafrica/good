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
    console.log("Bot status function called");
    
    // Check for required environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "missing"
    });
    
    if (!supabaseUrl) {
      console.error("SUPABASE_URL environment variable is not set");
      return new Response(
        JSON.stringify({ 
          error: "Configuration error: SUPABASE_URL is not set",
          code: "MISSING_SUPABASE_URL"
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    if (!supabaseAnonKey) {
      console.error("SUPABASE_ANON_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          error: "Configuration error: SUPABASE_ANON_KEY is not set",
          code: "MISSING_SUPABASE_ANON_KEY"
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
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
      return new Response(
        JSON.stringify({ 
          error: "Failed to create Supabase client",
          details: clientError.message,
          code: "SUPABASE_CLIENT_ERROR"
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    // Generate mock data for demo purposes
    // In production, this would fetch real data from the database
    let mockData;
    try {
      console.log("Generating mock data...");
      mockData = generateMockData();
      console.log("Mock data generated successfully");
    } catch (dataError) {
      console.error("Error generating mock data:", dataError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate data",
          details: dataError.message,
          code: "DATA_GENERATION_ERROR"
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }

    console.log("Returning successful response");
    
    // Return the results
    return new Response(
      JSON.stringify(mockData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Unexpected error in bot-status function:", error);
    
    // Ensure we always return a valid Response object
    try {
      // Convert error to Error instance to ensure it has proper properties
      const err = error instanceof Error ? error : new Error(String(error || "Unknown error occurred"));
      
      return new Response(
        JSON.stringify({ 
          error: err.message || "Unknown error occurred",
          details: err.toString() || "No details available",
          stack: err.stack || "No stack trace available",
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

function generateMockData() {
  try {
    console.log("Starting mock data generation");
    
    const countries = ['South Sudan', 'Kenya', 'Nigeria', 'Uganda', 'Tanzania', 'Global'];
    
    // Generate bots for each country
    const bots = countries.map((country, index) => {
      try {
        console.log(`Generating bot data for ${country}`);
        return {
          id: `${country.toLowerCase().replace(/\s+/g, '_')}_bot`,
          name: `${country} Funding Bot`,
          country: country,
          status: Math.random() > 0.2 ? 'active' : 'paused',
          last_run: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          opportunities_found: Math.floor(Math.random() * 500) + 50,
          reward_points: Math.floor(Math.random() * 2000) + 100,
          success_rate: Math.floor(Math.random() * 30) + 70,
          error_count: Math.floor(Math.random() * 10)
        };
      } catch (botError) {
        console.error(`Error generating bot data for ${country}:`, botError);
        // Return a fallback bot instead of throwing
        return {
          id: `fallback_bot_${index}`,
          name: `${country} Funding Bot`,
          country: country,
          status: 'active',
          last_run: new Date().toISOString(),
          opportunities_found: 100,
          reward_points: 500,
          success_rate: 85,
          error_count: 0
        };
      }
    });
    
    console.log("Generated bots data");
    
    // Generate recent rewards
    const recent_rewards = [];
    try {
      for (let i = 0; i < 10; i++) {
        const country = countries[Math.floor(Math.random() * countries.length)];
        recent_rewards.push({
          bot_id: `${country.toLowerCase().replace(/\s+/g, '_')}_bot`,
          country: country,
          opportunities_found: Math.floor(Math.random() * 20) + 1,
          reward_points: Math.floor(Math.random() * 100) + 10,
          awarded_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
        });
      }
    } catch (rewardError) {
      console.error("Error generating rewards data:", rewardError);
      // Continue with empty rewards array
    }
    
    console.log("Generated rewards data");
    
    // Generate opportunity counts
    const opportunity_counts = {};
    try {
      countries.forEach(country => {
        const total = Math.floor(Math.random() * 500) + 50;
        opportunity_counts[country] = {
          total,
          verified: Math.floor(total * (Math.random() * 0.3 + 0.6)) // 60-90% verified
        };
      });
    } catch (countError) {
      console.error("Error generating opportunity counts:", countError);
      // Provide fallback counts
      countries.forEach(country => {
        opportunity_counts[country] = { total: 100, verified: 80 };
      });
    }
    
    console.log("Generated opportunity counts");
    
    const result = {
      bots,
      recent_rewards,
      statistics: {
        recent_activity: [],
        opportunity_counts,
        total_opportunities: Object.values(opportunity_counts).reduce((sum, count) => sum + (count?.total || 0), 0),
        total_verified: Object.values(opportunity_counts).reduce((sum, count) => sum + (count?.verified || 0), 0)
      },
      system_status: {
        is_active: true,
        last_update: new Date().toISOString()
      }
    };
    
    console.log("Mock data generation completed successfully");
    return result;
    
  } catch (error) {
    console.error("Critical error in generateMockData function:", error);
    
    // Return minimal fallback data
    return {
      bots: [{
        id: "fallback_bot",
        name: "Fallback Bot",
        country: "Global",
        status: "active",
        last_run: new Date().toISOString(),
        opportunities_found: 50,
        reward_points: 100,
        success_rate: 75,
        error_count: 0
      }],
      recent_rewards: [],
      statistics: {
        recent_activity: [],
        opportunity_counts: { "Global": { total: 50, verified: 40 } },
        total_opportunities: 50,
        total_verified: 40
      },
      system_status: {
        is_active: true,
        last_update: new Date().toISOString()
      }
    };
  }
}