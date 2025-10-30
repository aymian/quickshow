import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Movie, MovieDetails, tmdb } from "@/lib/tmdb";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MovieRow from "@/components/MovieRow";
import MovieModal from "@/components/MovieModal";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const Index = () => {
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<Movie[] | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: tmdb.getTrending,
  });

  const { data: popular } = useQuery({
    queryKey: ['popular'],
    queryFn: tmdb.getPopular,
  });

  const { data: topRated } = useQuery({
    queryKey: ['topRated'],
    queryFn: tmdb.getTopRated,
  });

  const { data: nowPlaying } = useQuery({
    queryKey: ['nowPlaying'],
    queryFn: tmdb.getNowPlaying,
  });

  const { data: tvShows } = useQuery({
    queryKey: ['tvShows'],
    queryFn: tmdb.getTVShows,
  });

  const { data: movieDetails } = useQuery({
    queryKey: ['movie', selectedMovieId],
    queryFn: () => selectedMovieId ? tmdb.getMovieDetails(selectedMovieId) : null,
    enabled: !!selectedMovieId,
  });

  const handleSearch = async (query: string) => {
    try {
      const results = await tmdb.searchMovies(query);
      setSearchResults(results.results);
      toast.success(`Found ${results.results.length} movies`);
    } catch (error) {
      toast.error("Failed to search movies");
    }
  };

  const handleMovieClick = (id: number) => {
    setSelectedMovieId(id);
  };

  // Combine trending movies and TV shows for hero carousel
  const heroContent = [
    ...(trending?.results || []),
    ...(tvShows?.results || []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />
      
      <main className="pb-24 md:pb-0">
        {heroContent.length > 0 && (
          <Hero content={heroContent} onMovieClick={handleMovieClick} />
        )}

        {searchResults ? (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Search Results</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.map((movie) => (
                  <div key={movie.id} className="cursor-pointer" onClick={() => handleMovieClick(movie.id)}>
                    <img
                      src={tmdb.getImageUrl(movie.poster_path, 'w500')}
                      alt={movie.title}
                      className="w-full rounded-lg hover:scale-105 transition-smooth"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            {trending?.results && (
              <MovieRow
                title="Trending Now"
                movies={trending.results}
                onMovieClick={handleMovieClick}
              />
            )}

            {popular?.results && (
              <MovieRow
                title="Popular on QuickShow"
                movies={popular.results}
                onMovieClick={handleMovieClick}
              />
            )}

            {topRated?.results && (
              <MovieRow
                title="Top Rated Masterpieces"
                movies={topRated.results}
                onMovieClick={handleMovieClick}
              />
            )}

            {nowPlaying?.results && (
              <MovieRow
                title="Now Playing in Theaters"
                movies={nowPlaying.results}
                onMovieClick={handleMovieClick}
              />
            )}
          </>
        )}
      </main>

      <MovieModal
        movie={movieDetails}
        isOpen={!!selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />

      <Footer />
      <MobileNav />

      {/* Floating Chat Icon */}
      {user && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/chat")}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-r from-primary to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-40 hover:shadow-primary/50 transition-shadow"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </div>
  );
};

export default Index;
