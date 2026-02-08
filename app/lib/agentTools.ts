import { supabaseServer as supabase } from './supabaseServer';
import { parseStatusMessage, storeStatus, getStatusContext } from './statusInference';
import { semanticSearch, getCurrentStatus } from './embeddings';

export interface ToolCall {
  name: string;
  input: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * Admin-only tools (requires ADMIN_SECRET)
 */
export const ADMIN_TOOLS = {
  update_status: {
    description: 'Update your availability status (e.g., "traveling", "in meeting", "available")',
    input_schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Status message (e.g., "Going out of town for 3 days" or "I\'m back")'
        }
      },
      required: ['message']
    },
    execute: async (input: { message: string }): Promise<ToolResult> => {
      try {
        const parseResult = await parseStatusMessage(input.message);
        await storeStatus(input.message, parseResult);
        
        return {
          success: true,
          result: {
            message: `Status updated to "${parseResult.status}". Message: "${input.message}"`,
            endDate: parseResult.endDate?.toISOString()
          }
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  },

  update_achievement: {
    description: 'Add a new achievement or update to knowledge base',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Achievement title (e.g., "AWS Certification Completed")'
        },
        content: {
          type: 'string',
          description: 'Full description of the achievement'
        },
        category: {
          type: 'string',
          enum: ['achievement', 'update', 'skill', 'experience'],
          description: 'Category of the achievement'
        }
      },
      required: ['title', 'content', 'category']
    },
    execute: async (input: {
      title: string;
      content: string;
      category: string;
    }): Promise<ToolResult> => {
      try {
        const { error } = await supabase
          .from('knowledge_base')
          .insert([
            {
              title: input.title,
              content: input.content,
              category: input.category,
              is_active: true
            }
          ]);
        
        if (error) throw error;
        
        return {
          success: true,
          result: `Achievement "${input.title}" added to knowledge base`
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to add achievement: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  },

  schedule_unavailability: {
    description: 'Schedule a future unavailability period',
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Reason for unavailability' },
        start_date: { type: 'string', description: 'ISO date string' },
        end_date: { type: 'string', description: 'ISO date string' }
      },
      required: ['reason', 'start_date', 'end_date']
    },
    execute: async (input: {
      reason: string;
      start_date: string;
      end_date: string;
    }): Promise<ToolResult> => {
      try {
        const { error } = await supabase
          .from('profile_status_log')
          .insert([
            {
              status: 'out_of_office',
              status_message: input.reason,
              start_date: input.start_date,
              end_date: input.end_date,
              is_inferred: false
            }
          ]);
        
        if (error) throw error;
        
        return {
          success: true,
          result: `Unavailability scheduled from ${input.start_date} to ${input.end_date}`
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  }
};

/**
 * Public tools (available to all users)
 */
export const PUBLIC_TOOLS = {
  search_documents: {
    description: 'Search through Tharun\'s documents and knowledge base using semantic search',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "AWS projects", "certifications")'
        },
        limit: {
          type: 'number',
          description: 'Number of results to return (default: 5)'
        }
      },
      required: ['query']
    },
    execute: async (input: { query: string; limit?: number }): Promise<ToolResult> => {
      try {
        const results = await semanticSearch(input.query, input.limit || 5);
        
        if (results.length === 0) {
          return {
            success: true,
            result: 'No relevant documents found'
          };
        }
        
        return {
          success: true,
          result: results.map(r => ({
            title: r.file_name || 'Untitled',
            excerpt: r.extracted_text?.substring(0, 200) || r.content?.substring(0, 200),
            category: r.category
          }))
        };
      } catch (error) {
        return {
          success: false,
          error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  },

  get_current_status: {
    description: 'Get Tharun\'s current availability status',
    input_schema: { type: 'object', properties: {} },
    execute: async (): Promise<ToolResult> => {
      try {
        const statusContext = await getStatusContext();
        
        return {
          success: true,
          result: statusContext
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to get status: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  },

  query_achievements: {
    description: 'Get Tharun\'s achievements, certifications, and recent updates',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['achievement', 'update', 'skill', 'experience', 'all'],
          description: 'Type of achievement to query'
        }
      }
    },
    execute: async (input: { category?: string }): Promise<ToolResult> => {
      try {
        let query = supabase
          .from('knowledge_base')
          .select('*')
          .eq('is_active', true);
        
        if (input.category && input.category !== 'all') {
          query = query.eq('category', input.category);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return {
          success: true,
          result: data || []
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to query achievements: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  }
};

/**
 * Execute a tool call
 */
export async function executeTool(
  toolName: string,
  toolInput: Record<string, any>,
  isAdmin: boolean = false
): Promise<ToolResult> {
  const allTools = isAdmin
    ? { ...ADMIN_TOOLS, ...PUBLIC_TOOLS }
    : PUBLIC_TOOLS;
  
  const tool = (allTools as any)[toolName];
  
  if (!tool) {
    return {
      success: false,
      error: `Tool "${toolName}" not found`
    };
  }
  
  if (!isAdmin && ADMIN_TOOLS.hasOwnProperty(toolName)) {
    return {
      success: false,
      error: `Access denied: "${toolName}" is admin-only`
    };
  }
  
  try {
    return await tool.execute(toolInput);
  } catch (error) {
    return {
      success: false,
      error: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Format tools for Gemini API
 */
export function formatToolsForGemini(isAdmin: boolean = false) {
  const tools = isAdmin
    ? { ...ADMIN_TOOLS, ...PUBLIC_TOOLS }
    : PUBLIC_TOOLS;
  
  return Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: tool.input_schema
  }));
}

/**
 * Log tool execution
 */
export async function logToolExecution(
  toolName: string,
  toolInput: Record<string, any>,
  toolOutput: Record<string, any>,
  sessionId: string,
  isAdmin: boolean
) {
  try {
    await supabase
      .from('agent_tools_log')
      .insert([
        {
          tool_name: toolName,
          tool_input: toolInput,
          tool_output: toolOutput,
          session_id: sessionId,
          is_admin: isAdmin
        }
      ]);
  } catch (error) {
    console.error('Failed to log tool execution:', error);
  }
}
