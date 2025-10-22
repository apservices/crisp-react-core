import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Music, Users, TrendingUp, Headphones, Mic2 } from "lucide-react";

const ComprehensiveDashboard: React.FC = () => {
  const stats = [
    { title: "Total Tracks", value: "156", icon: Music, trend: "+12%" },
    { title: "Sessions", value: "24", icon: Headphones, trend: "+8%" },
    { title: "Mix Time", value: "48h", icon: Play, trend: "+15%" },
    { title: "Followers", value: "1.2K", icon: Users, trend: "+22%" }
  ];

  const recentActivity = [
    { track: "Summer Vibes Mix", time: "2h ago", type: "mix" },
    { track: "Tech House Session", time: "1d ago", type: "session" },
    { track: "Deep House Upload", time: "2d ago", type: "upload" }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="h-8 w-8 text-primary">
                  <stat.icon className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
          <CardDescription>Start your music journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Music className="h-6 w-6" />
              <span className="text-sm">Upload Track</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Play className="h-6 w-6" />
              <span className="text-sm">Start Mix</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Mic2 className="h-6 w-6" />
              <span className="text-sm">Record Session</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <CardDescription>Your latest music activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium text-foreground">{activity.track}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <Badge variant="outline">{activity.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveDashboard;
export { ComprehensiveDashboard };