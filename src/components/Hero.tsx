import { Movie, tmdb } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Play, Volume2, VolumeX, Plus, ThumbsUp, Share2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  content: Movie[];
  onMovieClick: (id: number) => void;
}

const Hero = ({ content, onMovieClick }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const navigate = useNavigate();

  const currentMovie = content[currentIndex];
  const trailerKey = currentMovie ? tmdb.getTrailerKey(currentMovie) : null;

  // Auto-slide every 20 seconds (pause on hover)
  useEffect(() => {
    if (content.length === 0 || isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % content.length);
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [content.length, isHovered]);

  if (!currentMovie) return null;

  return (
    <section className="pt-16 md:pt-20 pb-4 md:pb-8">
      <div className="container mx-auto px-2 md:px-4">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto group"
        >
          {/* Background Video/Image */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px]">
            <AnimatePresence mode="wait">
              {isHovered && trailerKey ? (
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&modestbranding=1`}
                    className="w-full h-full object-cover"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="image"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${tmdb.getImageUrl(currentMovie.backdrop_path, 'original')})`,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            {/* Mute Button - Top Right */}
            <AnimatePresence>
              {isHovered && trailerKey && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute top-6 right-6 z-30 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center transition-all"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {content.slice(0, 10).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-4 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-20">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 drop-shadow-2xl line-clamp-2">
                  {currentMovie.title}
                </h1>

                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap">
                  <Badge className="bg-green-600 text-white px-3 py-1 text-sm font-bold">
                    {(currentMovie.vote_average * 10).toFixed(0)}% Match
                  </Badge>
                  <span className="text-lg font-semibold">
                    {new Date(currentMovie.release_date).getFullYear()}
                  </span>
                  <Badge variant="outline" className="border-gray-400 text-white">
                    HD
                  </Badge>
                  <Badge variant="outline" className="border-gray-400 text-white">
                    5.1
                  </Badge>
                </div>

                <p className="text-sm md:text-lg text-gray-200 mb-3 md:mb-6 line-clamp-2 max-w-2xl drop-shadow-lg hidden sm:block">
                  {currentMovie.overview}
                </p>

                {/* Premium Action Buttons */}
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  {/* Play Button - Netflix Style */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => {
                        const isSeries = (currentMovie as any).media_type === 'tv';
                        navigate(isSeries ? `/series-details/${currentMovie.id}` : `/movie-details/${currentMovie.id}`);
                      }}
                      className="gap-1 md:gap-2 px-4 md:px-8 py-3 md:py-6 bg-white hover:bg-white/90 text-black font-bold rounded-md text-sm md:text-lg shadow-xl"
                    >
                      <Play className="w-4 h-4 md:w-6 md:h-6" fill="black" />
                      Play
                    </Button>
                  </motion.div>

                  {/* More Info Button */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => onMovieClick(currentMovie.id)}
                      variant="secondary"
                      className="gap-1 md:gap-2 px-4 md:px-8 py-3 md:py-6 bg-gray-500/70 hover:bg-gray-500/50 backdrop-blur-sm text-white font-bold rounded-md text-sm md:text-lg border-0"
                    >
                      <Play className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">More Info</span>
                      <span className="sm:hidden">Info</span>
                    </Button>
                  </motion.div>

                  {/* Icon Buttons Row - Hidden on small mobile */}
                  <div className="hidden sm:flex items-center gap-2 ml-auto">
                    {/* Add to List */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsInList(!isInList)}
                      className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border-2 border-gray-400 hover:border-white flex items-center justify-center transition-all group/btn"
                    >
                      <Plus
                        className={`w-5 h-5 transition-all ${
                          isInList ? "rotate-45 text-green-400" : "text-white"
                        }`}
                      />
                    </motion.button>

                    {/* Like Button */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsLiked(!isLiked)}
                      className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border-2 border-gray-400 hover:border-white flex items-center justify-center transition-all"
                    >
                      <ThumbsUp
                        className={`w-5 h-5 transition-all ${
                          isLiked ? "text-blue-400 fill-blue-400" : "text-white"
                        }`}
                      />
                    </motion.button>

                    {/* Share Button */}
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border-2 border-gray-400 hover:border-white flex items-center justify-center transition-all"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </motion.button>

                    {/* Download Button - Premium Feature */}
                    <motion.button
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border-2 border-gray-400 hover:border-white flex items-center justify-center transition-all"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
