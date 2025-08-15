import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_BASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_API_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});


export const updateSearchCount = async (query: string, movie: Movie) => {
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;

    const { error } = await supabase.rpc('increment_popular_search', {
        p_search_term: query,
        p_movie_id: movie.id,     // kolom di DB bertipe int8 → aman kirim number
        p_title: movie.title,
        p_poster_url: posterUrl,
    });

    if (error) {
        // biar gampang debug saat dev
        console.error('RPC increment_popular_search failed:', error);
        throw error;
    }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const { data, error } = await supabase
      .from('popular')
      .select('id, movie_id, title, poster_url, count, search_term, created_at')
      .order('count', { ascending: false }) // descending
      .limit(5);

    if (error) throw error;

    // Normalisasi tipe int8 (bigint) → number di JS
    const normalized = (data ?? []).map((row) => ({
      movie_id: Number(row.movie_id),
      count: Number(row.count),
      title: row.title,
      poster_url: row.poster_url,
      search_term: row.search_term,
    })) as TrendingMovie[];

    return normalized;
  } catch (err) {
    console.error('getTrendingMovies error:', err);
    return undefined;
  }
};