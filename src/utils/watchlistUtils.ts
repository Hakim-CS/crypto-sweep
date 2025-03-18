
import { CryptoData } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

// Check if a crypto is in the watchlist
export const isInWatchlist = (
  crypto: CryptoData, 
  watchlist: Array<{ cryptoId: string }>
): boolean => {
  return watchlist && 
    Array.isArray(watchlist) && 
    watchlist.some(item => item.cryptoId === crypto.id);
};

// Format the Clerk user ID for Supabase
export const formatClerkUserId = (userId: string): string => {
  return userId.replace('user_', '');
};

// Handle watchlist updates in Supabase
export const updateWatchlistInSupabase = async (
  userId: string,
  newWatchlist: Array<{ cryptoId: string }>
): Promise<void> => {
  const formattedUserId = formatClerkUserId(userId);
  console.log('Using formatted user ID for Supabase:', formattedUserId);

  // Fetch the user's portfolio
  const { data: portfolioData, error: fetchError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', formattedUserId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching portfolio:', fetchError);
    if (fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching portfolio: ${fetchError.message}`);
    }
  }

  if (!portfolioData) {
    // Create a new portfolio if it doesn't exist
    console.log('Creating new portfolio for user:', formattedUserId);
    const { error: createError } = await supabase
      .from('portfolios')
      .insert({
        user_id: formattedUserId,
        watchlist: newWatchlist,
        assets: [],
        balance: 1000
      });

    if (createError) {
      console.error('Error creating portfolio:', createError);
      throw new Error(`Error creating portfolio: ${createError.message}`);
    }
  } else {
    // Update existing portfolio
    console.log('Updating existing portfolio for user:', formattedUserId);
    const { error: updateError } = await supabase
      .from('portfolios')
      .update({ watchlist: newWatchlist })
      .eq('user_id', formattedUserId);

    if (updateError) {
      console.error('Error updating watchlist:', updateError);
      throw new Error(`Error updating watchlist: ${updateError.message}`);
    }
  }
};
