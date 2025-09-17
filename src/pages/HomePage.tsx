import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Github, ExternalLink } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartSimulator = () => {
    navigate('/simulator');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Turing Machine Simulator
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A modern, interactive Turing machine simulator designed to make computational theory accessible and engaging
          </p>
          <Button 
            onClick={handleStartSimulator}
            size="lg"
            className="text-lg px-8 py-6 h-auto"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Simulator
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Visual Interface</CardTitle>
              <CardDescription>
                Watch your Turing machine execute step by step with an intuitive visual representation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Pre-built Examples</CardTitle>
              <CardDescription>
                Explore classic Turing machines including binary incrementer, palindrome checker, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Custom Machines</CardTitle>
              <CardDescription>
                Design and test your own Turing machines with our built-in editor
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* About Section */}
        <Card className="max-w-4xl mx-auto mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Why This Simulator?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              I created this Turing machine simulator because I wasn't satisfied with the outdated interfaces 
              and limited functionality of existing simulators. This project combines modern web technologies 
              with thoughtful UX design to create an educational tool that's both powerful and enjoyable to use.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're a student learning about computational theory, an educator teaching computer science, 
              or just curious about how computation works at its most fundamental level, this simulator provides 
              an accessible way to explore the fascinating world of Turing machines.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <span>Made with ❤️ by</span>
            <span className="font-semibold">Omar Solieman</span>
          </div>
          <Button 
            variant="outline" 
            asChild
            className="text-sm"
          >
            <a 
              href="https://github.com/omarsolieman" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              View on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;