import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

const Premium = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const plans = [
    {
      name: "Basic",
      price: "$9.99",
      period: "/month",
      description: "Perfect for casual viewers",
      features: [
        "Watch on 1 device",
        "HD quality (720p)",
        "Unlimited movies & TV shows",
        "Cancel anytime",
        "Ad-free experience",
      ],
      color: "from-gray-600 to-gray-700",
      popular: false,
    },
    {
      name: "Standard",
      price: "$14.99",
      period: "/month",
      description: "Most popular choice",
      features: [
        "Watch on 2 devices simultaneously",
        "Full HD quality (1080p)",
        "Unlimited movies & TV shows",
        "Download and watch offline",
        "Cancel anytime",
        "Ad-free experience",
        "Priority customer support",
      ],
      color: "from-primary to-purple-600",
      popular: true,
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "/month",
      description: "Ultimate streaming experience",
      features: [
        "Watch on 4 devices simultaneously",
        "4K Ultra HD + HDR quality",
        "Unlimited movies & TV shows",
        "Download and watch offline",
        "Cancel anytime",
        "Ad-free experience",
        "24/7 Premium support",
        "Early access to new releases",
        "Exclusive premium content",
      ],
      color: "from-yellow-500 to-orange-600",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header onSearch={() => {}} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate(user ? "/" : "/signup")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
            <Crown className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Upgrade to Premium</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock unlimited entertainment with crystal-clear quality and exclusive features
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-primary to-purple-600 rounded-full text-sm font-bold">
                    <Star className="w-4 h-4" fill="currentColor" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div
                className={`h-full bg-gray-900/50 backdrop-blur-xl rounded-3xl border ${
                  plan.popular ? "border-primary shadow-2xl shadow-primary/20" : "border-gray-800"
                } overflow-hidden transition-all hover:scale-105`}
              >
                {/* Card Header */}
                <div className={`p-8 bg-gradient-to-br ${plan.color} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-white/80 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/80">{plan.period}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => {
                      if (!user) {
                        navigate("/signup");
                      } else {
                        // Handle subscription
                        alert(`Subscribing to ${plan.name} plan`);
                      }
                    }}
                    className={`w-full h-14 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-bold text-lg rounded-xl shadow-lg`}
                  >
                    {profile?.is_premium ? "Switch Plan" : "Get Started"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Why Go Premium?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "Instant streaming with zero buffering",
              },
              {
                icon: <Crown className="w-8 h-8" />,
                title: "Premium Content",
                description: "Exclusive movies and early releases",
              },
              {
                icon: <Check className="w-8 h-8" />,
                title: "No Ads",
                description: "Uninterrupted viewing experience",
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "4K Quality",
                description: "Crystal clear Ultra HD streaming",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 text-center hover:border-primary/50 transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! You can cancel your subscription at any time with no cancellation fees.",
              },
              {
                q: "Can I change my plan?",
                a: "Absolutely! You can upgrade or downgrade your plan anytime from your account settings.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! All new users get a 7-day free trial to experience premium features.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and various local payment methods.",
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
};

export default Premium;
