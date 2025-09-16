import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary">
              Ready to Build
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your blank canvas awaits. Start creating something amazing.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="shadow-soft">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="shadow-soft">
              Learn More
            </Button>
          </div>
          
          <Card className="w-full max-w-4xl p-8 shadow-soft border-0 bg-card/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Modern</h3>
                <p className="text-sm text-muted-foreground">
                  Built with the latest technologies and best practices.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Flexible</h3>
                <p className="text-sm text-muted-foreground">
                  Easily customizable to fit your unique requirements.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Scalable</h3>
                <p className="text-sm text-muted-foreground">
                  Designed to grow with your project and team.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Index;