// Update this page (the content is just a fallback if you fail to update the page)

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import Home from "./Home";
import Vault from "./Vault";
import Sessions from "./Sessions";
import Trends from "./Trends";
import Explorer from "./Explorer";
import Studio from "./Studio";
import Profile from "./Profile";
import { SocialFeed } from '@/components/SocialFeed';
import { MobileCompanion } from '@/components/MobileCompanion';

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "vault":
        return <Vault />;
      case "sessions":
        return <Sessions />;
      case "trends":
        return <Trends />;
      case "explorer":
        return <Explorer />;
      case "studio":
        return <Studio />;
      case "profile":
        return <Profile />;
      case "social":
        return <div className="p-6"><SocialFeed /></div>;
      case "mobile":
        return <div className="p-6"><MobileCompanion /></div>;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
