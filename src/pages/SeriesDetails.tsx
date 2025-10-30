import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tmdb } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";

interface TVDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  seasons?: { season_number: number; name: string; episode_count: number; poster_path: string | null }[];
  genres?: { id: number; name: string }[];
}

const SeriesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<TVDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const details = await tmdb.getTVDetails(Number(id));
        setData(details as any);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (!data) return null;

  const backdrop = tmdb.getImageUrl((data as any).backdrop_path, 'w780');
  const poster = tmdb.getImageUrl((data as any).poster_path, 'w500');

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
              <h1 className="text-2xl md:text-4xl font-bold mb-2">{(data as any).title || data.name}</h1>
              <div className="flex gap-3 mb-6 text-sm text-gray-300 flex-wrap">
                <span>{new Date((data as any).release_date || data.first_air_date).getFullYear()}</span>
                <span>• {data.genres?.map(g => g.name).join(', ')}</span>
              </div>
              <div className="flex gap-3 mb-6">
                <Button className="bg-primary">Play Now</Button>
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
              </div>
            </div>
          </div>

          {/* Seasons */}
          {data.seasons && data.seasons.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Seasons</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {data.seasons.map((s) => (
                  <div key={s.season_number} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3">
                    {s.poster_path ? (
                      <img src={tmdb.getImageUrl(s.poster_path, 'w500')} className="rounded-lg mb-2" />
                    ) : (
                      <div className="h-32 bg-gray-800 rounded-lg mb-2" />
                    )}
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.episode_count} episodes</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetails;


