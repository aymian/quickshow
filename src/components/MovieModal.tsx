import { MovieDetails, tmdb } from "@/lib/tmdb";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X, Star, UserPlus, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface MovieModalProps {
  movie: MovieDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovieModal = ({ movie, isOpen, onClose }: MovieModalProps) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const navigate = useNavigate();
  
  if (!movie) return null;

  const formatBudget = (amount: number) => {
    if (amount === 0) return 'N/A';
    return `$${(amount / 1000000).toFixed(0)}M`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-6xl h-[90vh] p-0 border-0 bg-transparent overflow-hidden">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-black rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col"
            >
              {/* Hero Section with Backdrop */}
              <div className="relative h-[45%] flex-shrink-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${tmdb.getImageUrl(movie.backdrop_path, 'original')})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                </div>
                
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-6 right-6 z-50 w-14 h-14 rounded-full bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
                
                {/* Title and Meta Info */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl font-bold mb-4"
                  >
                    {movie.title}
                  </motion.h1>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 mb-6 flex-wrap"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xl font-bold">{movie.vote_average.toFixed(1)}</span>
                    </div>
                    <span className="text-lg">{new Date(movie.release_date).getFullYear()}</span>
                    <Badge variant="secondary" className="bg-purple-600/80 text-white px-3 py-1">
                      Movie
                    </Badge>
                    <span className="text-lg">{formatDuration(movie.runtime)}</span>
                  </motion.div>
                  
                  {/* Action Buttons */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-4 flex-wrap"
                  >
                    <Button 
                      size="lg" 
                      className="gap-2 px-8 py-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                    >
                      <Play className="w-5 h-5" fill="white" />
                      Watch Trailer
                    </Button>
                    <Button 
                      size="lg"
                      onClick={() => navigate("/signup")}
                      className="gap-2 px-8 py-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                    >
                      <UserPlus className="w-5 h-5" />
                      Sign Up to Watch
                    </Button>
                    <Button 
                      size="icon"
                      variant="outline"
                      className="w-12 h-12 rounded-full bg-gray-800/50 border-gray-700 hover:bg-gray-700"
                    >
                      <span className="text-xl">+</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              {/* Scrollable Content Section */}
              <ScrollArea className="flex-1">
                <div className="p-8 space-y-8">
                  {/* Overview Section */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h2 className="text-3xl font-bold mb-4">Overview</h2>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {movie.overview}
                    </p>
                  </motion.div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Cast */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Cast Section */}
                      {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <h2 className="text-2xl font-bold mb-4">Cast</h2>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {movie.credits.cast.slice(0, 6).map((actor, index) => (
                              <motion.div
                                key={actor.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                className="text-center"
                              >
                                <div 
                                  className="relative w-full aspect-square rounded-full overflow-hidden mb-2 border-2 border-gray-700 group/img cursor-pointer"
                                  onClick={() => actor.profile_path && setZoomedImage(tmdb.getImageUrl(actor.profile_path, 'original'))}
                                >
                                  {actor.profile_path ? (
                                    <>
                                      <img
                                        src={tmdb.getImageUrl(actor.profile_path, 'w500')}
                                        alt={actor.name}
                                        className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-colors flex items-center justify-center">
                                        <ZoomIn className="w-6 h-6 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                      </div>
                                    </>
                                  ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                      <span className="text-2xl">{actor.name.charAt(0)}</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm font-semibold truncate">{actor.name}</p>
                                <p className="text-xs text-gray-400 truncate">{actor.character}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gray-900/50 rounded-2xl p-6 space-y-4"
                      >
                        <h2 className="text-2xl font-bold mb-4">Details</h2>
                        
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Genre:</p>
                          <p className="text-white font-semibold">
                            {movie.genres.map(g => g.name).join(', ')}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-1">Duration:</p>
                          <p className="text-white font-semibold">{formatDuration(movie.runtime)}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-1">Language:</p>
                          <p className="text-white font-semibold uppercase">
                            {movie.spoken_languages?.[0]?.iso_639_1 || 'EN'}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-1">Status:</p>
                          <p className="text-green-400 font-semibold">{movie.status}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-1">Budget:</p>
                          <p className="text-white font-semibold">{formatBudget(movie.budget)}</p>
                        </div>
                      </motion.div>

                      {/* Production Companies */}
                      {movie.production_companies && movie.production_companies.length > 0 && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="bg-gray-900/50 rounded-2xl p-6"
                        >
                          <h2 className="text-xl font-bold mb-4">Production</h2>
                          <div className="space-y-2">
                            {movie.production_companies.slice(0, 3).map((company) => (
                              <p key={company.id} className="text-gray-300">{company.name}</p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Similar Content */}
                  {movie.similar && movie.similar.results && movie.similar.results.length > 0 && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">Similar Content</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {movie.similar.results.slice(0, 4).map((similar, index) => (
                          <motion.div
                            key={similar.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1 + index * 0.1 }}
                            className="group cursor-pointer"
                          >
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2">
                              <img
                                src={tmdb.getImageUrl(similar.poster_path, 'w500')}
                                alt={similar.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <Play className="w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                              </div>
                            </div>
                            <p className="text-sm font-semibold truncate">{similar.title}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <span>{new Date(similar.release_date).getFullYear()}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span>{similar.vote_average.toFixed(1)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>

    {/* Image Zoom Modal */}
    <AnimatePresence>
      {zoomedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </motion.button>
          
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={zoomedImage}
            alt="Zoomed view"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default MovieModal;
