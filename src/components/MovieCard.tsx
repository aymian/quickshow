import { Movie, tmdb } from "@/lib/tmdb";
import { Card } from "@/components/ui/card";
import { Play, Star, Calendar, TrendingUp, Sparkles, Info, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MovieCardProps {
  movie: Movie;
  onClick: (id: number) => void;
  index: number;
}

const MovieCard = ({ movie, onClick, index }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.05,
        rotateX: -10,
        y: -10,
        zIndex: 10,
        transition: { duration: 0.4, type: "spring", stiffness: 300 }
      }}
      style={{ perspective: 1000 }}
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className="group relative overflow-hidden cursor-pointer border-0 bg-transparent"
        onClick={() => onClick(movie.id)}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
          {/* Main Image */}
          <motion.img
            src={tmdb.getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            className="w-full h-full object-cover"
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60" />
          
          {/* Glow Effect on Hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Shimmer Effect */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          )}
          
          {/* Sparkle Icon - Top Right */}
          <motion.div
            className="absolute top-3 right-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={isHovered ? { 
              scale: 1, 
              rotate: 0,
              transition: { type: "spring", stiffness: 200, damping: 15 }
            } : { 
              scale: 0, 
              rotate: -180 
            }}
          >
            <div className="bg-primary/90 backdrop-blur-sm rounded-full p-2 shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </motion.div>
          
          {/* Trending Badge */}
          {movie.vote_average > 7.5 && (
            <motion.div
              className="absolute top-3 left-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-1 bg-accent/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 text-white" />
                <span className="text-xs font-bold text-white">Hot</span>
              </div>
            </motion.div>
          )}
          
          {/* Center Action Buttons */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isHovered ? { 
              opacity: 1, 
              y: 0,
              transition: { type: "spring", stiffness: 300, damping: 25 }
            } : { 
              opacity: 0, 
              y: 20
            }}
          >
            {/* More Details Button */}
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={isHovered ? { scale: 1, y: 0 } : { scale: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(movie.id);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl shadow-2xl backdrop-blur-sm border-2 border-white/20 group/btn"
              >
                <Info className="w-5 h-5 mr-2 group-hover/btn:rotate-12 transition-transform" />
                More Details
              </Button>
            </motion.div>

            {/* Sign Up Free Trial Button */}
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={isHovered ? { scale: 1, y: 0 } : { scale: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              <Button
                onClick={(e) => e.stopPropagation()}
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-6 rounded-xl border-2 border-white/30 hover:border-white/50 shadow-xl group/btn"
              >
                <UserPlus className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                Sign Up Free Trial
              </Button>
            </motion.div>

            {/* Play Icon Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={isHovered ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-2xl border-2 border-white/30"
            >
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            </motion.div>
          </motion.div>
          
          {/* Bottom Info Section - Always Visible */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
            <motion.h3 
              className="font-bold text-base mb-2 line-clamp-2 text-white"
              animate={isHovered ? { y: -10 } : { y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {movie.title}
            </motion.h3>
            
            <motion.div 
              className="flex items-center justify-between gap-2"
              animate={isHovered ? { y: -10 } : { y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                {/* Rating with Stars */}
                <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
                
                {/* Year */}
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Calendar className="w-3 h-3 text-white/80" />
                  <span className="text-xs text-white/80">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Glass Border on Hover */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-primary/50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
};

export default MovieCard;
