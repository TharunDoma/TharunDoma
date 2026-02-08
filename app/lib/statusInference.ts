import { supabaseServer as supabase } from './supabaseServer';

/**
 * Parse status messages and extract date information
 * Examples:
 * - "Going out of town for 3 days"
 * - "I'm traveling until Friday"
 * - "Out of office next week"
 */
export async function parseStatusMessage(message: string): Promise<{
  status: string;
  startDate: Date;
  endDate?: Date;
  inferred: boolean;
}> {
  const now = new Date();
  const messageLower = message.toLowerCase();
  
  // Patterns for different status types
  const travelingPatterns = /(?:going out|traveling|out of town|traveling|trip|on vacation|out of country)/i;
  const meetingPatterns = /(?:in a meeting|on a call|in meeting|busy)/i;
  const outOfOfficePatterns = /(?:out of office|oof|not in office)/i;
  
  let status = 'available';
  let endDate: Date | undefined;
  
  // Determine status type
  if (travelingPatterns.test(messageLower)) {
    status = 'traveling';
  } else if (meetingPatterns.test(messageLower)) {
    status = 'in_meeting';
  } else if (outOfOfficePatterns.test(messageLower)) {
    status = 'out_of_office';
  } else if (messageLower.includes('back')) {
    status = 'available';
  }
  
  // Extract duration
  endDate = extractDurationFromMessage(message, now);
  
  return {
    status,
    startDate: now,
    endDate,
    inferred: true
  };
}

/**
 * Extract duration from natural language
 * Examples: "3 days", "until Friday", "next week", etc.
 */
function extractDurationFromMessage(message: string, baseDate: Date): Date | undefined {
  const daysPattern = /(\d+)\s*days?/i;
  const hoursPattern = /(\d+)\s*hours?/i;
  const dayOfWeekPattern = /(?:until|till|back on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
  const nextWeekPattern = /next\s*week/i;
  const nextMonthPattern = /next\s*month/i;
  
  const daysMatch = message.match(daysPattern);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + days);
    return endDate;
  }
  
  const hoursMatch = message.match(hoursPattern);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10);
    const endDate = new Date(baseDate);
    endDate.setHours(endDate.getHours() + hours);
    return endDate;
  }
  
  const dayOfWeekMatch = message.match(dayOfWeekPattern);
  if (dayOfWeekMatch) {
    const targetDay = getDayOfWeekDate(dayOfWeekMatch[1], baseDate);
    return targetDay;
  }
  
  if (nextWeekPattern.test(message)) {
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + 7);
    return endDate;
  }
  
  if (nextMonthPattern.test(message)) {
    const endDate = new Date(baseDate);
    endDate.setMonth(endDate.getMonth() + 1);
    return endDate;
  }
  
  // Default: 24 hours if no duration specified
  const defaultEnd = new Date(baseDate);
  defaultEnd.setHours(defaultEnd.getHours() + 24);
  return defaultEnd;
}

/**
 * Get date for a day of week (next occurrence)
 */
function getDayOfWeekDate(dayName: string, baseDate: Date): Date {
  const daysMap: Record<string, number> = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 0
  };
  
  const targetDayNum = daysMap[dayName.toLowerCase()];
  const date = new Date(baseDate);
  const dayNum = date.getDay();
  
  let daysUntilTarget = targetDayNum - dayNum;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }
  
  date.setDate(date.getDate() + daysUntilTarget);
  return date;
}

/**
 * Store status in database
 */
export async function storeStatus(
  statusMessage: string,
  parseResult: Awaited<ReturnType<typeof parseStatusMessage>>
) {
  try {
    const { error } = await supabase
      .from('profile_status_log')
      .insert([
        {
          status: parseResult.status,
          status_message: statusMessage,
          start_date: parseResult.startDate,
          end_date: parseResult.endDate,
          is_inferred: parseResult.inferred
        }
      ]);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error storing status:', error);
    throw error;
  }
}

/**
 * Get formatted status for chat context
 */
export async function getStatusContext(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('profile_status_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      return 'Tharun is currently available.';
    }
    
    const now = new Date();
    const endDate = data.end_date ? new Date(data.end_date) : null;
    
    // Check if status is still valid
    if (endDate && endDate < now) {
      return 'Tharun is currently available.';
    }
    
    let context = `Tharun's current status: ${data.status}. `;
    
    if (data.status_message) {
      context += `Details: "${data.status_message}". `;
    }
    
    if (endDate) {
      const daysUntilEnd = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      context += `Expected to be back in approximately ${daysUntilEnd} day(s).`;
    }
    
    return context;
  } catch (error) {
    console.error('Error getting status context:', error);
    return 'Tharun is currently available.';
  }
}

/**
 * Check if user is currently available
 */
export async function isAvailable(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profile_status_log')
      .select('status, end_date')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      return true; // Default to available
    }
    
    // Check if status has expired
    if (data.end_date && new Date(data.end_date) < new Date()) {
      return true;
    }
    
    return data.status === 'available';
  } catch (error) {
    console.error('Error checking availability:', error);
    return true;
  }
}
