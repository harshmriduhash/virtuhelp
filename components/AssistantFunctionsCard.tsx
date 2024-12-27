import React from "react";

interface AssistantFunctionsCardProps {
  onCardClick: (description: string) => void;
}

const data = [
  {
    icon: "🎯",
    title: "Strategy Analysis",
    description:
      "What are the key strategic insights and actionable steps for business content?",
  },
  {
    icon: "📈",
    title: "Growth & Scaling",
    description:
      "How can I apply growth strategies to scale my business effectively?",
  },
  {
    icon: "🚀",
    title: "Implementation Plan",
    description:
      "Help me create a step-by-step implementation plan for business content.",
  },
  {
    icon: "👥",
    title: "Leadership Insights",
    description:
      "What leadership principles can I learn and apply from business content?",
  },
  {
    icon: "⚡",
    title: "Quick Wins",
    description:
      "What are the most immediately actionable insights I can implement?",
  },
  {
    icon: "🎮",
    title: "Business Model",
    description:
      "How can I optimize my business model based on business content?",
  },
  {
    icon: "🎯",
    title: "Success Metrics",
    description:
      "What key metrics should I track to measure success in implementing these strategies?",
  },
  {
    icon: "🚧",
    title: "Challenge Solutions",
    description:
      "What common challenges might I face and how can I overcome them?",
  },
  {
    icon: "🔄",
    title: "Innovation Strategies",
    description:
      "How can I innovate and adapt my business using these principles?",
  },
];

const AssistantFunctionsCard: React.FC<AssistantFunctionsCardProps> = ({
  onCardClick,
}) => {
  return (
    <div className="w-full bg-transparent p-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/15 transition-all duration-200 flex flex-col gap-2 group"
              onClick={() => onCardClick(item.description)}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <h3 className="text-sm font-medium bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          Select a topic to start exploring business insights and strategies
        </p>
      </div>
    </div>
  );
};

export default AssistantFunctionsCard;
