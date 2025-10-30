import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MobileNav from "@/components/MobileNav";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About QuickShow</h1>
          <p className="text-lg text-gray-300 mb-4">
            QuickShow is your ultimate destination for streaming movies and TV shows.
          </p>
          <p className="text-gray-400">
            We provide a premium streaming experience with features that go beyond Netflix.
          </p>
        </motion.div>
      </div>
      <MobileNav />
    </div>
  );
};

export default About;
