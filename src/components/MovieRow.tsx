import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { motion } from "framer-motion";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onMovieClick: (id: number) => void;
}

const MovieRow = ({ title, movies, onMovieClick }: MovieRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-3"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {title}
          </h2>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
            className="text-primary"
          >
            ✨
          </motion.div>
        </motion.div>
        
        <div className="relative group">
          {/* Left Scroll Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/80 hover:bg-primary/90 backdrop-blur-md border border-white/10 shadow-intense"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </motion.div>
          
          {/* Movies Container */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie, index) => (
              <div key={movie.id} className="flex-none w-56">
                <MovieCard 
                  movie={movie} 
                  onClick={onMovieClick}
                  index={index}
                />
              </div>
            ))}
          </div>
          
          {/* Right Scroll Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/80 hover:bg-primary/90 backdrop-blur-md border border-white/10 shadow-intense"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MovieRow;
