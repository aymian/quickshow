const TMDB_API_KEY = '9c15188a1ea7e21203e6d06ab571170a';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YzE1MTg4YTFlYTdlMjEyMDNlNmQwNmFiNTcxMTcwYSIsIm5iZiI6MTc1MjQxNDExOS4wMjMsInN1YiI6IjY4NzNiN2E3NWJlY2FmMTJhZDEwNjExNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OxtQKyMhpJr1GTDH7LEom5_sGdJIlGq0tN3UobBlHTU';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  videos?: {
    results: Video[];
  };
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  spoken_languages: { english_name: string; iso_639_1: string }[];
  production_companies: ProductionCompany[];
  credits?: {
    cast: Cast[];
  };
  similar?: {
    results: Movie[];
  };
}

const fetchFromTMDB = async (endpoint: string) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch from TMDB');
  }
  
  return response.json();
};

export const tmdb = {
  getTrending: async () => {
    const data = await fetchFromTMDB('/trending/movie/week');
    // Fetch videos for first 5 trending movies
    const moviesWithVideos = await Promise.all(
      data.results.slice(0, 5).map(async (movie: Movie) => {
        const videos = await fetchFromTMDB(`/movie/${movie.id}/videos`);
        return { ...movie, videos };
      })
    );
    return { ...data, results: moviesWithVideos };
  },
  getPopular: () => fetchFromTMDB('/movie/popular'),
  getTopRated: () => fetchFromTMDB('/movie/top_rated'),
  getNowPlaying: () => fetchFromTMDB('/movie/now_playing'),
  getUpcoming: () => fetchFromTMDB('/movie/upcoming'),
  getTVShows: async () => {
    const data = await fetchFromTMDB('/tv/popular');
    // Fetch videos for first 5 TV shows
    const showsWithVideos = await Promise.all(
      data.results.slice(0, 5).map(async (show: any) => {
        const videos = await fetchFromTMDB(`/tv/${show.id}/videos`);
        return { ...show, title: show.name, release_date: show.first_air_date, videos };
      })
    );
    return { ...data, results: showsWithVideos };
  },
  getMovieDetails: async (id: number) => {
    const [details, credits, similar, videos] = await Promise.all([
      fetchFromTMDB(`/movie/${id}`),
      fetchFromTMDB(`/movie/${id}/credits`),
      fetchFromTMDB(`/movie/${id}/similar`),
      fetchFromTMDB(`/movie/${id}/videos`)
    ]);
    return { ...details, credits, similar, videos };
  },
  getTVDetails: async (id: number) => {
    const [details, credits, similar, videos] = await Promise.all([
      fetchFromTMDB(`/tv/${id}`),
      fetchFromTMDB(`/tv/${id}/credits`),
      fetchFromTMDB(`/tv/${id}/similar`),
      fetchFromTMDB(`/tv/${id}/videos`)
    ]);
    // normalize to movie-like shape (title, release_date)
    const normalized = {
      ...details,
      title: details.name,
      release_date: details.first_air_date,
    };
    return { ...normalized, credits, similar, videos } as any;
  },
  searchMovies: (query: string) => fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}`),
  
  getImageUrl: (path: string, size: 'w500' | 'w780' | 'original' = 'w500') => {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : '';
  },
  
  getTrailerKey: (movie: Movie): string | null => {
    if (!movie.videos?.results) return null;
    const trailer = movie.videos.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube' && video.official
    ) || movie.videos.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    return trailer?.key || null;
  },
};
