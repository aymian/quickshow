import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tmdb, MovieDetails as MovieDetailsType } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const details = await tmdb.getMovieDetails(Number(id));
        setData(details as any);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
    );
  }

  if (!data) return null;

  const backdrop = tmdb.getImageUrl(data.backdrop_path, 'w780');
  const poster = tmdb.getImageUrl(data.poster_path, 'w500');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        {backdrop && (
          <img src={backdrop} alt="" className="w-full h-64 md:h-96 object-cover opacity-60" />
        )}
        <div className="container mx-auto px-4 -mt-20 md:-mt-28 relative">
          <div className="flex gap-6">
            {poster && <img src={poster} alt="" className="w-32 md:w-48 rounded-xl border border-white/10" />}
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{data.title}</h1>
              <p className="text-gray-300 mb-4">{data.tagline}</p>
              <div className="flex gap-3 mb-6 text-sm text-gray-300 flex-wrap">
                <span>{new Date(data.release_date).getFullYear()}</span>
                <span>• {data.runtime} min</span>
                <span>• {data.genres?.map(g => g.name).join(', ')}</span>
              </div>
              <div className="flex gap-3 mb-6">
                <Button className="bg-primary" onClick={() => {}}>Play Now</Button>
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
              </div>
            </div>
          </div>
          <div className="mt-6 max-w-4xl">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-gray-300">{data.overview}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;


